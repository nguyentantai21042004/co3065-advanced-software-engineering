package com.aicoach.infrastructure.llm;

import com.aicoach.config.GeminiConfig;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Google Gemini API Client Implementation
 * Supports multiple API keys with rotation/failover strategies
 */
@Component
@Slf4j
public class GoogleGeminiClient implements GeminiClient {

    private final GeminiConfig config;
    private final RestTemplate restTemplate;
    private final PromptTemplateService promptTemplateService;
    private final AtomicInteger roundRobinIndex = new AtomicInteger(0);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleGeminiClient(GeminiConfig config, RestTemplateBuilder restTemplateBuilder,
            PromptTemplateService promptTemplateService) {
        this.config = config;
        this.promptTemplateService = promptTemplateService;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(config.getTimeoutMs());
        factory.setReadTimeout(config.getTimeoutMs());

        this.restTemplate = restTemplateBuilder
                .requestFactory(() -> factory)
                .build();

        validateConfig();
    }

    private void validateConfig() {
        List<String> apiKeys = config.getApiKeys();
        if (apiKeys == null || apiKeys.isEmpty() || apiKeys.stream().allMatch(String::isBlank)) {
            log.warn(
                    "Gemini API keys are not configured. GoogleGeminiClient will be available but API calls will fail. "
                            +
                            "Please configure gemini.api-keys in application.yml or set GEMINI_API_KEYS environment variable.");
        } else {
            long validKeys = apiKeys.stream().filter(key -> key != null && !key.trim().isEmpty()).count();
            log.info("Initialized GoogleGeminiClient with {} valid API key(s), strategy: {}",
                    validKeys, config.getKeyStrategy());
        }
    }

    @Override
    public String generateText(String prompt) throws Exception {
        return generateText(prompt, config.getDefaultTemperature(), config.getDefaultMaxTokens());
    }

    @Override
    public String generateText(String prompt, Double temperature, Integer maxTokens) throws Exception {
        String apiKey = selectApiKey();
        String url = buildApiUrl(apiKey);

        GeminiRequest request = new GeminiRequest();
        request.setContents(List.of(
                new Content(new Part(prompt))));
        GenerationConfig genConfig = new GenerationConfig();
        genConfig.setTemperature(temperature);
        genConfig.setMaxOutputTokens(maxTokens);
        request.setGenerationConfig(genConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<GeminiRequest> httpEntity = new HttpEntity<>(request, headers);

        int retryCount = 0;
        Exception lastException = null;

        while (retryCount <= config.getRetry().getMaxRetries()) {
            try {
                log.info("Calling Gemini API with key #{} (attempt {}/{})",
                        getCurrentKeyIndex(), retryCount + 1, config.getRetry().getMaxRetries() + 1);

                // Get raw response as String first to log and handle markdown code blocks
                ResponseEntity<String> rawResponse = restTemplate.exchange(
                        url, HttpMethod.POST, httpEntity, String.class);

                if (rawResponse.getStatusCode().is2xxSuccessful() && rawResponse.getBody() != null) {
                    String rawResponseBody = rawResponse.getBody();

                    // Parse JSON response
                    GeminiResponse response;
                    try {
                        response = objectMapper.readValue(rawResponseBody, GeminiResponse.class);
                    } catch (Exception e) {
                        log.error("Failed to parse Gemini API response as JSON. Raw response: {}", rawResponseBody);
                        throw new RuntimeException("Failed to parse Gemini API response: " + e.getMessage(), e);
                    }

                    if (response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                        Candidate candidate = response.getCandidates().get(0);

                        // Check if response was truncated due to MAX_TOKENS
                        if ("MAX_TOKENS".equals(candidate.getFinishReason())) {
                            log.warn(
                                    "Gemini API response was truncated due to MAX_TOKENS. Consider increasing maxOutputTokens.");
                        }

                        if (candidate.getContent() != null && candidate.getContent().getParts() != null
                                && !candidate.getContent().getParts().isEmpty()) {
                            String generatedText = candidate.getContent().getParts().get(0).getText();

                            if (generatedText == null || generatedText.trim().isEmpty()) {
                                log.warn(
                                        "Gemini API returned empty text in response. Finish reason: {}, Content parts size: {}",
                                        candidate.getFinishReason(), candidate.getContent().getParts().size());
                                throw new RuntimeException("Empty text in Gemini API response. Finish reason: "
                                        + candidate.getFinishReason());
                            }

                            // Extract JSON from markdown code blocks if present
                            generatedText = extractJsonFromMarkdown(generatedText);

                            log.info("Gemini API call successful, response length: {}, finish reason: {}",
                                    generatedText.length(), candidate.getFinishReason());
                            return generatedText;
                        } else {
                            log.warn("Gemini API response has no content parts. Finish reason: {}, Content: {}",
                                    candidate.getFinishReason(), candidate.getContent());
                        }
                    }
                    log.warn("Gemini API returned empty response or no candidates");
                    throw new RuntimeException("Empty response from Gemini API");
                } else {
                    throw new RuntimeException("Unexpected response status: " + rawResponse.getStatusCode());
                }

            } catch (RestClientException e) {
                lastException = e;
                log.warn("Gemini API call failed (attempt {}/{}): {}",
                        retryCount + 1, config.getRetry().getMaxRetries() + 1, e.getMessage());

                // Check if it's a quota/rate limit error - try next key
                if (isQuotaOrAuthError(e)) {
                    apiKey = selectNextApiKey(apiKey);
                    url = buildApiUrl(apiKey);
                    log.info("Switching to next API key due to quota/auth error");
                }

                if (retryCount < config.getRetry().getMaxRetries()) {
                    long delay = calculateRetryDelay(retryCount);
                    Thread.sleep(delay);
                }
                retryCount++;
            }
        }

        throw new RuntimeException("Failed to call Gemini API after " + (retryCount) + " attempts", lastException);
    }

    @Override
    public String generateWithTemplate(String templateName, Map<String, Object> templateData, String actualData)
            throws Exception {
        return generateWithTemplate(templateName, templateData, actualData,
                config.getDefaultTemperature(), config.getDefaultMaxTokens());
    }

    @Override
    public String generateWithTemplate(String templateName, Map<String, Object> templateData,
            String actualData, Double temperature, Integer maxTokens) throws Exception {
        // Build final prompt by combining template and data
        String finalPrompt = promptTemplateService.buildPrompt(templateName, templateData, actualData);

        // Call API with final prompt
        return generateText(finalPrompt, temperature, maxTokens);
    }

    private String selectApiKey() {
        List<String> validKeys = getValidApiKeys();
        if (validKeys.isEmpty()) {
            throw new IllegalStateException(
                    "No Gemini API keys configured. Please configure gemini.api-keys in application.yml or set GEMINI_API_KEYS environment variable.");
        }

        switch (config.getKeyStrategy()) {
            case ROUND_ROBIN:
                int index = roundRobinIndex.getAndIncrement() % validKeys.size();
                return validKeys.get(index);
            case RANDOM:
                int randomIndex = (int) (Math.random() * validKeys.size());
                return validKeys.get(randomIndex);
            case FAILOVER:
            default:
                return validKeys.get(0);
        }
    }

    private String selectNextApiKey(String currentKey) {
        List<String> validKeys = getValidApiKeys();
        int currentIndex = validKeys.indexOf(currentKey);
        if (currentIndex == -1 || currentIndex >= validKeys.size() - 1) {
            return validKeys.get(0); // Wrap around
        }
        return validKeys.get(currentIndex + 1);
    }

    private int getCurrentKeyIndex() {
        List<String> validKeys = getValidApiKeys();
        int index = roundRobinIndex.get() % validKeys.size();
        return index + 1; // 1-based for logging
    }

    private List<String> getValidApiKeys() {
        List<String> keys = config.getApiKeys();
        if (keys == null || keys.isEmpty()) {
            return List.of();
        }
        return keys.stream()
                .filter(key -> key != null && !key.trim().isEmpty())
                .toList();
    }

    private String buildApiUrl(String apiKey) {
        return String.format("%s/%s:generateContent?key=%s",
                config.getEndpoint(), config.getDefaultModel(), apiKey);
    }

    private boolean isQuotaOrAuthError(Exception e) {
        String message = e.getMessage().toLowerCase();
        return message.contains("quota") || message.contains("403")
                || message.contains("401") || message.contains("429")
                || message.contains("unauthorized") || message.contains("forbidden");
    }

    private long calculateRetryDelay(int retryCount) {
        long delay = config.getRetry().getInitialDelayMs() * (1L << retryCount);
        return Math.min(delay, config.getRetry().getMaxDelayMs());
    }

    /**
     * Extract JSON from markdown code blocks if present
     * Handles cases like:
     * ```json
     * {...}
     * ```
     * or
     * ```
     * {...}
     * ```
     */
    private String extractJsonFromMarkdown(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        String cleaned = text.trim();

        // Check if wrapped in markdown code blocks
        if (cleaned.startsWith("```")) {
            // Find the start of JSON (first { or [)
            int jsonStart = -1;
            for (int i = 0; i < cleaned.length(); i++) {
                char c = cleaned.charAt(i);
                if (c == '{' || c == '[') {
                    jsonStart = i;
                    break;
                }
            }

            // Find the end of JSON (last } or ])
            int jsonEnd = -1;
            for (int i = cleaned.length() - 1; i >= 0; i--) {
                char c = cleaned.charAt(i);
                if (c == '}' || c == ']') {
                    jsonEnd = i;
                    break;
                }
            }

            if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
                cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
                log.debug("Extracted JSON from markdown code blocks, length: {}", cleaned.length());
            }
        }

        return cleaned;
    }

    // Request/Response DTOs
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class GeminiRequest {
        private List<Content> contents;
        private GenerationConfig generationConfig;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class Content {
        private List<Part> parts;
        private String role;

        // Convenience constructor for creating Content with single Part
        Content(Part part) {
            this.parts = List.of(part);
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class Part {
        private String text;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class GenerationConfig {
        @JsonProperty("temperature")
        private Double temperature;

        @JsonProperty("maxOutputTokens")
        private Integer maxOutputTokens;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class GeminiResponse {
        private List<Candidate> candidates;
        private PromptFeedback promptFeedback;
        // Additional fields that may be present but we don't need:
        // usageMetadata, modelVersion, responseId - will be ignored
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class Candidate {
        private Content content;
        private String finishReason;
        private Integer index;
        private List<SafetyRating> safetyRatings;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class PromptFeedback {
        private Object blockReason;
        private List<SafetyRating> safetyRatings;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class SafetyRating {
        private String category;
        private String probability;
    }
}
