package co3065.ai_coach.adapter.http.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import co3065.ai_coach.models.ContentUnit;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ContentUnit Response DTO
 */
public class ContentUnitResponse {
    @JsonProperty("unit_id")
    private UUID unitId;

    @JsonProperty("chapter_id")
    private UUID chapterId;

    @JsonProperty("unit_type")
    private ContentUnit.UnitType unitType;

    @JsonProperty("metadata_config")
    private JsonNode metadataConfig;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public ContentUnitResponse() {}

    // Constructor
    public ContentUnitResponse(UUID unitId, UUID chapterId, ContentUnit.UnitType unitType, 
                              JsonNode metadataConfig, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.unitId = unitId;
        this.chapterId = chapterId;
        this.unitType = unitType;
        this.metadataConfig = metadataConfig;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public UUID getUnitId() {
        return unitId;
    }

    public void setUnitId(UUID unitId) {
        this.unitId = unitId;
    }

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
