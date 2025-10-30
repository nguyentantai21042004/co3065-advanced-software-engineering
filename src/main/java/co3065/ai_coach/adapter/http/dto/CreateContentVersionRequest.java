package co3065.ai_coach.adapter.http.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

/**
 * Create ContentVersion Request DTO
 */
public class CreateContentVersionRequest {
    @JsonProperty("unit_id")
    private UUID unitId;

    @JsonProperty("version_number")
    private String versionNumber;

    @JsonProperty("content_data")
    private JsonNode contentData;

    @JsonProperty("is_active")
    private boolean isActive;

    // Default constructor
    public CreateContentVersionRequest() {}

    // Constructor
    public CreateContentVersionRequest(UUID unitId, String versionNumber, JsonNode contentData, boolean isActive) {
        this.unitId = unitId;
        this.versionNumber = versionNumber;
        this.contentData = contentData;
        this.isActive = isActive;
    }

    // Getters and Setters
    public UUID getUnitId() {
        return unitId;
    }

    public void setUnitId(UUID unitId) {
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
}
