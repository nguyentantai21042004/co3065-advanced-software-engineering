package co3065.ai_coach.adapter.http.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Update ContentVersion Request DTO
 */
public class UpdateContentVersionRequest {
    @JsonProperty("version_number")
    private String versionNumber;

    @JsonProperty("content_data")
    private JsonNode contentData;

    @JsonProperty("is_active")
    private Boolean isActive;

    // Default constructor
    public UpdateContentVersionRequest() {}

    // Constructor
    public UpdateContentVersionRequest(String versionNumber, JsonNode contentData, Boolean isActive) {
        this.versionNumber = versionNumber;
        this.contentData = contentData;
        this.isActive = isActive;
    }

    // Getters and Setters
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
