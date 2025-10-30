package co3065.ai_coach.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co3065.ai_coach.models.Course;
import co3065.ai_coach.usecase.types.CoursePageResult;
import co3065.ai_coach.usecase.types.CourseSearchCriteria;
import co3065.ai_coach.usecase.types.CreateCourseCommand;
import co3065.ai_coach.usecase.types.UpdateCourseCommand;

/**
 * Course Use Case Interface - Tất cả use cases cho Course domain
 */
public interface CourseUseCase {
    // Create
    Course create(CreateCourseCommand command);
    
    // Read
    Optional<Course> detail(UUID courseId);
    CoursePageResult list(CourseSearchCriteria criteria);
    
    // Update
    Optional<Course> update(UUID courseId, UpdateCourseCommand command);
    
    // Delete
    int deletes(List<UUID> courseIds);
    
    // Existence check
    boolean existsById(UUID courseId);
    boolean existsByTitle(String title);
}
