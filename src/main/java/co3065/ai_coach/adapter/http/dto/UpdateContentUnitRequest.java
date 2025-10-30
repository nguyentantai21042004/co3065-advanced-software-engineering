package co3065.ai_coach.adapter.http.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import co3065.ai_coach.models.ContentUnit;

/**
 * Update ContentUnit Request DTO
 */
public class UpdateContentUnitRequest {
    @JsonProperty("unit_type")
    private ContentUnit.UnitType unitType;

    @JsonProperty("metadata_config")
    private JsonNode metadataConfig;

    // Default constructor
    public UpdateContentUnitRequest() {}

    // Constructor
    public UpdateContentUnitRequest(ContentUnit.UnitType unitType, JsonNode metadataConfig) {
        this.unitType = unitType;
        this.metadataConfig = metadataConfig;
    }

    // Getters and Setters
    public ContentUnit.UnitType getUnitType() {
        return unitType;
    }

    public void setUnitType(ContentUnit.UnitType unitType) {
        this.unitType = unitType;
    }

    public JsonNode getMetadataConfig() {
        return metadataConfig;
    }

    public void setMetadataConfig(JsonNode metadataConfig) {
        this.metadataConfig = metadataConfig;
    }
}
