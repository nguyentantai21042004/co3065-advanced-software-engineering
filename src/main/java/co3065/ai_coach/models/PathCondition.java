package co3065.ai_coach.models;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity - PathCondition
 * Entity cho cấu hình lộ trình học tập
 */
public class PathCondition {
    private UUID conditionId;
    private UUID sourceUnitId;
    private UUID targetUnitId;
    private Integer requiredScorePct;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor cho tạo path condition mới (chưa có conditionId)
    public PathCondition(UUID sourceUnitId, UUID targetUnitId, Integer requiredScorePct) {
        this.conditionId = UUID.randomUUID();
        this.sourceUnitId = sourceUnitId;
        this.targetUnitId = targetUnitId;
        this.requiredScorePct = requiredScorePct;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ (có conditionId - từ database)
    public PathCondition(UUID conditionId, UUID sourceUnitId, UUID targetUnitId, Integer requiredScorePct,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.conditionId = conditionId;
        this.sourceUnitId = sourceUnitId;
        this.targetUnitId = targetUnitId;
        this.requiredScorePct = requiredScorePct;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Business logic validation
    public boolean hasValidSourceUnitId() {
        return sourceUnitId != null;
    }

    public boolean hasValidTargetUnitId() {
        return targetUnitId != null;
    }

    public boolean hasValidRequiredScorePct() {
        return requiredScorePct != null && requiredScorePct >= 0 && requiredScorePct <= 100;
    }

    public boolean isNotSelfReference() {
        return !sourceUnitId.equals(targetUnitId);
    }

    public boolean isValid() {
        return hasValidSourceUnitId() && hasValidTargetUnitId() && 
               hasValidRequiredScorePct() && isNotSelfReference();
    }

    public void updateRequiredScorePct(Integer newRequiredScorePct) {
        if (newRequiredScorePct == null) {
            throw new IllegalArgumentException("Required score percentage cannot be null");
        }
        if (newRequiredScorePct < 0 || newRequiredScorePct > 100) {
            throw new IllegalArgumentException("Required score percentage must be between 0 and 100");
        }
        this.requiredScorePct = newRequiredScorePct;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public UUID getConditionId() {
        return conditionId;
    }

    public UUID getSourceUnitId() {
        return sourceUnitId;
    }

    public UUID getTargetUnitId() {
        return targetUnitId;
    }

    public Integer getRequiredScorePct() {
        return requiredScorePct;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
