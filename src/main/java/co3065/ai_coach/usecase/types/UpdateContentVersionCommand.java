package co3065.ai_coach.usecase.types;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Command object cho việc cập nhật content version
 */
public class UpdateContentVersionCommand {
    private final String versionNumber;
    private final JsonNode contentData;
    private final Boolean isActive;

    public UpdateContentVersionCommand(String versionNumber, JsonNode contentData, Boolean isActive) {
        this.versionNumber = versionNumber;
        this.contentData = contentData;
        this.isActive = isActive;
    }

    public String getVersionNumber() {
        return versionNumber;
    }

    public JsonNode getContentData() {
        return contentData;
    }

    public Boolean getIsActive() {
        return isActive;
    }
}
