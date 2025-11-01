package com.aicoach.messaging;

import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aicoach.config.RabbitMQConfig;
import com.aicoach.models.CVAnalysisMessage;
import com.aicoach.models.CVExtractionMessage;
import com.aicoach.models.ExtractionNotifyMessage;
import com.aicoach.repository.postgresql.ExtractionResultRepository;
import com.aicoach.repository.postgresql.entity.ExtractionResultEntity;
import com.aicoach.usecase.CVExtractionUseCase;
import com.aicoach.usecase.types.CVExtractionResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile("consumer")
@RequiredArgsConstructor
@Slf4j
public class CVExtractionConsumer {

    private final CVExtractionUseCase cvExtractionUseCase;
    private final ExtractionResultRepository extractionResultRepository;
    private final ExtractionNotifyProducer extractionNotifyProducer;
    private final CVAnalysisProducer cvAnalysisProducer;

    /**
     * Listen to CV extraction queue and process messages
     * 1. Extract text and images from CV file
     * 2. Save extraction result to database
     * 3. Send notification message
     *
     * @param message CV extraction message from queue
     */
    @RabbitListener(queues = RabbitMQConfig.CV_EXTRACTION_QUEUE)
    @Transactional
    public void processExtractionTask(CVExtractionMessage message) {
        log.info("Received CV extraction task: taskId={}, fileId={}, fileName={}",
                message.getTaskId(),
                message.getFileId(),
                message.getFileName());

        try {
            // Step 1: Extract text and first image (no DB persistence)
            CVExtractionResult result = cvExtractionUseCase.extractCV(
                    message.getFileId(),
                    message.getFileName());

            log.info("Extraction completed: taskId={}, fileId={}",
                    message.getTaskId(), message.getFileId());

            

            // Step 2: Save extraction result to database
            log.info("Saving extraction result to database");
            ExtractionResultEntity entity = new ExtractionResultEntity(
                    UUID.fromString(message.getFileId()),
                    result.getExtractedText(),
                    result.getAvatarId());
            ExtractionResultEntity saved = extractionResultRepository.save(entity);
            log.info("Extraction result saved for file: {}", message.getFileId());

            // Step 3: Publish CV analysis task
            log.info("Publishing CV analysis task");
            CVAnalysisMessage analysisMessage = CVAnalysisMessage.builder()
                    .taskId(UUID.randomUUID().toString())
                    .extractionResultId(saved.getId().toString())
                    .fileId(message.getFileId())
                    .fileName(message.getFileName())
                    .build();
            cvAnalysisProducer.sendAnalysisTask(analysisMessage);
            log.info("CV analysis task published: taskId={}, extractionResultId={}",
                    analysisMessage.getTaskId(), analysisMessage.getExtractionResultId());

            // Step 4: Send extraction notification
            log.info("Sending extraction notification");
            extractionNotifyProducer.sendNotify(
                    new ExtractionNotifyMessage(saved.getId().toString()));
            log.info("Notification sent for resultId: {}", saved.getId());

            log.info("CV extraction task completed successfully: taskId={}, fileId={}",
                    message.getTaskId(), message.getFileId());

        } catch (IllegalArgumentException e) {
            log.error("Validation error for task: taskId={}, error={}",
                    message.getTaskId(), e.getMessage());
            throw e;

        } catch (Exception e) {
            log.error("Error processing CV extraction task: taskId={}, error={}",
                    message.getTaskId(), e.getMessage(), e);

            message.incrementRetry();
            if (message.getRetryCount() >= 3) {
                log.error("Max retries reached for task: taskId={}, sending to DLQ",
                        message.getTaskId());
            } else {
                log.info("Retrying task: taskId={}, retryCount={}",
                        message.getTaskId(), message.getRetryCount());
                throw new RuntimeException("Retry task: " + e.getMessage(), e);
            }
        }
    }
}
