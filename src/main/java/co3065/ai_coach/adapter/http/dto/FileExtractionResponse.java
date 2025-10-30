package co3065.ai_coach.adapter.http.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import co3065.ai_coach.models.FileExtraction;

/**
 * Response DTO for file extraction
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileExtractionResponse {
    private String fileName;
    private String fileType;
    private String extractedText;
    private Integer textLength;
    private LocalDateTime extractedAt;
    private Boolean success;
    private String errorMessage;

    // Static factory method from domain
    public static FileExtractionResponse fromDomain(FileExtraction extraction) {
        FileExtractionResponse response = new FileExtractionResponse();
        response.fileName = extraction.getFileName();
        response.fileType = extraction.getFileType();
        response.extractedText = extraction.getExtractedText();
        response.textLength = extraction.getTextLength();
        response.extractedAt = extraction.getExtractedAt();
        response.success = extraction.isSuccess();
        response.errorMessage = extraction.getErrorMessage();
        return response;
    }

    // Static factory method with preview (limited text)
    public static FileExtractionResponse fromDomainWithPreview(FileExtraction extraction, int maxLength) {
        FileExtractionResponse response = new FileExtractionResponse();
        response.fileName = extraction.getFileName();
        response.fileType = extraction.getFileType();
        response.extractedText = extraction.getPreview(maxLength);
        response.textLength = extraction.getTextLength();
        response.extractedAt = extraction.getExtractedAt();
        response.success = extraction.isSuccess();
        response.errorMessage = extraction.getErrorMessage();
        return response;
    }

    // Getters and Setters
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public Integer getTextLength() {
        return textLength;
    }

    public void setTextLength(Integer textLength) {
        this.textLength = textLength;
    }

    public LocalDateTime getExtractedAt() {
        return extractedAt;
    }

    public void setExtractedAt(LocalDateTime extractedAt) {
        this.extractedAt = extractedAt;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}

