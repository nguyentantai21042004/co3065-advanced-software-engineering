package co3065.ai_coach.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co3065.ai_coach.models.PathCondition;
import co3065.ai_coach.usecase.types.CreatePathConditionCommand;
import co3065.ai_coach.usecase.types.UpdatePathConditionCommand;

/**
 * PathCondition Use Case Interface - Tất cả use cases cho PathCondition domain
 */
public interface PathConditionUseCase {
    // Create
    PathCondition create(CreatePathConditionCommand command);
    
    // Read
    Optional<PathCondition> detail(UUID conditionId);
    List<PathCondition> findBySourceUnitId(UUID sourceUnitId);
    List<PathCondition> findByTargetUnitId(UUID targetUnitId);
    
    // Update
    Optional<PathCondition> update(UUID conditionId, UpdatePathConditionCommand command);
    
    // Delete
    int deletes(List<UUID> conditionIds);
    
    // Existence check
    boolean existsById(UUID conditionId);
}
