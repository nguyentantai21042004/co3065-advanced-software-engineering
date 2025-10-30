package co3065.ai_coach.usecase.types;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

/**
 * Command object cho việc tạo content version mới
 */
public class CreateContentVersionCommand {
    private final UUID unitId;
    private final String versionNumber;
    private final JsonNode contentData;
    private final boolean isActive;

    public CreateContentVersionCommand(UUID unitId, String versionNumber, JsonNode contentData, boolean isActive) {
        this.unitId = unitId;
        this.versionNumber = versionNumber;
        this.contentData = contentData;
        this.isActive = isActive;
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
}
