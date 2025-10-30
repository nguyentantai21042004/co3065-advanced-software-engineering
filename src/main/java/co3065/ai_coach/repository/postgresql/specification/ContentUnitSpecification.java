package co3065.ai_coach.repository.postgresql.specification;

import org.springframework.data.jpa.domain.Specification;

import co3065.ai_coach.models.ContentUnit;
import co3065.ai_coach.repository.postgresql.entity.ContentUnitEntity;

import java.util.List;
import java.util.UUID;

/**
 * ContentUnit Specification cho JPA queries
 */
public class ContentUnitSpecification {
    
    public static Specification<ContentUnitEntity> builder() {
        return Specification.where(null);
    }

    public static Specification<ContentUnitEntity> keyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }
        String searchPattern = "%" + keyword.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("unitId").as(String.class)), searchPattern),
            cb.like(cb.lower(root.get("unitType").as(String.class)), searchPattern)
        );
    }

    public static Specification<ContentUnitEntity> unitIds(List<UUID> unitIds) {
        if (unitIds == null || unitIds.isEmpty()) {
            return null;
        }
        return (root, query, cb) -> root.get("unitId").in(unitIds);
    }

    public static Specification<ContentUnitEntity> chapterId(UUID chapterId) {
        if (chapterId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("chapterId"), chapterId);
    }

    public static Specification<ContentUnitEntity> unitType(ContentUnit.UnitType unitType) {
        if (unitType == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("unitType"), unitType);
    }

    public static class Builder {
        private Specification<ContentUnitEntity> spec = Specification.where(null);

        public Builder keyword(String keyword) {
            Specification<ContentUnitEntity> keywordSpec = ContentUnitSpecification.keyword(keyword);
            if (keywordSpec != null) {
                spec = spec.and(keywordSpec);
            }
            return this;
        }

        public Builder unitIds(List<UUID> unitIds) {
            Specification<ContentUnitEntity> unitIdsSpec = ContentUnitSpecification.unitIds(unitIds);
            if (unitIdsSpec != null) {
                spec = spec.and(unitIdsSpec);
            }
            return this;
        }

        public Builder chapterId(UUID chapterId) {
            Specification<ContentUnitEntity> chapterIdSpec = ContentUnitSpecification.chapterId(chapterId);
            if (chapterIdSpec != null) {
                spec = spec.and(chapterIdSpec);
            }
            return this;
        }

        public Builder unitType(ContentUnit.UnitType unitType) {
            Specification<ContentUnitEntity> unitTypeSpec = ContentUnitSpecification.unitType(unitType);
            if (unitTypeSpec != null) {
                spec = spec.and(unitTypeSpec);
            }
            return this;
        }

        public Specification<ContentUnitEntity> build() {
            return spec;
        }
    }
}
