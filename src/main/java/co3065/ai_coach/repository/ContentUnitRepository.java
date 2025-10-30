package co3065.ai_coach.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import co3065.ai_coach.models.ContentUnit;
import co3065.ai_coach.repository.postgresql.entity.ContentUnitEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * ContentUnit Repository Interface
 * Repository pattern cho ContentUnit domain
 */
public interface ContentUnitRepository {
    ContentUnit save(ContentUnit contentUnit);
    Optional<ContentUnit> findById(UUID unitId);
    List<ContentUnit> findAllByIds(List<UUID> unitIds);
    Page<ContentUnit> findAll(Specification<ContentUnitEntity> spec, Pageable pageable);
    int deleteByIds(List<UUID> unitIds);
    boolean existsById(UUID unitId);
}
