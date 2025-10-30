package co3065.ai_coach.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import co3065.ai_coach.repository.postgresql.entity.ContentUnitEntity;

import java.util.UUID;

/**
 * JPA Repository Interface cho ContentUnitEntity
 */
@Repository
public interface ContentUnitJpaRepository extends JpaRepository<ContentUnitEntity, UUID>, JpaSpecificationExecutor<ContentUnitEntity> {
}
