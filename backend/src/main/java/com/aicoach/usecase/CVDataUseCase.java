package com.aicoach.usecase;

import com.aicoach.adapter.http.dto.CVDataResponse;

import java.util.UUID;

/**
 * Use case interface for getting complete CV extracted data
 */
public interface CVDataUseCase {

    /**
     * Get complete CV extracted data for a file
     *
     * @param fileId File ID to get data for
     * @param userId User ID to verify file ownership
     * @return CVDataResponse with all extracted data
     */
    CVDataResponse getCVData(UUID fileId, UUID userId);
}

