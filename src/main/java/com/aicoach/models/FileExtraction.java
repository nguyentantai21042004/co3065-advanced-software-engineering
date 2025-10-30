package com.aicoach.models;

import java.time.LocalDateTime;

/**
 * Domain Model - File Extraction Result
 * Represents the result of extracting text from a file
 */
public class FileExtraction {
    private final String fileName;
    private final String fileType;
    private final String extractedText;
    private final int textLength;
    private final LocalDateTime extractedAt;
    private final boolean success;
    private final String errorMessage;

    // Constructor cho successful extraction
    public FileExtraction(String fileName, String fileType, String extractedText) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.extractedText = extractedText;
        this.textLength = extractedText != null ? extractedText.length() : 0;
        this.extractedAt = LocalDateTime.now();
        this.success = true;
        this.errorMessage = null;
    }

    // Private constructor cho failed extraction
    private FileExtraction(String fileName, String fileType, boolean success, String errorMessage) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.extractedText = null;
        this.textLength = 0;
        this.extractedAt = LocalDateTime.now();
        this.success = success;
        this.errorMessage = errorMessage;
    }
    
    // Factory method for failed extraction
    public static FileExtraction failed(String fileName, String fileType, String errorMessage) {
        return new FileExtraction(fileName, fileType, false, errorMessage);
    }

    // Business validation
    public boolean hasValidText() {
        return success && extractedText != null && !extractedText.trim().isEmpty();
    }

    public boolean isMinimumLength(int minLength) {
        return hasValidText() && textLength >= minLength;
    }

    public String getPreview(int maxLength) {
        if (!hasValidText()) {
            return "";
        }
        return extractedText.length() > maxLength 
            ? extractedText.substring(0, maxLength) + "..." 
            : extractedText;
    }

    // Getters
    public String getFileName() {
        return fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public int getTextLength() {
        return textLength;
    }

    public LocalDateTime getExtractedAt() {
        return extractedAt;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}

