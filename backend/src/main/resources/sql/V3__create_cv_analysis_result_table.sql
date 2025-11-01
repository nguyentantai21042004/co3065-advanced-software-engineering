-- SQL Migration: cv_analysis_result table
CREATE TABLE IF NOT EXISTS cv_analysis_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extraction_result_id UUID NOT NULL,
    file_id UUID NOT NULL,
    
    -- Basic Info (JSON)
    basic_info JSONB,
    
    -- Education (JSON)
    education JSONB,
    
    -- Work Experience (JSON)
    work_experience JSONB,
    
    -- Skills (JSON)
    skills JSONB,
    
    -- Certificates & Languages (JSON)
    certificates_languages JSONB,
    
    -- Combined analysis result (full JSON)
    analysis_result JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_extraction_result FOREIGN KEY(extraction_result_id) REFERENCES extraction_result(id),
    CONSTRAINT fk_uploaded_file FOREIGN KEY(file_id) REFERENCES uploaded_file(file_id)
);

CREATE INDEX IF NOT EXISTS idx_cv_analysis_extraction_result_id ON cv_analysis_result(extraction_result_id);
CREATE INDEX IF NOT EXISTS idx_cv_analysis_file_id ON cv_analysis_result(file_id);

