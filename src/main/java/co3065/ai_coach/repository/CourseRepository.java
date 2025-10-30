package co3065.ai_coach.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co3065.ai_coach.models.Course;
import co3065.ai_coach.usecase.types.CoursePageResult;
import co3065.ai_coach.usecase.types.CourseSearchCriteria;

/**
 * Port Out - Repository interface cho Course
 * Infrastructure layer sẽ implement interface này
 */
public interface CourseRepository {
    Course save(Course course);
    Optional<Course> findById(UUID courseId);
    CoursePageResult search(CourseSearchCriteria criteria);
    void deleteByIds(List<UUID> courseIds);
    boolean existsById(UUID courseId);
    boolean existsByTitle(String title);
}
