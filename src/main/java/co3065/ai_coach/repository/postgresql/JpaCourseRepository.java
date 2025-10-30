package co3065.ai_coach.repository.postgresql;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import co3065.ai_coach.models.Course;
import co3065.ai_coach.repository.CourseRepository;
import co3065.ai_coach.repository.postgresql.entity.CourseEntity;
import co3065.ai_coach.repository.postgresql.mapper.CourseMapper;
import co3065.ai_coach.repository.postgresql.specification.CourseSpecification;
import co3065.ai_coach.usecase.types.CoursePageResult;
import co3065.ai_coach.usecase.types.CourseSearchCriteria;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Infrastructure Repository Implementation cho Course
 * Adapter cho persistence layer, implement Port Out interface
 */
@Repository
public class JpaCourseRepository implements CourseRepository {

    private final SpringDataCourseRepository springDataCourseRepository;

    public JpaCourseRepository(SpringDataCourseRepository springDataCourseRepository) {
        this.springDataCourseRepository = springDataCourseRepository;
    }

    @Override
    public Course save(Course course) {
        CourseEntity entity = CourseMapper.toEntity(course);
        CourseEntity savedEntity = springDataCourseRepository.save(entity);
        return CourseMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Course> findById(UUID courseId) {
        return springDataCourseRepository.findById(courseId)
            .map(CourseMapper::toDomain);
    }

    @Override
    public CoursePageResult search(CourseSearchCriteria criteria) {
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize());
        
        Specification<CourseEntity> spec = CourseSpecification.createSpecification(criteria);
        Page<CourseEntity> page = springDataCourseRepository.findAll(spec, pageable);
        
        List<Course> courses = page.getContent().stream()
            .map(CourseMapper::toDomain)
            .collect(Collectors.toList());
        
        return new CoursePageResult(
            courses,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }

    @Override
    public void deleteByIds(List<UUID> courseIds) {
        springDataCourseRepository.deleteAllById(courseIds);
    }

    @Override
    public boolean existsById(UUID courseId) {
        return springDataCourseRepository.existsById(courseId);
    }

    @Override
    public boolean existsByTitle(String title) {
        return springDataCourseRepository.existsByTitle(title);
    }
}
