package co3065.ai_coach.models;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity - UnitTag
 * Entity cho liên kết N:M giữa ContentUnit và MetadataTag
 */
public class UnitTag {
    private UUID unitId;
    private Integer tagId;
    private Float relevanceScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor cho tạo unit tag mới
    public UnitTag(UUID unitId, Integer tagId, Float relevanceScore) {
        this.unitId = unitId;
        this.tagId = tagId;
        this.relevanceScore = relevanceScore;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ (từ database)
    public UnitTag(UUID unitId, Integer tagId, Float relevanceScore, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.unitId = unitId;
        this.tagId = tagId;
        this.relevanceScore = relevanceScore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Business logic validation
    public boolean hasValidUnitId() {
        return unitId != null;
    }

    public boolean hasValidTagId() {
        return tagId != null;
    }

    public boolean hasValidRelevanceScore() {
        return relevanceScore != null && relevanceScore >= 0.0f && relevanceScore <= 1.0f;
    }

    public boolean isValid() {
        return hasValidUnitId() && hasValidTagId() && hasValidRelevanceScore();
    }

    public void updateRelevanceScore(Float newRelevanceScore) {
        if (newRelevanceScore == null) {
            throw new IllegalArgumentException("Relevance score cannot be null");
        }
        if (newRelevanceScore < 0.0f || newRelevanceScore > 1.0f) {
            throw new IllegalArgumentException("Relevance score must be between 0.0 and 1.0");
        }
        this.relevanceScore = newRelevanceScore;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public UUID getUnitId() {
        return unitId;
    }

    public Integer getTagId() {
        return tagId;
    }

    public Float getRelevanceScore() {
        return relevanceScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
