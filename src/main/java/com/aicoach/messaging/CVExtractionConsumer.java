package com.aicoach.messaging;

import java.io.InputStream;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.aicoach.config.RabbitMQConfig;
import com.aicoach.models.CVExtractionMessage;
import com.aicoach.models.FileExtraction;
import com.aicoach.repository.FileStorage;
import com.aicoach.usecase.FileExtractionUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Message Consumer for CV Extraction
 * 
 * Used by Consumer Service to listen and process CV extraction tasks from
 * RabbitMQ
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CVExtractionConsumer {

    private final FileStorage fileStorage;
    private final FileExtractionUseCase fileExtractionUseCase;

    /**
     * Listen to CV extraction queue and process messages
     * 
     * @param message CV extraction message from queue
     */
    @RabbitListener(queues = RabbitMQConfig.CV_EXTRACTION_QUEUE)
    public void processExtractionTask(CVExtractionMessage message) {
        log.info("Received CV extraction task: taskId={}, fileId={}, fileName={}",
                message.getTaskId(), message.getFileId(), message.getFileName());

        try {
            // Download file from MinIO
            log.info("Downloading file from storage: fileId={}", message.getFileId());
            InputStream fileStream = fileStorage.downloadFile(message.getFileId());

            // Extract text from file
            log.info("Extracting text from file: fileName={}, fileType={}",
                    message.getFileName(), message.getFileType());

            FileExtraction extraction = fileExtractionUseCase.extractText(
                    fileStream,
                    message.getFileName());

            if (extraction.isSuccess()) {
                log.info("CV extraction completed successfully: taskId={}, textLength={}",
                        message.getTaskId(), extraction.getTextLength());

                // TODO: Store results to database or send to another queue
                // For now, just log the success
                onExtractionSuccess(message, extraction);

            } else {
                log.error("CV extraction failed: taskId={}, error={}",
                        message.getTaskId(), extraction.getErrorMessage());
                onExtractionFailure(message, extraction.getErrorMessage());
            }

        } catch (Exception e) {
            log.error("Error processing CV extraction task: taskId={}, error={}",
                    message.getTaskId(), e.getMessage(), e);

            // Increment retry count
            message.incrementRetry();

            // If retry count exceeds threshold, send to DLQ
            if (message.getRetryCount() >= 3) {
                log.error("Max retries reached for task: taskId={}, sending to DLQ",
                        message.getTaskId());
                onMaxRetriesReached(message, e);
            } else {
                // Re-throw to let RabbitMQ handle retry
                throw new RuntimeException("Failed to process extraction task", e);
            }
        }
    }

    /**
     * Handle successful extraction
     */
    private void onExtractionSuccess(CVExtractionMessage message, FileExtraction extraction) {
        log.info("Extraction successful - taskId={}, preview={}",
                message.getTaskId(), extraction.getPreview(100));

        // TODO: Implement your business logic here:
        // 1. Save extracted text to database
        // 2. Send notification to user
        // 3. Trigger next step in workflow
        // 4. Update task status
    }

    /**
     * Handle extraction failure
     */
    private void onExtractionFailure(CVExtractionMessage message, String errorMessage) {
        log.warn("Extraction failed - taskId={}, error={}", message.getTaskId(), errorMessage);

        // TODO: Implement error handling:
        // 1. Save error to database
        // 2. Send failure notification
        // 3. Update task status to failed
    }

    /**
     * Handle max retries reached
     */
    private void onMaxRetriesReached(CVExtractionMessage message, Exception e) {
        log.error("Max retries reached - taskId={}, giving up", message.getTaskId());

        // TODO: Implement max retry handling:
        // 1. Log to error tracking system
        // 2. Send alert to ops team
        // 3. Mark task as permanently failed
    }
}
