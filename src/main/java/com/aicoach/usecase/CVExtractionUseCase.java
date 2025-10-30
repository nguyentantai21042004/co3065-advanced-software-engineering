package com.aicoach.usecase;

import com.aicoach.models.FileExtraction;

/**
 * CV Extraction Use Case Interface
 * Port In - Extract text from CV by file ID
 */
public interface CVExtractionUseCase {

    /**
     * Extract text from CV file by ID
     * 
     * @param fileId File ID from upload
     * @return FileExtraction result
     */
    FileExtraction extractTextFromFileId(String fileId);
}
