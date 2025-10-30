package co3065.ai_coach.usecase.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co3065.ai_coach.models.Course;
import co3065.ai_coach.repository.CourseRepository;
import co3065.ai_coach.usecase.CourseUseCase;
import co3065.ai_coach.usecase.types.CoursePageResult;
import co3065.ai_coach.usecase.types.CourseSearchCriteria;
import co3065.ai_coach.usecase.types.CreateCourseCommand;
import co3065.ai_coach.usecase.types.UpdateCourseCommand;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Course Service Implementation - Tất cả business logic cho Course domain
 */
@Service
@Transactional
public class CourseService implements CourseUseCase {
    
    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public Course create(CreateCourseCommand command) {
        // Business validation
        if (command.getTitle() == null || command.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Course title cannot be null or empty");
        }

        if (command.getDescription() == null || command.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Course description cannot be null or empty");
        }

        if (command.getInstructorId() == null) {
            throw new IllegalArgumentException("Instructor ID cannot be null");
        }

        if (command.getStructureType() == null) {
            throw new IllegalArgumentException("Structure type cannot be null");
        }

        // Check duplicate title
        if (courseRepository.existsByTitle(command.getTitle())) {
            throw new IllegalArgumentException("Course with this title already exists");
        }

        // Tạo domain entity
        Course course = new Course(
            command.getTitle(), 
            command.getDescription(), 
            command.getInstructorId(), 
            command.getStructureType()
        );

        // Domain validation
        if (!course.isValid()) {
            throw new IllegalArgumentException("Invalid course data");
        }

        // Lưu vào database
        return courseRepository.save(course);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Course> detail(UUID courseId) {
        if (courseId == null) {
            throw new IllegalArgumentException("Course ID cannot be null");
        }
        return courseRepository.findById(courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public CoursePageResult list(CourseSearchCriteria criteria) {
        if (criteria == null) {
            criteria = new CourseSearchCriteria(); // Default criteria
        }
        
        // Validate pagination parameters
        if (criteria.getPage() < 0) {
            criteria.setPage(0);
        }
        if (criteria.getSize() <= 0 || criteria.getSize() > 100) {
            criteria.setSize(20); // Default page size
        }
        
        return courseRepository.search(criteria);
    }

    @Override
    public Optional<Course> update(UUID courseId, UpdateCourseCommand command) {
        if (courseId == null) {
            throw new IllegalArgumentException("Course ID cannot be null");
        }

        if (command.getTitle() == null || command.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Course title cannot be null or empty");
        }

        if (command.getDescription() == null || command.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Course description cannot be null or empty");
        }

        if (command.getStructureType() == null) {
            throw new IllegalArgumentException("Structure type cannot be null");
        }

        return courseRepository.findById(courseId)
            .map(course -> {
                // Check if title is being changed and if new title already exists
                if (!course.getTitle().equals(command.getTitle()) && 
                    courseRepository.existsByTitle(command.getTitle())) {
                    throw new IllegalArgumentException("Course with this title already exists");
                }

                // Update course fields
                course.updateTitle(command.getTitle());
                course.updateDescription(command.getDescription());
                course.updateStructureType(command.getStructureType());

                return courseRepository.save(course);
            });
    }

    @Override
    public int deletes(List<UUID> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) {
            throw new IllegalArgumentException("Course IDs list cannot be null or empty");
        }

        // Validate all IDs exist before deleting
        for (UUID courseId : courseIds) {
            if (courseId == null) {
                throw new IllegalArgumentException("Course ID cannot be null");
            }
            if (!courseRepository.existsById(courseId)) {
                throw new IllegalArgumentException("Course with ID " + courseId + " not found");
            }
        }

        courseRepository.deleteByIds(courseIds);
        return courseIds.size();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(UUID courseId) {
        if (courseId == null) {
            throw new IllegalArgumentException("Course ID cannot be null");
        }
        return courseRepository.existsById(courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        return courseRepository.existsByTitle(title);
    }
}
