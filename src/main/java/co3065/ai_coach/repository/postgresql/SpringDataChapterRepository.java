package co3065.ai_coach.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import co3065.ai_coach.repository.postgresql.entity.ChapterEntity;

import java.util.UUID;

/**
 * Spring Data JPA Repository cho Chapter với dynamic query support
 */
public interface SpringDataChapterRepository extends JpaRepository<ChapterEntity, UUID>, JpaSpecificationExecutor<ChapterEntity> {
    
    boolean existsByCourseIdAndSequenceNumber(UUID courseId, Integer sequenceNumber);
}
