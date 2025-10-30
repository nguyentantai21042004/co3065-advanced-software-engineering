package co3065.ai_coach.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import co3065.ai_coach.repository.postgresql.entity.MetadataTagEntity;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository Interface cho MetadataTagEntity
 */
@Repository
public interface MetadataTagJpaRepository extends JpaRepository<MetadataTagEntity, Integer>, JpaSpecificationExecutor<MetadataTagEntity> {
    
    boolean existsByTagName(String tagName);
    
    Optional<MetadataTagEntity> findByTagName(String tagName);
    
    List<MetadataTagEntity> findByIdIn(List<Integer> tagIds);
}
