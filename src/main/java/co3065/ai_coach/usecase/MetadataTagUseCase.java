package co3065.ai_coach.usecase;

import java.util.List;
import java.util.Optional;

import co3065.ai_coach.models.MetadataTag;
import co3065.ai_coach.usecase.types.CreateMetadataTagCommand;
import co3065.ai_coach.usecase.types.MetadataTagPageResult;
import co3065.ai_coach.usecase.types.MetadataTagSearchCriteria;
import co3065.ai_coach.usecase.types.UpdateMetadataTagCommand;

/**
 * MetadataTag Use Case Interface - Tất cả use cases cho MetadataTag domain
 */
public interface MetadataTagUseCase {
    // Create
    MetadataTag create(CreateMetadataTagCommand command);
    
    // Read
    Optional<MetadataTag> detail(Integer tagId);
    MetadataTagPageResult list(MetadataTagSearchCriteria criteria);
    
    // Update
    Optional<MetadataTag> update(Integer tagId, UpdateMetadataTagCommand command);
    
    // Delete
    int deletes(List<Integer> tagIds);
    
    // Existence check
    boolean existsById(Integer tagId);
    boolean existsByTagName(String tagName);
}
