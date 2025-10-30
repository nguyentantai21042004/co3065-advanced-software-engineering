package com.aicoach.usecase.service;

import java.io.InputStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aicoach.models.UploadedFile;
import com.aicoach.repository.FileStorage;
import com.aicoach.usecase.FileUploadUseCase;
import com.aicoach.constants.FileConstants;
import com.aicoach.repository.postgresql.UploadedFileRepository;
import com.aicoach.mappers.UploadedFileMapper;

@Service
@Transactional
public class FileUploadService implements FileUploadUseCase {
    private final FileStorage fileStorage;
    private final UploadedFileRepository uploadedFileRepository;

    public FileUploadService(FileStorage fileStorage, UploadedFileRepository uploadedFileRepository) {
        this.fileStorage = fileStorage;
        this.uploadedFileRepository = uploadedFileRepository;
    }

    @Override
    public UploadedFile uploadFile(InputStream inputStream, String fileName, String contentType, long fileSize) {
        // Validate input
        if (inputStream == null) {
            throw new IllegalArgumentException("Input stream cannot be null");
        }
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }
        if (fileSize <= 0) {
            throw new IllegalArgumentException("File size must be greater than 0");
        }
        // Validate file type by extension and MIME
        String ext = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".") + 1) : "";
        if (!FileConstants.isAllowedExtension(ext) && !FileConstants.isAllowedMimeType(contentType)) {
            throw new IllegalArgumentException("Unsupported file type. Supported types: PDF, DOCX, DOC");
        }
        // Upload to storage (MinIO)
        try {
            UploadedFile uploadedFile = fileStorage.uploadFile(inputStream, fileName, contentType, fileSize);
            if (!FileConstants.isAllowedExtension(uploadedFile.getFileExtension()) && !FileConstants.isAllowedMimeType(uploadedFile.getContentType())) {
                throw new IllegalArgumentException("Invalid file type after upload");
            }
            // Lưu DB
            uploadedFileRepository.save(UploadedFileMapper.toEntity(uploadedFile));
            return uploadedFile;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }
}
