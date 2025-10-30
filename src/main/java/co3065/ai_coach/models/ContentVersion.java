package co3065.ai_coach.models;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity - ContentVersion
 * Entity cho phiên bản nội dung
 */
public class ContentVersion {
    private Long versionId;
    private UUID unitId;
    private String versionNumber;
    private JsonNode contentData;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor cho tạo content version mới (chưa có versionId)
    public ContentVersion(UUID unitId, String versionNumber, JsonNode contentData, boolean isActive) {
        this.unitId = unitId;
        this.versionNumber = versionNumber;
        this.contentData = contentData;
        this.isActive = isActive;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ (có versionId - từ database)
    public ContentVersion(Long versionId, UUID unitId, String versionNumber, JsonNode contentData,
                         boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.versionId = versionId;
        this.unitId = unitId;
        this.versionNumber = versionNumber;
        this.contentData = contentData;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Business logic validation
    public boolean hasValidUnitId() {
        return unitId != null;
    }

    public boolean hasValidVersionNumber() {
        return versionNumber != null && !versionNumber.trim().isEmpty() && isValidSemanticVersion(versionNumber);
    }

    public boolean hasValidContentData() {
        return contentData != null && !contentData.isEmpty();
    }

    public boolean isValid() {
        return hasValidUnitId() && hasValidVersionNumber() && hasValidContentData();
    }

    public void updateVersionNumber(String newVersionNumber) {
        if (newVersionNumber == null || newVersionNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Version number cannot be null or empty");
        }
        if (!isValidSemanticVersion(newVersionNumber)) {
            throw new IllegalArgumentException("Invalid semantic version format");
        }
        this.versionNumber = newVersionNumber;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateContentData(JsonNode newContentData) {
        if (newContentData == null || newContentData.isEmpty()) {
            throw new IllegalArgumentException("Content data cannot be null or empty");
        }
        this.contentData = newContentData;
        this.updatedAt = LocalDateTime.now();
    }

    public void setActive(boolean active) {
        this.isActive = active;
        this.updatedAt = LocalDateTime.now();
    }

    // Helper method to validate semantic version
    private boolean isValidSemanticVersion(String version) {
        if (version == null || version.trim().isEmpty()) {
            return false;
        }
        // Basic semantic version validation (X.Y.Z format)
        return version.matches("^\\d+\\.\\d+\\.\\d+$");
    }

    // Getters
    public Long getVersionId() {
        return versionId;
    }

    public UUID getUnitId() {
        return unitId;
    }

    public String getVersionNumber() {
        return versionNumber;
    }

    public JsonNode getContentData() {
        return contentData;
    }

    public boolean isActive() {
        return isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
