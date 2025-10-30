package co3065.ai_coach.adapter.http.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import co3065.ai_coach.models.UploadedFile;

/**
 * Response DTO for uploaded file
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UploadedFileResponse {
    private String fileId;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    // Static factory method from domain
    public static UploadedFileResponse fromDomain(UploadedFile uploadedFile) {
        UploadedFileResponse response = new UploadedFileResponse();
        response.fileId = uploadedFile.getFileId();
        response.originalFileName = uploadedFile.getOriginalFileName();
        response.contentType = uploadedFile.getContentType();
        response.fileSize = uploadedFile.getFileSize();
        response.uploadedAt = uploadedFile.getUploadedAt();
        return response;
    }

    // Getters and Setters
    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
