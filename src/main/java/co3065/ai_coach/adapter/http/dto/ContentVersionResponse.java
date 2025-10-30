package co3065.ai_coach.adapter.http.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;

/**
 * ContentVersion Response DTO
 */
public class ContentVersionResponse {
    @JsonProperty("version_id")
    private Long versionId;

    @JsonProperty("unit_id")
    private java.util.UUID unitId;

    @JsonProperty("version_number")
    private String versionNumber;

    @JsonProperty("content_data")
    private JsonNode contentData;

    @JsonProperty("is_active")
    private boolean isActive;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public ContentVersionResponse() {}

    // Constructor
    public ContentVersionResponse(Long versionId, java.util.UUID unitId, String versionNumber, 
                                 JsonNode contentData, boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.versionId = versionId;
        this.unitId = unitId;
        this.versionNumber = versionNumber;
        this.contentData = contentData;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public java.util.UUID getUnitId() {
        return unitId;
    }

    public void setUnitId(java.util.UUID unitId) {
        this.unitId = unitId;
    }

    public String getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(String versionNumber) {
        this.versionNumber = versionNumber;
    }

    public JsonNode getContentData() {
        return contentData;
    }

    public void setContentData(JsonNode contentData) {
        this.contentData = contentData;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
