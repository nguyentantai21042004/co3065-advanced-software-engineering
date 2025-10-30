package co3065.ai_coach.models;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity - ContentUnit
 * Entity cho đơn vị nội dung (bài học/quiz/assignment)
 */
public class ContentUnit {
    private UUID unitId;
    private UUID chapterId;
    private UnitType unitType;
    private JsonNode metadataConfig;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor cho tạo content unit mới (chưa có unitId)
    public ContentUnit(UUID chapterId, UnitType unitType, JsonNode metadataConfig) {
        this.unitId = UUID.randomUUID();
        this.chapterId = chapterId;
        this.unitType = unitType;
        this.metadataConfig = metadataConfig;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ (có unitId - từ database)
    public ContentUnit(UUID unitId, UUID chapterId, UnitType unitType, JsonNode metadataConfig,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.unitId = unitId;
        this.chapterId = chapterId;
        this.unitType = unitType;
        this.metadataConfig = metadataConfig;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Business logic validation
    public boolean hasValidChapterId() {
        return chapterId != null;
    }

    public boolean hasValidUnitType() {
        return unitType != null;
    }

    public boolean hasValidMetadataConfig() {
        return metadataConfig != null && !metadataConfig.isEmpty();
    }

    public boolean isValid() {
        return hasValidChapterId() && hasValidUnitType() && hasValidMetadataConfig();
    }

    public void updateUnitType(UnitType newUnitType) {
        if (newUnitType == null) {
            throw new IllegalArgumentException("Unit type cannot be null");
        }
        this.unitType = newUnitType;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateMetadataConfig(JsonNode newMetadataConfig) {
        if (newMetadataConfig == null || newMetadataConfig.isEmpty()) {
            throw new IllegalArgumentException("Metadata config cannot be null or empty");
        }
        this.metadataConfig = newMetadataConfig;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public UUID getUnitId() {
        return unitId;
    }

    public UUID getChapterId() {
        return chapterId;
    }

    public UnitType getUnitType() {
        return unitType;
    }

    public JsonNode getMetadataConfig() {
        return metadataConfig;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Enum cho Unit Type
    public enum UnitType {
        TEXT, VIDEO, QUIZ, CODING_TASK
    }
}
