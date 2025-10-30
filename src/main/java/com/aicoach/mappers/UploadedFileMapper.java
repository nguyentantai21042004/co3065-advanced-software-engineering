package com.aicoach.mappers;

import com.aicoach.models.UploadedFile;
import com.aicoach.repository.postgresql.entity.UploadedFileEntity;

import java.util.UUID;

public class UploadedFileMapper {
    public static UploadedFileEntity toEntity(UploadedFile domain) {
        return new UploadedFileEntity(
                UUID.fromString(domain.getFileId()),
                domain.getOriginalFileName(),
                domain.getStoragePath(),
                domain.getContentType(),
                domain.getFileSize(),
                domain.getUploadedAt()
        );
    }

    public static UploadedFile toDomain(UploadedFileEntity entity) {
        return new UploadedFile(
                entity.getFileId().toString(),
                entity.getOriginalFileName(),
                entity.getStoragePath(),
                entity.getContentType(),
                entity.getFileSize()
                // domain constructor sets uploadedAt to now()
        );
    }
}
