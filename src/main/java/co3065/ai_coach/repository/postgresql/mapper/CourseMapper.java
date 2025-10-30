package co3065.ai_coach.repository.postgresql.mapper;

import co3065.ai_coach.models.Course;
import co3065.ai_coach.repository.postgresql.entity.CourseEntity;

/**
 * Mapper chuyển đổi giữa Domain Course và CourseEntity (JPA)
 */
public class CourseMapper {

    /**
     * Chuyển từ Domain Course sang CourseEntity để lưu vào database
     */
    public static CourseEntity toEntity(Course course) {
        CourseEntity entity = new CourseEntity();
        entity.setCourseId(course.getCourseId());
        entity.setTitle(course.getTitle());
        entity.setDescription(course.getDescription());
        entity.setInstructorId(course.getInstructorId());
        entity.setStructureType(convertToEntityStructureType(course.getStructureType()));
        entity.setCreatedAt(course.getCreatedAt());
        entity.setUpdatedAt(course.getUpdatedAt());
        return entity;
    }

    /**
     * Chuyển từ CourseEntity sang Domain Course sau khi đọc từ database
     */
    public static Course toDomain(CourseEntity entity) {
        return new Course(
                entity.getCourseId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getInstructorId(),
                convertToDomainStructureType(entity.getStructureType()),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }

    /**
     * Convert Domain StructureType to Entity StructureType
     */
    private static CourseEntity.StructureType convertToEntityStructureType(Course.StructureType domainType) {
        if (domainType == null) {
            return null;
        }
        return switch (domainType) {
            case LINEAR -> CourseEntity.StructureType.LINEAR;
            case ADAPTIVE -> CourseEntity.StructureType.ADAPTIVE;
        };
    }

    /**
     * Convert Entity StructureType to Domain StructureType
     */
    private static Course.StructureType convertToDomainStructureType(CourseEntity.StructureType entityType) {
        if (entityType == null) {
            return null;
        }
        return switch (entityType) {
            case LINEAR -> Course.StructureType.LINEAR;
            case ADAPTIVE -> Course.StructureType.ADAPTIVE;
        };
    }
}
