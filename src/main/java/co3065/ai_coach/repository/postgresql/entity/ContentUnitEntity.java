package co3065.ai_coach.repository.postgresql.entity;

import com.fasterxml.jackson.databind.JsonNode;

import co3065.ai_coach.models.ContentUnit;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ContentUnit Entity cho PostgreSQL
 */
@Entity
@Table(name = "content_units")
public class ContentUnitEntity {
    @Id
    @Column(name = "unit_id")
    private UUID unitId;

    @Column(name = "chapter_id", nullable = false)
    private UUID chapterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_type", nullable = false, length = 20)
    private ContentUnit.UnitType unitType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_config", nullable = false, columnDefinition = "jsonb")
    private JsonNode metadataConfig;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Default constructor
    public ContentUnitEntity() {}

    // Constructor
    public ContentUnitEntity(UUID unitId, UUID chapterId, ContentUnit.UnitType unitType, 
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

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
