package co3065.ai_coach.repository.postgresql;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import co3065.ai_coach.mappers.ContentUnitMapper;
import co3065.ai_coach.models.ContentUnit;
import co3065.ai_coach.repository.ContentUnitRepository;
import co3065.ai_coach.repository.postgresql.entity.ContentUnitEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * JPA ContentUnit Repository Implementation
 */
@Repository
public class JpaContentUnitRepository implements ContentUnitRepository {
    private final ContentUnitJpaRepository jpaRepository;
    private final ContentUnitMapper mapper;

    public JpaContentUnitRepository(ContentUnitJpaRepository jpaRepository, ContentUnitMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public ContentUnit save(ContentUnit contentUnit) {
        ContentUnitEntity entity = mapper.toEntity(contentUnit);
        ContentUnitEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<ContentUnit> findById(UUID unitId) {
        Optional<ContentUnitEntity> entityOpt = jpaRepository.findById(unitId);
        return entityOpt.map(mapper::toDomain);
    }

    @Override
    public List<ContentUnit> findAllByIds(List<UUID> unitIds) {
        List<ContentUnitEntity> entities = jpaRepository.findAllById(unitIds);
        return entities.stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ContentUnit> findAll(Specification<ContentUnitEntity> spec, Pageable pageable) {
        Page<ContentUnitEntity> entityPage = jpaRepository.findAll(spec, pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    @Modifying
    @Transactional
    public int deleteByIds(List<UUID> unitIds) {
        jpaRepository.deleteAllById(unitIds);
        return unitIds.size();
    }

    @Override
    public boolean existsById(UUID unitId) {
        return jpaRepository.existsById(unitId);
    }
}
