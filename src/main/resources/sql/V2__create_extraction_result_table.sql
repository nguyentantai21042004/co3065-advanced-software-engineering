-- SQL Migration: extraction_result table
CREATE TABLE IF NOT EXISTS extraction_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    raw_text TEXT,
    avatar_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_uploaded_file FOREIGN KEY(file_id) REFERENCES uploaded_file(file_id)
);
