package co3065.ai_coach.adapter.http.response;

import org.springframework.stereotype.Component;

import co3065.ai_coach.adapter.http.dto.ContentUnitResponse;
import co3065.ai_coach.models.ContentUnit;

/**
 * ContentUnit Response Builder
 */
@Component
public class ContentUnitResponseBuilder {
    
    public ContentUnitResponse toResponse(ContentUnit domain) {
        if (domain == null) {
            return null;
        }
        
        return new ContentUnitResponse(
            domain.getUnitId(),
            domain.getChapterId(),
            domain.getUnitType(),
            domain.getMetadataConfig(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
}
