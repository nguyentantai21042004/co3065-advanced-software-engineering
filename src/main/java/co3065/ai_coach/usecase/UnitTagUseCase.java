package co3065.ai_coach.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co3065.ai_coach.models.UnitTag;
import co3065.ai_coach.usecase.types.CreateUnitTagCommand;
import co3065.ai_coach.usecase.types.UpdateUnitTagCommand;

/**
 * UnitTag Use Case Interface - Tất cả use cases cho UnitTag domain
 */
public interface UnitTagUseCase {
    // Create
    UnitTag create(CreateUnitTagCommand command);
    
    // Read
    Optional<UnitTag> findByUnitIdAndTagId(UUID unitId, Integer tagId);
    List<UnitTag> findByUnitId(UUID unitId);
    List<UnitTag> findByTagId(Integer tagId);
    
    // Update
    Optional<UnitTag> update(UUID unitId, Integer tagId, UpdateUnitTagCommand command);
    
    // Delete
    int deleteByUnitIdAndTagId(UUID unitId, Integer tagId);
    int deleteByUnitId(UUID unitId);
    int deleteByTagId(Integer tagId);
    
    // Existence check
    boolean existsByUnitIdAndTagId(UUID unitId, Integer tagId);
}
