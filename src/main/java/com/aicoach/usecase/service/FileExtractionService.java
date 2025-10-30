package com.aicoach.usecase.service;

import java.io.File;
import java.io.InputStream;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aicoach.models.FileExtraction;
import com.aicoach.repository.FileExtractor;
import com.aicoach.usecase.FileExtractionUseCase;
import lombok.extern.slf4j.Slf4j;

/**
 * File Extraction Service Implementation
 * Orchestrates text extraction from various file types
 */
@Service
@Transactional
@Slf4j
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
        log.info("[FileExtractionService] extractText called with fileName: {}", fileName);
        
        // Validate input
        if (inputStream == null) {
            log.error("[FileExtractionService] ❌ Input stream is NULL!");
            return FileExtraction.failed(fileName, getFileType(fileName), "Input stream is null");
        }
        log.info("[FileExtractionService] InputStream is valid");

        if (fileName == null || fileName.trim().isEmpty()) {
            log.error("[FileExtractionService] ❌ fileName is NULL or EMPTY!");
            return FileExtraction.failed(fileName, getFileType(fileName), "File name is required");
        }
        log.info("[FileExtractionService] fileName is valid: {}", fileName);

        // Find appropriate extractor
        FileExtractor extractor = findExtractor(fileName);
        if (extractor == null) {
            log.error("[FileExtractionService] ❌ No extractor found for fileName: {}", fileName);
            log.error("[FileExtractionService] Available extractors count: {}", extractors.size());
            return FileExtraction.failed(fileName, getFileType(fileName), 
                "Unsupported file type. Supported types: PDF, DOCX, DOC");
        }
        log.info("[FileExtractionService] ✅ Found extractor: {}", extractor.getClass().getSimpleName());

        // Extract text
        try {
            log.info("[FileExtractionService] Calling extractor.extractText()...");
            String extractedText = extractor.extractText(inputStream, fileName);
            log.info("[FileExtractionService] Extractor returned text, length: {}", 
                extractedText != null ? extractedText.length() : "NULL");
            
            // Validate extracted text
            if (extractedText == null || extractedText.trim().isEmpty()) {
                log.warn("[FileExtractionService] ⚠️ Extracted text is NULL or EMPTY!");
                return FileExtraction.failed(fileName, getFileType(fileName), 
                    "No text content found in file");
            }

            log.info("[FileExtractionService] ✅ Extraction successful, text length: {}", extractedText.length());
            return new FileExtraction(fileName, getFileType(fileName), extractedText);
            
        } catch (Exception e) {
            log.error("[FileExtractionService] ❌ Exception during extraction: {}", e.getMessage(), e);
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

