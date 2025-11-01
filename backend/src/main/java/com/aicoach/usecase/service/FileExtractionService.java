package com.aicoach.usecase.service;

import java.io.File;
import java.io.InputStream;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aicoach.infrastructure.FileExtractor;
import com.aicoach.infrastructure.ImageExtractor;
import com.aicoach.models.FileExtraction;
import com.aicoach.usecase.FileExtractionUseCase;
import lombok.extern.slf4j.Slf4j;

/**
 * File Extraction Service Implementation
 * Orchestrates text and image extraction from various file types
 */
@Service
@Transactional
@Slf4j
public class FileExtractionService implements FileExtractionUseCase {

    private final List<FileExtractor> extractors;
    private final List<ImageExtractor> imageExtractors;

    public FileExtractionService(List<FileExtractor> extractors, List<ImageExtractor> imageExtractors) {
        this.extractors = extractors;
        this.imageExtractors = imageExtractors;
    }

    @Override
    public FileExtraction extractText(File file, String fileName) {
        log.info("extractText(File, fileName) called. fileName: {}", fileName);
        if (file == null || !file.exists()) {
            log.error(" File does not exist: {}", fileName);
            return FileExtraction.failed(fileName, getFileType(fileName), "File does not exist");
        }

        if (fileName == null || fileName.trim().isEmpty()) {
            log.error(" File name is NULL or EMPTY");
            return FileExtraction.failed(fileName, getFileType(fileName), "File name is required");
        }

        FileExtractor extractor = findExtractor(fileName);
        if (extractor == null) {
            log.error(" No extractor found for fileName: {}. Supported types: PDF, DOCX, DOC", fileName);
            return FileExtraction.failed(fileName, getFileType(fileName), "Unsupported file type. Supported types: PDF, DOCX, DOC");
        }

        try {
            log.info("Using extractor: {}", extractor.getClass().getSimpleName());
            String extractedText = extractor.extractText(file);

            if (extractedText == null || extractedText.trim().isEmpty()) {
                log.warn("No text content found in file: {}", fileName);
                return FileExtraction.failed(fileName, getFileType(fileName), "No text content found in file");
            }

            log.info("Extraction successful, text length: {}", extractedText.length());
            return new FileExtraction(fileName, getFileType(fileName), extractedText);

        } catch (Exception e) {
            log.error(" Failed to extract text: {}", e.getMessage(), e);
            return FileExtraction.failed(fileName, getFileType(fileName), "Failed to extract text: " + e.getMessage());
        }
    }

    @Override
    public FileExtraction extractText(InputStream inputStream, String fileName) {
        log.info("extractText(InputStream, fileName) called with fileName: {}", fileName);

        if (inputStream == null) {
            log.error(" Input stream is NULL!");
            return FileExtraction.failed(fileName, getFileType(fileName), "Input stream is null");
        }

        if (fileName == null || fileName.trim().isEmpty()) {
            log.error(" fileName is NULL or EMPTY!");
            return FileExtraction.failed(fileName, getFileType(fileName), "File name is required");
        }

        FileExtractor extractor = findExtractor(fileName);
        if (extractor == null) {
            log.error(" No extractor found for fileName: {}. Supported types: PDF, DOCX, DOC", fileName);
            log.error("Available extractors count: {}", extractors.size());
            return FileExtraction.failed(fileName, getFileType(fileName), "Unsupported file type. Supported types: PDF, DOCX, DOC");
        }
        log.info("Found extractor: {}", extractor.getClass().getSimpleName());

        try {
            log.info("Calling extractor.extractText()...");
            String extractedText = extractor.extractText(inputStream, fileName);
            log.info("Extractor returned text, length: {}", extractedText != null ? extractedText.length() : "NULL");

            if (extractedText == null || extractedText.trim().isEmpty()) {
                log.warn("Extracted text is NULL or EMPTY!");
                return FileExtraction.failed(fileName, getFileType(fileName), "No text content found in file");
            }

            log.info("Extraction successful, text length: {}", extractedText.length());
            return new FileExtraction(fileName, getFileType(fileName), extractedText);

        } catch (Exception e) {
            log.error(" Exception during extraction: {}", e.getMessage(), e);
            return FileExtraction.failed(fileName, getFileType(fileName), "Failed to extract text: " + e.getMessage());
        }
    }

    @Override
    public byte[] extractFirstImage(InputStream inputStream, String fileName) {
        log.info("extractFirstImage called for fileName: {}", fileName);

        if (inputStream == null) {
            log.error(" Input stream is null");
            return null;
        }

        if (fileName == null || fileName.trim().isEmpty()) {
            log.error(" File name is required");
            return null;
        }

        ImageExtractor imageExtractor = findImageExtractor(fileName);
        if (imageExtractor == null) {
            log.warn("No image extractor found for file type: {}", fileName);
            return null;
        }

        try {
            log.info("Using image extractor: {}", imageExtractor.getClass().getSimpleName());
            byte[] imageData = imageExtractor.extractFirstImage(inputStream, fileName);

            if (imageData == null || imageData.length == 0) {
                log.warn("No images found in file: {}", fileName);
                return null;
            }

            log.info("Successfully extracted image, size: {} bytes", imageData.length);
            return imageData;

        } catch (Exception e) {
            log.error("Failed to extract image from file: {}, exception: {}", fileName, e.getMessage(), e);
            return null;
        }
    }

    @Override
    public boolean isSupportedFileType(String fileName) {
        boolean supported = findExtractor(fileName) != null;
        log.debug("isSupportedFileType('{}'): {}", fileName, supported);
        return supported;
    }

    @Override
    public boolean supportsImageExtraction(String fileName) {
        boolean supported = findImageExtractor(fileName) != null;
        log.debug("supportsImageExtraction('{}'): {}", fileName, supported);
        return supported;
    }

    private FileExtractor findExtractor(String fileName) {
        if (fileName == null) {
            log.warn("findExtractor called with null fileName");
            return null;
        }
        for (FileExtractor extractor : extractors) {
            if (extractor.supports(fileName)) {
                log.debug("findExtractor matched: {}", extractor.getClass().getSimpleName());
                return extractor;
            }
        }
        log.warn("No FileExtractor matches fileName: {}", fileName);
        return null;
    }

    private ImageExtractor findImageExtractor(String fileName) {
        if (fileName == null) {
            log.warn("findImageExtractor called with null fileName");
            return null;
        }
        for (ImageExtractor extractor : imageExtractors) {
            if (extractor.supports(fileName)) {
                log.debug("findImageExtractor matched: {}", extractor.getClass().getSimpleName());
                return extractor;
            }
        }
        log.warn("No ImageExtractor matches fileName: {}", fileName);
        return null;
    }

    private String getFileType(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            log.debug("getFileType: UNKNOWN for fileName: {}", fileName);
            return "UNKNOWN";
        }
        String type = fileName.substring(fileName.lastIndexOf(".") + 1).toUpperCase();
        log.debug("getFileType: {} for fileName: {}", type, fileName);
        return type;
    }
}
