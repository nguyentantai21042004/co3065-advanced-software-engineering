package co3065.ai_coach.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co3065.ai_coach.models.ContentUnit;
import co3065.ai_coach.usecase.types.ContentUnitPageResult;
import co3065.ai_coach.usecase.types.ContentUnitSearchCriteria;
import co3065.ai_coach.usecase.types.CreateContentUnitCommand;
import co3065.ai_coach.usecase.types.UpdateContentUnitCommand;

/**
 * ContentUnit Use Case Interface - Tất cả use cases cho ContentUnit domain
 */
public interface ContentUnitUseCase {
    // Create
    ContentUnit create(CreateContentUnitCommand command);
    
    // Read
    Optional<ContentUnit> detail(UUID unitId);
    ContentUnitPageResult list(ContentUnitSearchCriteria criteria);
    
    // Update
    Optional<ContentUnit> update(UUID unitId, UpdateContentUnitCommand command);
    
    // Delete
    int deletes(List<UUID> unitIds);
    
    // Existence check
    boolean existsById(UUID unitId);
}
