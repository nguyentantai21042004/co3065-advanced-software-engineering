package com.aicoach.repository.postgresql;

import com.aicoach.repository.postgresql.entity.UploadedFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFileEntity, UUID> {
}
