package co3065.ai_coach.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import co3065.ai_coach.repository.postgresql.entity.ContentVersionEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA Repository Interface cho ContentVersionEntity
 */
@Repository
public interface ContentVersionJpaRepository extends JpaRepository<ContentVersionEntity, Long>, JpaSpecificationExecutor<ContentVersionEntity> {
    
    List<ContentVersionEntity> findByUnitId(UUID unitId);
    
    Optional<ContentVersionEntity> findByUnitIdAndIsActiveTrue(UUID unitId);
    
    @Modifying
    @Query("UPDATE ContentVersionEntity v SET v.isActive = false WHERE v.unitId = :unitId")
    void deactivateAllVersionsByUnitId(@Param("unitId") UUID unitId);
    
    List<ContentVersionEntity> findByIdIn(List<Long> versionIds);
}
