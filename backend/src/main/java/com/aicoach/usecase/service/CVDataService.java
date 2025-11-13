package com.aicoach.usecase.service;

import com.aicoach.adapter.http.dto.CVDataResponse;
import com.aicoach.repository.postgresql.CVAnalysisResultRepository;
import com.aicoach.repository.postgresql.ExtractionResultRepository;
import com.aicoach.repository.postgresql.UploadedFileRepository;
import com.aicoach.repository.postgresql.entity.CVAnalysisResultEntity;
import com.aicoach.repository.postgresql.entity.ExtractionResultEntity;
import com.aicoach.repository.postgresql.entity.UploadedFileEntity;
import com.aicoach.usecase.CVDataUseCase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service implementation for getting complete CV extracted data
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CVDataService implements CVDataUseCase {

    private final UploadedFileRepository uploadedFileRepository;
    private final ExtractionResultRepository extractionResultRepository;
    private final CVAnalysisResultRepository cvAnalysisResultRepository;

    @Override
    public CVDataResponse getCVData(UUID fileId, UUID userId) {
        log.info("Getting CV data for fileId: {}, userId: {}", fileId, userId);

        // Step 1: Check if file exists
        UploadedFileEntity uploadedFile = uploadedFileRepository.findById(fileId).orElse(null);
        if (uploadedFile == null) {
            log.warn("File not found: {}", fileId);
            throw new IllegalArgumentException("File not found: " + fileId);
        }

        // Step 2: Get extraction result
        ExtractionResultEntity extractionResult = extractionResultRepository.findByFileId(fileId);
        if (extractionResult == null) {
            log.warn("Extraction result not found for fileId: {}", fileId);
            throw new IllegalArgumentException("Extraction result not found for file: " + fileId);
        }

        // Step 3: Note - userId is not currently stored in extraction_result table
        // TODO: Add userId to extraction_result and cv_analysis_result tables for access control

        // Step 4: Get analysis result
        CVAnalysisResultEntity analysisResult = cvAnalysisResultRepository.findByFileId(fileId);
        if (analysisResult == null) {
            log.warn("Analysis result not found for fileId: {}", fileId);
            // Return data with extraction result only (analysis might still be processing)
            return CVDataResponse.builder()
                    .fileId(fileId)
                    .extractionResultId(extractionResult.getId())
                    .rawText(extractionResult.getRawText())
                    .avatarId(extractionResult.getAvatarId())
                    .extractionCompletedAt(extractionResult.getCreatedAt())
                    .build();
        }

        // Step 5: Build complete response
        CVDataResponse response = CVDataResponse.builder()
                .fileId(fileId)
                .extractionResultId(extractionResult.getId())
                .analysisResultId(analysisResult.getId())
                .rawText(extractionResult.getRawText())
                .avatarId(extractionResult.getAvatarId())
                .basicInfo(analysisResult.getBasicInfo())
                .education(analysisResult.getEducation())
                .workExperience(analysisResult.getWorkExperience())
                .skills(analysisResult.getSkills())
                .certificatesLanguages(analysisResult.getCertificatesLanguages())
                .analysisResult(analysisResult.getAnalysisResult())
                .extractionCompletedAt(extractionResult.getCreatedAt())
                .analysisCompletedAt(analysisResult.getCreatedAt())
                .build();

        log.info("CV data retrieved successfully for fileId: {}, hasAnalysis: true", fileId);
        return response;
    }
}

