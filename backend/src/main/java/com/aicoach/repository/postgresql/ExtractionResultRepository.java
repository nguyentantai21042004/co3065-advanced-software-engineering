package com.aicoach.repository.postgresql;

import com.aicoach.repository.postgresql.entity.ExtractionResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ExtractionResultRepository extends JpaRepository<ExtractionResultEntity, UUID> {
    /**
     * Find extraction result by file ID
     */
    ExtractionResultEntity findByFileId(UUID fileId);
}
