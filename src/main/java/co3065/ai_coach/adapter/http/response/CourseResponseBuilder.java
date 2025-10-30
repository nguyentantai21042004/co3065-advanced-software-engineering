package co3065.ai_coach.adapter.http.response;

import java.util.List;
import java.util.stream.Collectors;

import co3065.ai_coach.adapter.http.dto.CourseResponse;
import co3065.ai_coach.models.Course;

/**
 * Response Builder cho Course
 * Chuyển đổi từ Domain → Response DTO
 */
public class CourseResponseBuilder {

    /**
     * Chuyển Domain Course → CourseResponse DTO
     */
    public static CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getCourseId(),
                course.getTitle(),
                course.getDescription(),
                course.getInstructorId(),
                course.getStructureType(),
                course.getCreatedAt(),
                course.getUpdatedAt());
    }

    /**
     * Chuyển List Domain Course → List CourseResponse DTO
     */
    public static List<CourseResponse> toResponseList(List<Course> courses) {
        return courses.stream()
                .map(CourseResponseBuilder::toResponse)
                .collect(Collectors.toList());
    }
}
