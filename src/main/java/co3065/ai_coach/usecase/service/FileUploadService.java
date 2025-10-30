package co3065.ai_coach.usecase.service;

import java.io.InputStream;

import org.springframework.stereotype.Service;

import co3065.ai_coach.models.UploadedFile;
import co3065.ai_coach.repository.FileStorage;
import co3065.ai_coach.usecase.FileUploadUseCase;

/**
 * File Upload Service Implementation
 */
@Service
public class FileUploadService implements FileUploadUseCase {

    private final FileStorage fileStorage;

    public FileUploadService(FileStorage fileStorage) {
        this.fileStorage = fileStorage;
    }

    @Override
    public UploadedFile uploadFile(InputStream inputStream, String fileName,
            String contentType, long fileSize) {
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

        // Validate file type
        if (!isSupportedFileType(contentType, fileName)) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Supported types: PDF, DOCX, DOC");
        }

        // Upload to storage
        try {
            UploadedFile uploadedFile = fileStorage.uploadFile(
                    inputStream, fileName, contentType, fileSize);

            // Additional domain validation
            if (!uploadedFile.isValidFileType()) {
                throw new IllegalArgumentException("Invalid file type after upload");
            }

            return uploadedFile;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    private boolean isSupportedFileType(String contentType, String fileName) {
        // Check by content type
        if (contentType != null) {
            if (contentType.equals("application/pdf") ||
                    contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                    contentType.equals("application/msword")) {
                return true;
            }
        }

        // Check by file extension
        if (fileName != null) {
            String lowerCase = fileName.toLowerCase();
            return lowerCase.endsWith(".pdf") ||
                    lowerCase.endsWith(".docx") ||
                    lowerCase.endsWith(".doc");
        }

        return false;
    }
}
