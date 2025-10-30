package com.aicoach.messaging;

import java.io.InputStream;
import java.util.UUID;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.aicoach.config.RabbitMQConfig;
import com.aicoach.models.CVExtractionMessage;
import com.aicoach.models.FileExtraction;
import com.aicoach.repository.FileStorage;
import com.aicoach.models.UploadedFile;
import com.aicoach.usecase.FileExtractionUseCase;
import com.aicoach.repository.postgresql.ExtractionResultRepository;
import com.aicoach.repository.postgresql.entity.ExtractionResultEntity;
import com.aicoach.models.ExtractionNotifyMessage;

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
    private final ExtractionResultRepository extractionResultRepository;
    private final ExtractionNotifyProducer extractionNotifyProducer;

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
            log.info("Downloading file from storage: fileId={}", message.getFileId());
            InputStream fileStream = fileStorage.downloadFile(message.getFileId());
            String fileName = message.getFileName();
            String fileType = (fileName != null && fileName.contains("."))
                    ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
                    : "";

            FileExtraction extraction = null;
            UUID avatarId = null;
            String rawText = null;
            if (fileType.equals("pdf") || fileType.equals("doc") || fileType.equals("docx")) {
                // Text file: xử lý như trước
                extraction = fileExtractionUseCase.extractText(fileStream, fileName);
                rawText = extraction.getExtractedText();
            } else if (fileType.equals("png") || fileType.equals("jpg") || fileType.equals("jpeg")) {
                // Đọc thành byte[] để không bị mất InputStream
                ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                byte[] data = new byte[8192];
                int nRead;
                while ((nRead = fileStream.read(data, 0, data.length)) != -1) {
                    buffer.write(data, 0, nRead);
                }
                buffer.flush();
                byte[] fileBytes = buffer.toByteArray();
                // 1. extract text nếu cần (tuỳ usecase)
                ByteArrayInputStream bisForExtract = new ByteArrayInputStream(fileBytes);
                extraction = fileExtractionUseCase.extractText(bisForExtract, fileName);
                rawText = extraction.getExtractedText();
                // 2. upload lại lên MinIO để làm avatar
                ByteArrayInputStream bisForUpload = new ByteArrayInputStream(fileBytes);
                String avatarFileName = "avatar-" + message.getFileId() + "." + fileType;
                String contentType = "image/" + (fileType.equals("jpg") ? "jpeg" : fileType);
                long fileSize = fileBytes.length;
                UploadedFile avatarFile = fileStorage.uploadFile(bisForUpload, avatarFileName, contentType, fileSize);
                avatarId = UUID.fromString(avatarFile.getFileId());
                log.info("Uploaded avatar for file {} as avatarId {}", message.getFileId(), avatarId);
            }
            // Save result to DB
            ExtractionResultEntity result = new ExtractionResultEntity(
                    UUID.fromString(message.getFileId()),
                    rawText, avatarId);
            ExtractionResultEntity saved = extractionResultRepository.save(result);
            log.info("Extraction result saved for file: {}", message.getFileId());
            // Notify ra queue notify
            extractionNotifyProducer.sendNotify(new ExtractionNotifyMessage(saved.getId().toString()));
            log.info("Notify extraction_ready sent for resultId {}", saved.getId());
        } catch (Exception e) {
            log.error("Error processing CV extraction task: taskId={}, error={}",
                    message.getTaskId(), e.getMessage(), e);
            message.incrementRetry();
            if (message.getRetryCount() >= 3) {
                log.error("Max retries reached for task: taskId={}, sending to DLQ",
                        message.getTaskId());
                // TODO: handle DLQ logic
            } else {
                throw new RuntimeException("Failed to process extraction task", e);
            }
        }
    }
}
