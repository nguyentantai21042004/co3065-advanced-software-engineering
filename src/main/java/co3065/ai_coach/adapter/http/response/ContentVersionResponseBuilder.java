package co3065.ai_coach.adapter.http.response;

import org.springframework.stereotype.Component;

import co3065.ai_coach.adapter.http.dto.ContentVersionResponse;
import co3065.ai_coach.models.ContentVersion;

/**
 * ContentVersion Response Builder
 */
@Component
public class ContentVersionResponseBuilder {
    
    public ContentVersionResponse toResponse(ContentVersion domain) {
        if (domain == null) {
            return null;
        }
        
        return new ContentVersionResponse(
            domain.getVersionId(),
            domain.getUnitId(),
            domain.getVersionNumber(),
            domain.getContentData(),
            domain.isActive(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
}
