package com.aicoach.usecase.service;

import java.io.InputStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aicoach.models.UploadedFile;
import com.aicoach.usecase.FileUploadUseCase;
import com.aicoach.constants.FileConstants;
import com.aicoach.infrastructure.FileStorage;
import com.aicoach.repository.postgresql.UploadedFileRepository;
import com.aicoach.mappers.UploadedFileMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class FileUploadService implements FileUploadUseCase {
    private final FileStorage fileStorage;
    private final UploadedFileRepository uploadedFileRepository;

    public FileUploadService(FileStorage fileStorage, UploadedFileRepository uploadedFileRepository) {
        this.fileStorage = fileStorage;
        this.uploadedFileRepository = uploadedFileRepository;
    }

    @Override
    public UploadedFile uploadFile(InputStream inputStream, String fileName, String contentType, long fileSize) {
        log.info("uploadFile called with fileName='{}', contentType='{}', fileSize={}", fileName, contentType, fileSize);

        // Validate input
        if (inputStream == null) {
            log.error("Input stream is null");
            throw new IllegalArgumentException("File is empty or input stream cannot be null");
        }
        if (fileName == null || fileName.trim().isEmpty()) {
            log.error("File name is null or empty");
            throw new IllegalArgumentException("File name is required");
        }
        if (fileSize <= 0) {
            log.error("File size is less than or equal to 0");
            throw new IllegalArgumentException("File size must be greater than 0");
        }
        // Validate file type by extension and MIME
        String ext = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".") + 1) : "";
        log.debug("Detected file extension: '{}'", ext);
        if (!FileConstants.isAllowedExtension(ext) && !FileConstants.isAllowedMimeType(contentType)) {
            log.error("Unsupported file type: fileName='{}', extension='{}', contentType='{}'", fileName, ext, contentType);
            throw new IllegalArgumentException("Unsupported file type. Supported types: PDF, DOCX, DOC");
        }
        // Upload to storage (MinIO)
        try {
            log.info("Uploading file to storage: fileName='{}'", fileName);
            UploadedFile uploadedFile = fileStorage.uploadFile(inputStream, fileName, contentType, fileSize);
            log.info("File uploaded with id='{}', name='{}', ext='{}', mime='{}'", uploadedFile.getFileId(), uploadedFile.getOriginalFileName(), uploadedFile.getFileExtension(), uploadedFile.getContentType());
            if (!FileConstants.isAllowedExtension(uploadedFile.getFileExtension()) && !FileConstants.isAllowedMimeType(uploadedFile.getContentType())) {
                log.error("Invalid file type after upload: id='{}', ext='{}', mime='{}'", uploadedFile.getFileId(), uploadedFile.getFileExtension(), uploadedFile.getContentType());
                throw new IllegalArgumentException("Invalid file type after upload");
            }
            // Save to DB
            log.info("Saving uploaded file metadata to database for file id='{}'", uploadedFile.getFileId());
            uploadedFileRepository.save(UploadedFileMapper.toEntity(uploadedFile));
            log.info("Upload completed successfully for file id='{}'", uploadedFile.getFileId());
            return uploadedFile;
        } catch (IllegalArgumentException e) {
            log.error("IllegalArgumentException during uploadFile: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Exception during uploadFile: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }
}
