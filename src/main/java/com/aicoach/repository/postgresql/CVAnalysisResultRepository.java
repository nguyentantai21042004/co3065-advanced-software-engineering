package com.aicoach.repository.postgresql;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aicoach.repository.postgresql.entity.CVAnalysisResultEntity;

@Repository
public interface CVAnalysisResultRepository extends JpaRepository<CVAnalysisResultEntity, UUID> {

    /**
     * Find analysis result by extraction result ID
     */
    CVAnalysisResultEntity findByExtractionResultId(UUID extractionResultId);

    /**
     * Check if analysis result exists for extraction result ID
     */
    boolean existsByExtractionResultId(UUID extractionResultId);
}
