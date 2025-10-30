package co3065.ai_coach.adapter.http.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import co3065.ai_coach.models.ContentUnit;

import java.util.UUID;

/**
 * Create ContentUnit Request DTO
 */
public class CreateContentUnitRequest {
    @JsonProperty("chapter_id")
    private UUID chapterId;

    @JsonProperty("unit_type")
    private ContentUnit.UnitType unitType;

    @JsonProperty("metadata_config")
    private JsonNode metadataConfig;

    // Default constructor
    public CreateContentUnitRequest() {}

    // Constructor
    public CreateContentUnitRequest(UUID chapterId, ContentUnit.UnitType unitType, JsonNode metadataConfig) {
        this.chapterId = chapterId;
        this.unitType = unitType;
        this.metadataConfig = metadataConfig;
    }

    // Getters and Setters
    public UUID getChapterId() {
        return chapterId;
    }

    public void setChapterId(UUID chapterId) {
        this.chapterId = chapterId;
    }

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
