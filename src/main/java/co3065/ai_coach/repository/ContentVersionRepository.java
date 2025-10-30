package co3065.ai_coach.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import co3065.ai_coach.models.ContentVersion;
import co3065.ai_coach.repository.postgresql.entity.ContentVersionEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * ContentVersion Repository Interface
 * Repository pattern cho ContentVersion domain
 */
public interface ContentVersionRepository {
    ContentVersion save(ContentVersion contentVersion);
    Optional<ContentVersion> findById(Long versionId);
    List<ContentVersion> findAllByIds(List<Long> versionIds);
    Page<ContentVersion> findAll(Specification<ContentVersionEntity> spec, Pageable pageable);
    List<ContentVersion> findByUnitId(UUID unitId);
    Optional<ContentVersion> findActiveVersionByUnitId(UUID unitId);
    void deactivateAllVersionsByUnitId(UUID unitId);
    int deleteByIds(List<Long> versionIds);
    boolean existsById(Long versionId);
}
