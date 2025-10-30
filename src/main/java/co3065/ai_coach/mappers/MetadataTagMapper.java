package co3065.ai_coach.mappers;

import org.springframework.stereotype.Component;

import co3065.ai_coach.models.MetadataTag;
import co3065.ai_coach.repository.postgresql.entity.MetadataTagEntity;

/**
 * MetadataTag Mapper - Chuyển đổi giữa Domain và Entity
 */
@Component
public class MetadataTagMapper {
    
    /**
     * Chuyển từ Domain sang Entity
     */
    public MetadataTagEntity toEntity(MetadataTag domain) {
        if (domain == null) {
            return null;
        }
        
        return new MetadataTagEntity(
            domain.getTagId(),
            domain.getTagName(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
    
    /**
     * Chuyển từ Entity sang Domain
     */
    public MetadataTag toDomain(MetadataTagEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return new MetadataTag(
            entity.getTagId(),
            entity.getTagName(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
