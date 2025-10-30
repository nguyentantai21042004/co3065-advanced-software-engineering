package com.aicoach.models;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message Model for CV Extraction Queue
 * 
 * This message is sent from API service to Consumer service
 * via RabbitMQ for asynchronous CV text extraction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVExtractionMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Unique task ID
     */
    private String taskId;

    /**
     * File ID from MinIO upload
     */
    private String fileId;

    /**
     * Original file name
     */
    private String fileName;

    /**
     * File type (PDF, DOCX, DOC)
     */
    private String fileType;

    /**
     * File size in bytes
     */
    private Long fileSize;

    /**
     * Timestamp when message was created
     */
    private LocalDateTime createdAt;

    /**
     * Optional: User ID who uploaded the file
     */
    private String userId;

    /**
     * Number of retry attempts
     */
    private Integer retryCount;

    /**
     * Create a new message for CV extraction
     */
    public static CVExtractionMessage create(String taskId, String fileId, String fileName,
            String fileType, long fileSize) {
        return CVExtractionMessage.builder()
                .taskId(taskId)
                .fileId(fileId)
                .fileName(fileName)
                .fileType(fileType)
                .fileSize(fileSize)
                .createdAt(LocalDateTime.now())
                .retryCount(0)
                .build();
    }

    /**
     * Increment retry count
     */
    public void incrementRetry() {
        if (this.retryCount == null) {
            this.retryCount = 0;
        }
        this.retryCount++;
    }
}
