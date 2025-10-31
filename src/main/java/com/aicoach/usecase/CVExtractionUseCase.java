package com.aicoach.usecase;

import com.aicoach.usecase.types.CVExtractionResult;

/**
 * CV Extraction Use Case Interface
 * Port In - Extract text and images from CV files
 */
public interface CVExtractionUseCase {

    /**
     * Extract CV by ID
     * Processes the file, extracts text content and images.
     * Does NOT save to database or send notifications - that should be done by the consumer.
     *
     * @param fileId   File ID from upload
     * @param fileName Original file name
     * @return CVExtractionResult containing extraction result and avatar ID
     */
    CVExtractionResult extractCV(String fileId, String fileName) throws Exception;

    /**
     * Validate the fileId, gather required metadata, and publish an extraction
     * task.
     *
     * @param fileId the uploaded file id
     * @return true if the task was published successfully, false otherwise
     */
    boolean publishExtractionTask(String fileId);
}
