package co3065.ai_coach.repository.postgresql.specification;

import org.springframework.data.jpa.domain.Specification;

import co3065.ai_coach.repository.postgresql.entity.ContentVersionEntity;

import java.util.List;
import java.util.UUID;

/**
 * ContentVersion Specification cho JPA queries
 */
public class ContentVersionSpecification {
    
    public static Specification<ContentVersionEntity> builder() {
        return Specification.where(null);
    }

    public static Specification<ContentVersionEntity> keyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }
        String searchPattern = "%" + keyword.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("versionNumber").as(String.class)), searchPattern),
            cb.like(cb.lower(root.get("unitId").as(String.class)), searchPattern)
        );
    }

    public static Specification<ContentVersionEntity> versionIds(List<Long> versionIds) {
        if (versionIds == null || versionIds.isEmpty()) {
            return null;
        }
        return (root, query, cb) -> root.get("versionId").in(versionIds);
    }

    public static Specification<ContentVersionEntity> unitId(UUID unitId) {
        if (unitId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("unitId"), unitId);
    }

    public static Specification<ContentVersionEntity> versionNumber(String versionNumber) {
        if (versionNumber == null || versionNumber.trim().isEmpty()) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("versionNumber"), versionNumber);
    }

    public static Specification<ContentVersionEntity> isActive(Boolean isActive) {
        if (isActive == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("isActive"), isActive);
    }

    public static class Builder {
        private Specification<ContentVersionEntity> spec = Specification.where(null);

        public Builder keyword(String keyword) {
            Specification<ContentVersionEntity> keywordSpec = ContentVersionSpecification.keyword(keyword);
            if (keywordSpec != null) {
                spec = spec.and(keywordSpec);
            }
            return this;
        }

        public Builder versionIds(List<Long> versionIds) {
            Specification<ContentVersionEntity> versionIdsSpec = ContentVersionSpecification.versionIds(versionIds);
            if (versionIdsSpec != null) {
                spec = spec.and(versionIdsSpec);
            }
            return this;
        }

        public Builder unitId(UUID unitId) {
            Specification<ContentVersionEntity> unitIdSpec = ContentVersionSpecification.unitId(unitId);
            if (unitIdSpec != null) {
                spec = spec.and(unitIdSpec);
            }
            return this;
        }

        public Builder versionNumber(String versionNumber) {
            Specification<ContentVersionEntity> versionNumberSpec = ContentVersionSpecification.versionNumber(versionNumber);
            if (versionNumberSpec != null) {
                spec = spec.and(versionNumberSpec);
            }
            return this;
        }

        public Builder isActive(Boolean isActive) {
            Specification<ContentVersionEntity> isActiveSpec = ContentVersionSpecification.isActive(isActive);
            if (isActiveSpec != null) {
                spec = spec.and(isActiveSpec);
            }
            return this;
        }

        public Specification<ContentVersionEntity> build() {
            return spec;
        }
    }
}
