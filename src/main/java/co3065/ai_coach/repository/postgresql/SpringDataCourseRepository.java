package co3065.ai_coach.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import co3065.ai_coach.repository.postgresql.entity.CourseEntity;

import java.util.UUID;

/**
 * Spring Data JPA Repository cho Course với dynamic query support
 */
public interface SpringDataCourseRepository extends JpaRepository<CourseEntity, UUID>, JpaSpecificationExecutor<CourseEntity> {
    
    boolean existsByTitle(String title);
}
