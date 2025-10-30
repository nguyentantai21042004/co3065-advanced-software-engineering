package co3065.ai_coach.usecase.service;

import java.io.File;
import java.io.InputStream;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co3065.ai_coach.models.FileExtraction;
import co3065.ai_coach.repository.FileExtractor;
import co3065.ai_coach.usecase.FileExtractionUseCase;

/**
 * File Extraction Service Implementation
 * Orchestrates text extraction from various file types
 */
@Service
@Transactional
public class FileExtractionService implements FileExtractionUseCase {

    private final List<FileExtractor> extractors;

    public FileExtractionService(List<FileExtractor> extractors) {
        this.extractors = extractors;
    }

    @Override
    public FileExtraction extractText(File file, String fileName) {
        // Validate input
        if (file == null || !file.exists()) {
            return FileExtraction.failed(fileName, getFileType(fileName), "File does not exist");
        }

        if (fileName == null || fileName.trim().isEmpty()) {
            return FileExtraction.failed(fileName, getFileType(fileName), "File name is required");
        }

        // Find appropriate extractor
        FileExtractor extractor = findExtractor(fileName);
        if (extractor == null) {
            return FileExtraction.failed(fileName, getFileType(fileName), 
                "Unsupported file type. Supported types: PDF, DOCX, DOC");
        }

        // Extract text
        try {
            String extractedText = extractor.extractText(file);
            
            // Validate extracted text
            if (extractedText == null || extractedText.trim().isEmpty()) {
                return FileExtraction.failed(fileName, getFileType(fileName), 
                    "No text content found in file");
            }

            return new FileExtraction(fileName, getFileType(fileName), extractedText);
            
        } catch (Exception e) {
            return FileExtraction.failed(fileName, getFileType(fileName), 
                "Failed to extract text: " + e.getMessage());
        }
    }

    @Override
    public FileExtraction extractText(InputStream inputStream, String fileName) {
        // Validate input
        if (inputStream == null) {
            return FileExtraction.failed(fileName, getFileType(fileName), "Input stream is null");
        }

        if (fileName == null || fileName.trim().isEmpty()) {
            return FileExtraction.failed(fileName, getFileType(fileName), "File name is required");
        }

        // Find appropriate extractor
        FileExtractor extractor = findExtractor(fileName);
        if (extractor == null) {
            return FileExtraction.failed(fileName, getFileType(fileName), 
                "Unsupported file type. Supported types: PDF, DOCX, DOC");
        }

        // Extract text
        try {
            String extractedText = extractor.extractText(inputStream, fileName);
            
            // Validate extracted text
            if (extractedText == null || extractedText.trim().isEmpty()) {
                return FileExtraction.failed(fileName, getFileType(fileName), 
                    "No text content found in file");
            }

            return new FileExtraction(fileName, getFileType(fileName), extractedText);
            
        } catch (Exception e) {
            return FileExtraction.failed(fileName, getFileType(fileName), 
                "Failed to extract text: " + e.getMessage());
        }
    }

    @Override
    public boolean isSupportedFileType(String fileName) {
        return findExtractor(fileName) != null;
    }

    /**
     * Find appropriate extractor for the file
     */
    private FileExtractor findExtractor(String fileName) {
        if (fileName == null) {
            return null;
        }

        for (FileExtractor extractor : extractors) {
            if (extractor.supports(fileName)) {
                return extractor;
            }
        }

        return null;
    }

    /**
     * Get file type from file name
     */
    private String getFileType(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "UNKNOWN";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toUpperCase();
    }
}

