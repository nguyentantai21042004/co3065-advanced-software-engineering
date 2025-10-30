-- SQL Migration: uploaded_file table (PostgreSQL)
CREATE TABLE IF NOT EXISTS uploaded_file (
    file_id UUID PRIMARY KEY,
    original_file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(255) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
