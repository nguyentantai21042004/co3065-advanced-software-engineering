package co3065.ai_coach.usecase.types;

import com.fasterxml.jackson.databind.JsonNode;

import co3065.ai_coach.models.ContentUnit;

/**
 * Command object cho việc cập nhật content unit
 */
public class UpdateContentUnitCommand {
    private final ContentUnit.UnitType unitType;
    private final JsonNode metadataConfig;

    public UpdateContentUnitCommand(ContentUnit.UnitType unitType, JsonNode metadataConfig) {
        this.unitType = unitType;
        this.metadataConfig = metadataConfig;
    }

    public ContentUnit.UnitType getUnitType() {
        return unitType;
    }

    public JsonNode getMetadataConfig() {
        return metadataConfig;
    }
}
