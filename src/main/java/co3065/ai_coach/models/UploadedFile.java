package co3065.ai_coach.models;

import java.time.LocalDateTime;

/**
 * Domain Model - Uploaded File
 * Represents a file that has been uploaded to storage
 */
public class UploadedFile {
    private final String fileId;
    private final String originalFileName;
    private final String storagePath;
    private final String contentType;
    private final long fileSize;
    private final LocalDateTime uploadedAt;

    public UploadedFile(String fileId, String originalFileName, String storagePath,
            String contentType, long fileSize) {
        this.fileId = fileId;
        this.originalFileName = originalFileName;
        this.storagePath = storagePath;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedAt = LocalDateTime.now();
    }

    // Business validation
    public boolean isValidFileType() {
        if (contentType == null) {
            return false;
        }
        return contentType.equals("application/pdf") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                contentType.equals("application/msword");
    }

    public String getFileExtension() {
        if (originalFileName == null || !originalFileName.contains(".")) {
            return "";
        }
        return originalFileName.substring(originalFileName.lastIndexOf(".") + 1).toLowerCase();
    }

    // Getters
    public String getFileId() {
        return fileId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public String getContentType() {
        return contentType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}
