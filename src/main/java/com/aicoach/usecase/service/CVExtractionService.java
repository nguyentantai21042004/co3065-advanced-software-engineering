package com.aicoach.usecase.service;

import java.io.InputStream;

import org.springframework.stereotype.Service;

import com.aicoach.models.FileExtraction;
import com.aicoach.repository.FileStorage;
import com.aicoach.usecase.CVExtractionUseCase;
import com.aicoach.usecase.FileExtractionUseCase;

/**
 * CV Extraction Service Implementation
 * Downloads file from storage and extracts text
 */
@Service
public class CVExtractionService implements CVExtractionUseCase {

    private final FileStorage fileStorage;
    private final FileExtractionUseCase fileExtractionUseCase;

    public CVExtractionService(FileStorage fileStorage,
            FileExtractionUseCase fileExtractionUseCase) {
        this.fileStorage = fileStorage;
        this.fileExtractionUseCase = fileExtractionUseCase;
    }

    @Override
    public FileExtraction extractTextFromFileId(String fileId) {
        // Validate file ID
        if (fileId == null || fileId.trim().isEmpty()) {
            return FileExtraction.failed(fileId, "UNKNOWN",
                    "File ID cannot be empty");
        }

        try {
            // Check if file exists
            if (!fileStorage.fileExists(fileId)) {
                return FileExtraction.failed(fileId, "UNKNOWN",
                        "File not found: " + fileId);
            }

            // Download file from storage
            InputStream inputStream = fileStorage.downloadFile(fileId);

            // Determine file name with extension
            String fileName = determineFileName(fileId);

            // Extract text using FileExtractionUseCase
            FileExtraction result = fileExtractionUseCase.extractText(inputStream, fileName);

            // Close input stream
            try {
                inputStream.close();
            } catch (Exception e) {
                // Log but don't fail
            }

            return result;

        } catch (Exception e) {
            return FileExtraction.failed(fileId, "UNKNOWN",
                    "Failed to extract text from file: " + e.getMessage());
        }
    }

    private String determineFileName(String fileId) {
        // Try common extensions
        String[] extensions = { ".pdf", ".docx", ".doc" };

        for (String ext : extensions) {
            try {
                if (fileStorage.fileExists(fileId)) {
                    return fileId + ext;
                }
            } catch (Exception e) {
                // Continue
            }
        }

        return fileId + ".pdf"; // Default to PDF
    }
}
