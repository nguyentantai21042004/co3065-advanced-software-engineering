package co3065.ai_coach.repository.postgresql;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import co3065.ai_coach.mappers.MetadataTagMapper;
import co3065.ai_coach.models.MetadataTag;
import co3065.ai_coach.repository.MetadataTagRepository;
import co3065.ai_coach.repository.postgresql.entity.MetadataTagEntity;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * JPA MetadataTag Repository Implementation
 */
@Repository
public class JpaMetadataTagRepository implements MetadataTagRepository {
    private final MetadataTagJpaRepository jpaRepository;
    private final MetadataTagMapper mapper;

    public JpaMetadataTagRepository(MetadataTagJpaRepository jpaRepository, MetadataTagMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public MetadataTag save(MetadataTag metadataTag) {
        MetadataTagEntity entity = mapper.toEntity(metadataTag);
        MetadataTagEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<MetadataTag> findById(Integer tagId) {
        Optional<MetadataTagEntity> entityOpt = jpaRepository.findById(tagId);
        return entityOpt.map(mapper::toDomain);
    }

    @Override
    public List<MetadataTag> findAllByIds(List<Integer> tagIds) {
        List<MetadataTagEntity> entities = jpaRepository.findByIdIn(tagIds);
        return entities.stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<MetadataTag> findAll(Specification<MetadataTagEntity> spec, Pageable pageable) {
        Page<MetadataTagEntity> entityPage = jpaRepository.findAll(spec, pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    public boolean existsByTagName(String tagName) {
        return jpaRepository.existsByTagName(tagName);
    }

    @Override
    @Transactional
    public int deleteByIds(List<Integer> tagIds) {
        jpaRepository.deleteAllById(tagIds);
        return tagIds.size();
    }

    @Override
    public boolean existsById(Integer tagId) {
        return jpaRepository.existsById(tagId);
    }
}
