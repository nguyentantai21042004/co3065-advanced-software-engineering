package co3065.ai_coach.repository.postgresql.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import co3065.ai_coach.repository.postgresql.entity.CourseEntity;
import co3065.ai_coach.usecase.types.CourseSearchCriteria;

import java.util.ArrayList;
import java.util.List;

/**
 * Specification cho dynamic query Course
 */
public class CourseSpecification {

    public static Specification<CourseEntity> createSpecification(CourseSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by title (contains)
            if (StringUtils.hasText(criteria.getTitle())) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    "%" + criteria.getTitle().toLowerCase() + "%"
                ));
            }

            // Search by instructor ID
            if (criteria.getInstructorId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("instructorId"), criteria.getInstructorId()));
            }

            // Search by structure type
            if (criteria.getStructureType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("structureType"), 
                    convertToEntityStructureType(criteria.getStructureType())));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Convert Domain StructureType to Entity StructureType
     */
    private static CourseEntity.StructureType convertToEntityStructureType(
            co3065.ai_coach.models.Course.StructureType domainType) {
        return switch (domainType) {
            case LINEAR -> CourseEntity.StructureType.LINEAR;
            case ADAPTIVE -> CourseEntity.StructureType.ADAPTIVE;
        };
    }
}
