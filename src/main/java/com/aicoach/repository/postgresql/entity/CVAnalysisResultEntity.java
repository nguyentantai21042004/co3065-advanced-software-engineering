package com.aicoach.repository.postgresql.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entity for CV Analysis Results
 * Stores structured data extracted from CV using LLM prompts
 */
@Entity
@Table(name = "cv_analysis_result")
public class CVAnalysisResultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(name = "extraction_result_id", nullable = false, columnDefinition = "UUID")
    private UUID extractionResultId;

    @Column(name = "file_id", nullable = false, columnDefinition = "UUID")
    private UUID fileId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "basic_info", columnDefinition = "JSONB")
    private String basicInfo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "education", columnDefinition = "JSONB")
    private String education;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "work_experience", columnDefinition = "JSONB")
    private String workExperience;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "skills", columnDefinition = "JSONB")
    private String skills;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "certificates_languages", columnDefinition = "JSONB")
    private String certificatesLanguages;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "analysis_result", columnDefinition = "JSONB")
    private String analysisResult;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public CVAnalysisResultEntity() {
    }

    public CVAnalysisResultEntity(UUID extractionResultId, UUID fileId,
            String basicInfo, String education, String workExperience,
            String skills, String certificatesLanguages, String analysisResult) {
        this.extractionResultId = extractionResultId;
        this.fileId = fileId;
        this.basicInfo = basicInfo;
        this.education = education;
        this.workExperience = workExperience;
        this.skills = skills;
        this.certificatesLanguages = certificatesLanguages;
        this.analysisResult = analysisResult;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getExtractionResultId() {
        return extractionResultId;
    }

    public void setExtractionResultId(UUID extractionResultId) {
        this.extractionResultId = extractionResultId;
    }

    public UUID getFileId() {
        return fileId;
    }

    public void setFileId(UUID fileId) {
        this.fileId = fileId;
    }

    public String getBasicInfo() {
        return basicInfo;
    }

    public void setBasicInfo(String basicInfo) {
        this.basicInfo = basicInfo;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getWorkExperience() {
        return workExperience;
    }

    public void setWorkExperience(String workExperience) {
        this.workExperience = workExperience;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getCertificatesLanguages() {
        return certificatesLanguages;
    }

    public void setCertificatesLanguages(String certificatesLanguages) {
        this.certificatesLanguages = certificatesLanguages;
    }

    public String getAnalysisResult() {
        return analysisResult;
    }

    public void setAnalysisResult(String analysisResult) {
        this.analysisResult = analysisResult;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
