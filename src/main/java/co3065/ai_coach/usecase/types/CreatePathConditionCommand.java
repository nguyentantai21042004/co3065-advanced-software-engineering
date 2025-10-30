package co3065.ai_coach.usecase.types;

import java.util.UUID;

/**
 * Command object cho việc tạo path condition mới
 */
public class CreatePathConditionCommand {
    private final UUID sourceUnitId;
    private final UUID targetUnitId;
    private final Integer requiredScorePct;

    public CreatePathConditionCommand(UUID sourceUnitId, UUID targetUnitId, Integer requiredScorePct) {
        this.sourceUnitId = sourceUnitId;
        this.targetUnitId = targetUnitId;
        this.requiredScorePct = requiredScorePct;
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
}
