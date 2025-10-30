package co3065.ai_coach.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co3065.ai_coach.models.ContentVersion;
import co3065.ai_coach.usecase.types.ContentVersionPageResult;
import co3065.ai_coach.usecase.types.ContentVersionSearchCriteria;
import co3065.ai_coach.usecase.types.CreateContentVersionCommand;
import co3065.ai_coach.usecase.types.UpdateContentVersionCommand;

/**
 * ContentVersion Use Case Interface - Tất cả use cases cho ContentVersion domain
 */
public interface ContentVersionUseCase {
    // Create
    ContentVersion create(CreateContentVersionCommand command);
    
    // Read
    Optional<ContentVersion> detail(Long versionId);
    ContentVersionPageResult list(ContentVersionSearchCriteria criteria);
    List<ContentVersion> findByUnitId(UUID unitId);
    Optional<ContentVersion> findActiveVersionByUnitId(UUID unitId);
    
    // Update
    Optional<ContentVersion> update(Long versionId, UpdateContentVersionCommand command);
    Optional<ContentVersion> setActiveVersion(Long versionId, UUID unitId);
    
    // Delete
    int deletes(List<Long> versionIds);
    
    // Existence check
    boolean existsById(Long versionId);
}
