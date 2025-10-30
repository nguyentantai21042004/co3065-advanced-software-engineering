package co3065.ai_coach.usecase.types;

import java.util.UUID;

/**
 * Command object cho việc tạo unit tag mới
 */
public class CreateUnitTagCommand {
    private final UUID unitId;
    private final Integer tagId;
    private final Float relevanceScore;

    public CreateUnitTagCommand(UUID unitId, Integer tagId, Float relevanceScore) {
        this.unitId = unitId;
        this.tagId = tagId;
        this.relevanceScore = relevanceScore;
    }

    public UUID getUnitId() {
        return unitId;
    }

    public Integer getTagId() {
        return tagId;
    }

    public Float getRelevanceScore() {
        return relevanceScore;
    }
}
