package co3065.ai_coach.mappers;

import org.springframework.stereotype.Component;

import co3065.ai_coach.models.ContentUnit;
import co3065.ai_coach.repository.postgresql.entity.ContentUnitEntity;

/**
 * ContentUnit Mapper - Chuyển đổi giữa Domain và Entity
 */
@Component
public class ContentUnitMapper {
    
    /**
     * Chuyển từ Domain sang Entity
     */
    public ContentUnitEntity toEntity(ContentUnit domain) {
        if (domain == null) {
            return null;
        }
        
        return new ContentUnitEntity(
            domain.getUnitId(),
            domain.getChapterId(),
            domain.getUnitType(),
            domain.getMetadataConfig(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
    
    /**
     * Chuyển từ Entity sang Domain
     */
    public ContentUnit toDomain(ContentUnitEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return new ContentUnit(
            entity.getUnitId(),
            entity.getChapterId(),
            entity.getUnitType(),
            entity.getMetadataConfig(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
