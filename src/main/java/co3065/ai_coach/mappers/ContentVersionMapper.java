package co3065.ai_coach.mappers;

import org.springframework.stereotype.Component;

import co3065.ai_coach.models.ContentVersion;
import co3065.ai_coach.repository.postgresql.entity.ContentVersionEntity;

/**
 * ContentVersion Mapper - Chuyển đổi giữa Domain và Entity
 */
@Component
public class ContentVersionMapper {
    
    /**
     * Chuyển từ Domain sang Entity
     */
    public ContentVersionEntity toEntity(ContentVersion domain) {
        if (domain == null) {
            return null;
        }
        
        return new ContentVersionEntity(
            domain.getVersionId(),
            domain.getUnitId(),
            domain.getVersionNumber(),
            domain.getContentData(),
            domain.isActive(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
    
    /**
     * Chuyển từ Entity sang Domain
     */
    public ContentVersion toDomain(ContentVersionEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return new ContentVersion(
            entity.getVersionId(),
            entity.getUnitId(),
            entity.getVersionNumber(),
            entity.getContentData(),
            entity.isActive(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
