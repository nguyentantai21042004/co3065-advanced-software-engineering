package com.aicoach.messaging;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aicoach.config.RabbitMQConfig;
import com.aicoach.infrastructure.llm.GeminiClient;
import com.aicoach.models.CVAnalysisMessage;
import com.aicoach.models.ExtractionNotifyMessage;
import com.aicoach.repository.postgresql.CVAnalysisResultRepository;
import com.aicoach.repository.postgresql.ExtractionResultRepository;
import com.aicoach.repository.postgresql.entity.CVAnalysisResultEntity;
import com.aicoach.repository.postgresql.entity.ExtractionResultEntity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Consumer for CV Analysis Tasks
 * 
 * Flow:
 * 1. Receive analysis message with extractionResultId
 * 2. Fetch raw text from database using extractionResultId
 * 3. Run multiple prompts to extract structured data:
 * - cv-basic-info: name, email, phone, gender, address, date_of_birth
 * - cv-education: school, degree, major, graduation_date
 * - cv-work-experience: work experience array
 * - cv-skills: skills with levels/points
 * - cv-certificates-languages: certificates and languages
 * 4. Combine results and save to database
 * 5. Send notification
 */
@Component
@Profile("consumer")
@RequiredArgsConstructor
@Slf4j
public class CVAnalysisConsumer {

        private final ExtractionResultRepository extractionResultRepository;
        private final CVAnalysisResultRepository cvAnalysisResultRepository;
        private final GeminiClient geminiClient;
        private final ExtractionNotifyProducer extractionNotifyProducer;

        private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        @RabbitListener(queues = RabbitMQConfig.CV_ANALYSIS_QUEUE)
        @Transactional
        public void processAnalysisTask(CVAnalysisMessage message) {
                log.info("Received CV analysis task: taskId={}, extractionResultId={}, fileId={}",
                                message.getTaskId(), message.getExtractionResultId(), message.getFileId());

                try {
                        // Step 1: Fetch raw text from database
                        UUID extractionResultId = UUID.fromString(message.getExtractionResultId());
                        ExtractionResultEntity extractionResult = extractionResultRepository
                                        .findById(extractionResultId)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Extraction result not found: " + extractionResultId));

                        String rawText = extractionResult.getRawText();
                        if (rawText == null || rawText.trim().isEmpty()) {
                                log.warn("Raw text is empty for extractionResultId: {}", extractionResultId);
                                throw new RuntimeException("Raw text is empty, cannot analyze CV");
                        }

                        log.info("Fetched raw text from DB: length={}", rawText.length());

                        // Step 2: Prepare template variables
                        Map<String, Object> templateData = new HashMap<>();
                        templateData.put("today", LocalDate.now().format(DATE_FORMATTER));

                        // Step 3: Run prompts to extract structured data (merged basic+education)
                        log.info("Running CV analysis prompts (merged basic info + education)...");

                        String basicEducationJson = runPrompt("cv-basic-education", templateData, rawText);

                        String workExperienceJson = runPrompt("cv-work-experience", templateData, rawText);

                        // cv-skills may generate longer responses with detailed skill assessments
                        // Use higher maxTokens (8192) to handle complex skill extraction
                        String skillsJson = runPrompt("cv-skills", templateData, rawText, null, 8192);

                        String certificatesLanguagesJson = runPrompt("cv-certificates-languages", templateData,
                                        rawText);

                        // Step 4: Combine all results into single JSON
                        String combinedAnalysis = combineAnalysisResults(
                                        basicEducationJson, basicEducationJson, workExperienceJson, skillsJson,
                                        certificatesLanguagesJson);
                        log.info("Analysis completed, combined result length: {}", combinedAnalysis.length());

                        // Step 5: Save analysis results to database
                        log.info("Saving CV analysis results to database");
                        CVAnalysisResultEntity analysisEntity = new CVAnalysisResultEntity(
                                        extractionResultId,
                                        extractionResult.getFileId(),
                                        basicEducationJson,
                                        basicEducationJson,
                                        workExperienceJson,
                                        skillsJson,
                                        certificatesLanguagesJson,
                                        combinedAnalysis);
                        CVAnalysisResultEntity saved = cvAnalysisResultRepository.save(analysisEntity);
                        log.info("CV analysis results saved: id={}, extractionResultId={}",
                                        saved.getId(), extractionResultId);

                        // Step 6: Send notification
                        extractionNotifyProducer.sendNotify(
                                        new ExtractionNotifyMessage(extractionResultId.toString()));

                        log.info("CV analysis task completed successfully: taskId={}, extractionResultId={}",
                                        message.getTaskId(), message.getExtractionResultId());

                } catch (IllegalArgumentException e) {
                        log.error("Validation error for analysis task: taskId={}, error={}",
                                        message.getTaskId(), e.getMessage());
                        throw e;

                } catch (Exception e) {
                        log.error("Error processing CV analysis task: taskId={}, error={}",
                                        message.getTaskId(), e.getMessage(), e);

                        // Throw exception to trigger DLQ - Spring AMQP will handle retries based on configuration
                        log.error("CV analysis task failed: taskId={}, message will be sent to DLQ",
                                        message.getTaskId());
                        throw new RuntimeException("CV analysis task failed: " + e.getMessage(), e);
                }
        }

        /**
         * Run a prompt template with data and return JSON response
         * Extracts JSON from LLM response (removes markdown code blocks if present)
         */
        private String runPrompt(String templateName, Map<String, Object> templateData, String rawText)
                        throws Exception {
                log.info("Running prompt: {}", templateName);
                String response = geminiClient.generateWithTemplate(templateName, templateData, rawText);
                return extractJsonFromResponse(response);
        }

        /**
         * Run a prompt template with custom temperature and maxTokens
         * Extracts JSON from LLM response (removes markdown code blocks if present)
         */
        private String runPrompt(String templateName, Map<String, Object> templateData, String rawText,
                        Double temperature, Integer maxTokens) throws Exception {
                log.info("Running prompt: {} (custom params: temperature={}, maxTokens={})",
                                templateName, temperature, maxTokens);
                String response = geminiClient.generateWithTemplate(templateName, templateData, rawText, temperature,
                                maxTokens);
                return extractJsonFromResponse(response);
        }

        /**
         * Extract JSON from LLM response
         * Removes markdown code blocks (```json ... ```) if present
         */
        private String extractJsonFromResponse(String response) {
                if (response == null || response.trim().isEmpty()) {
                        return "{}";
                }

                String cleaned = response.trim();

                // Remove markdown code blocks
                if (cleaned.startsWith("```")) {
                        int startIdx = cleaned.indexOf("{");
                        int endIdx = cleaned.lastIndexOf("}");
                        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                                cleaned = cleaned.substring(startIdx, endIdx + 1);
                        }
                }

                // Ensure it's valid JSON by checking braces
                if (!cleaned.startsWith("{") || !cleaned.endsWith("}")) {
                        log.warn("Response doesn't look like JSON, wrapping in object: {}",
                                        cleaned.substring(0, Math.min(100, cleaned.length())));
                        return String.format("{\"raw_response\": %s}", cleaned);
                }

                return cleaned;
        }

        /**
         * Combine analysis results from multiple prompts into single JSON
         */
        private String combineAnalysisResults(String basicInfo, String education, String workExperience,
                        String skills, String certificatesLanguages) {
                // Combine as JSON object with each prompt result as a field
                return String.format(
                                "{\n  \"basic_info\": %s,\n  \"education\": %s,\n  \"work_experience\": %s,\n  \"skills\": %s,\n  \"certificates_languages\": %s\n}",
                                basicInfo, education, workExperience, skills, certificatesLanguages);
        }
}
