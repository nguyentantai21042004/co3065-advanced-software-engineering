package com.aicoach.adapter.http.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonRawValue;

/**
 * Response DTO for CV extracted data
 * Contains all structured data extracted from CV including raw text, avatar, and analysis results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVDataResponse {

    /**
     * File ID
     */
    private UUID fileId;

    /**
     * Extraction result ID
     */
    private UUID extractionResultId;

    /**
     * Analysis result ID
     */
    private UUID analysisResultId;

    /**
     * Raw text extracted from CV file
     */
    private String rawText;

    /**
     * Avatar image file ID (if extracted)
     */
    private UUID avatarId;

    /**
     * Basic info JSON (name, email, phone, gender, address, date_of_birth)
     * Stored as JSON string, will be parsed by client
     */
    @JsonRawValue
    private String basicInfo;

    /**
     * Education JSON (school, degree, major, graduation_date)
     * Stored as JSON string, will be parsed by client
     */
    @JsonRawValue
    private String education;

    /**
     * Work experience JSON array
     * Stored as JSON string, will be parsed by client
     */
    @JsonRawValue
    private String workExperience;

    /**
     * Skills JSON (skills with levels/points)
     * Stored as JSON string, will be parsed by client
     */
    @JsonRawValue
    private String skills;

    /**
     * Certificates and languages JSON
     * Stored as JSON string, will be parsed by client
     */
    @JsonRawValue
    private String certificatesLanguages;

    /**
     * Combined analysis result (full JSON with all fields)
     * Stored as JSON string, will be parsed by client
     */
    @JsonRawValue
    private String analysisResult;

    /**
     * Timestamp when extraction was completed
     */
    private LocalDateTime extractionCompletedAt;

    /**
     * Timestamp when analysis was completed
     */
    private LocalDateTime analysisCompletedAt;
}

