package co3065.ai_coach.repository.postgresql;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import co3065.ai_coach.mappers.ContentVersionMapper;
import co3065.ai_coach.models.ContentVersion;
import co3065.ai_coach.repository.ContentVersionRepository;
import co3065.ai_coach.repository.postgresql.entity.ContentVersionEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * JPA ContentVersion Repository Implementation
 */
@Repository
public class JpaContentVersionRepository implements ContentVersionRepository {
    private final ContentVersionJpaRepository jpaRepository;
    private final ContentVersionMapper mapper;

    public JpaContentVersionRepository(ContentVersionJpaRepository jpaRepository, ContentVersionMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public ContentVersion save(ContentVersion contentVersion) {
        ContentVersionEntity entity = mapper.toEntity(contentVersion);
        ContentVersionEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<ContentVersion> findById(Long versionId) {
        Optional<ContentVersionEntity> entityOpt = jpaRepository.findById(versionId);
        return entityOpt.map(mapper::toDomain);
    }

    @Override
    public List<ContentVersion> findAllByIds(List<Long> versionIds) {
        List<ContentVersionEntity> entities = jpaRepository.findByIdIn(versionIds);
        return entities.stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ContentVersion> findAll(Specification<ContentVersionEntity> spec, Pageable pageable) {
        Page<ContentVersionEntity> entityPage = jpaRepository.findAll(spec, pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    public List<ContentVersion> findByUnitId(UUID unitId) {
        List<ContentVersionEntity> entities = jpaRepository.findByUnitId(unitId);
        return entities.stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ContentVersion> findActiveVersionByUnitId(UUID unitId) {
        Optional<ContentVersionEntity> entityOpt = jpaRepository.findByUnitIdAndIsActiveTrue(unitId);
        return entityOpt.map(mapper::toDomain);
    }

    @Override
    @Transactional
    public void deactivateAllVersionsByUnitId(UUID unitId) {
        jpaRepository.deactivateAllVersionsByUnitId(unitId);
    }

    @Override
    @Transactional
    public int deleteByIds(List<Long> versionIds) {
        jpaRepository.deleteAllById(versionIds);
        return versionIds.size();
    }

    @Override
    public boolean existsById(Long versionId) {
        return jpaRepository.existsById(versionId);
    }
}
