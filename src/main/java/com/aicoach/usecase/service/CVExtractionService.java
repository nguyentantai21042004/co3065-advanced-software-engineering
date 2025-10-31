package com.aicoach.usecase.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.aicoach.infrastructure.FileStorage;
import com.aicoach.messaging.CVExtractionProducer;
import com.aicoach.models.CVExtractionMessage;
import com.aicoach.models.FileExtraction;
import com.aicoach.models.UploadedFile;
import com.aicoach.repository.postgresql.UploadedFileRepository;
import com.aicoach.usecase.CVExtractionUseCase;
import com.aicoach.usecase.FileExtractionUseCase;
import com.aicoach.usecase.types.CVExtractionResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * CV Extraction Service Implementation
 * Handles the business logic of extracting text and images from CV files
 * Returns extraction results without persisting to database
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CVExtractionService implements CVExtractionUseCase {

    private final FileStorage fileStorage;
    private final FileExtractionUseCase fileExtractionUseCase;
    private final UploadedFileRepository uploadedFileRepository;
    private final CVExtractionProducer cvExtractionProducer;

    @Override
    public CVExtractionResult extractCV(String fileId, String fileName) throws Exception {
        // Validate input
        if (fileId == null || fileId.trim().isEmpty()) {
            throw new IllegalArgumentException("File ID is required");
        }
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new IllegalArgumentException("File name is required");
        }

        // Download file
        log.info("Downloading file from storage, fileId={}", fileId);
        InputStream fileStream = fileStorage.downloadFile(fileId);
        if (fileStream == null) {
            throw new RuntimeException("Failed to download file from storage");
        }
        log.info("File stream obtained");

        // Detect file type
        String fileType = detectFileType(fileName);
        log.info("Detected fileType: '{}'", fileType);

        // Extract based on file type
        CVExtractionResult result;
        if (isDocumentType(fileType)) {
            result = extractTextFromDocument(fileStream, fileName, fileId);
        } else if (isImageType(fileType)) {
            result = extractTextFromImage(fileStream, fileName, fileId, fileType);
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + fileType);
        }

        log.info("Completed CV extraction for fileId: {}", fileId);
        return result;
    }

    /**
     * Extract text and avatar from document file (PDF, DOCX, DOC)
     */
    private CVExtractionResult extractTextFromDocument(InputStream fileStream, String fileName, String fileId) throws Exception {
        log.info("Processing document type: fileName={}", fileName);
        
        // Read file bytes
        byte[] fileBytes = readStreamToBytes(fileStream);
        log.info("Read {} bytes from file", fileBytes.length);

        // Extract text
        String extractedText = extractTextFromBytes(fileBytes, fileName);
        logTextPreview(extractedText);

        // Extract and upload avatar image
        UUID avatarId = extractAndUploadAvatar(fileBytes, fileName, fileId);

        return new CVExtractionResult(extractedText, avatarId);
    }

    /**
     * Extract text and upload image as avatar for image files (PNG, JPG, JPEG)
     */
    private CVExtractionResult extractTextFromImage(InputStream fileStream, String fileName, String fileId, String fileType) throws Exception {
        log.info("Processing image type: fileName={}", fileName);

        // Read file bytes
        byte[] fileBytes = readStreamToBytes(fileStream);
        log.info("Read {} bytes from file", fileBytes.length);

        // Extract text (if supported)
        String extractedText = extractTextFromBytes(fileBytes, fileName);

        // Upload original image as avatar
        UUID avatarId = uploadImageAsAvatar(fileBytes, fileId, fileType);

        return new CVExtractionResult(extractedText, avatarId);
    }

    /**
     * Extract raw text from file bytes
     */
    private String extractTextFromBytes(byte[] fileBytes, String fileName) throws Exception {
        ByteArrayInputStream textStream = new ByteArrayInputStream(fileBytes);
        FileExtraction extraction = fileExtractionUseCase.extractText(textStream, fileName);
        
        if (!extraction.isSuccess()) {
            throw new RuntimeException("Text extraction failed: " + extraction.getErrorMessage());
        }
        
        return extraction.getExtractedText();
    }

    /**
     * Upload image file as avatar
     */
    private UUID uploadImageAsAvatar(byte[] fileBytes, String fileId, String fileType) throws Exception {
        ByteArrayInputStream avatarStream = new ByteArrayInputStream(fileBytes);
        String avatarFileName = "avatar-" + fileId + "." + fileType;
        String contentType = "image/" + (fileType.equals("jpg") ? "jpeg" : fileType);
        UploadedFile avatarFile = fileStorage.uploadFile(
                avatarStream, avatarFileName, contentType, fileBytes.length);
        UUID avatarId = UUID.fromString(avatarFile.getFileId());
        log.info("Uploaded avatar as fileId: {}", avatarId);
        return avatarId;
    }

    /**
     * Detect file type from file name
     */
    private String detectFileType(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Check if file type is a document (PDF, DOCX, DOC)
     */
    private boolean isDocumentType(String fileType) {
        return fileType.equals("pdf") || fileType.equals("doc") || fileType.equals("docx");
    }

    /**
     * Check if file type is an image (PNG, JPG, JPEG)
     */
    private boolean isImageType(String fileType) {
        return fileType.equals("png") || fileType.equals("jpg") || fileType.equals("jpeg");
    }

    /**
     * Extract first image from document and upload as avatar
     *
     * @return UUID of uploaded avatar, or null if no image found
     */
    private UUID extractAndUploadAvatar(byte[] fileBytes, String fileName, String fileId) {
        log.info("[STEP 4-IMG] Attempting to extract avatar image from document");
        try {
            ByteArrayInputStream imageStream = new ByteArrayInputStream(fileBytes);
            byte[] imageData = fileExtractionUseCase.extractFirstImage(imageStream, fileName);

            if (imageData != null && imageData.length > 0) {
                log.info("[STEP 4-IMG] ✅ Found image in document, size: {} bytes", imageData.length);

                // Upload extracted image as avatar
                ByteArrayInputStream avatarUploadStream = new ByteArrayInputStream(imageData);
                String avatarFileName = "avatar-" + fileId + ".png";
                String contentType = "image/png";
                UploadedFile avatarFile = fileStorage.uploadFile(
                        avatarUploadStream, avatarFileName, contentType, imageData.length);
                UUID avatarId = UUID.fromString(avatarFile.getFileId());
                log.info("[STEP 4-IMG] ✅ Uploaded avatar as fileId: {}", avatarId);
                return avatarId;
            } else {
                log.info("[STEP 4-IMG] No image found in document");
                return null;
            }
        } catch (Exception e) {
            log.warn("[STEP 4-IMG] Failed to extract/upload avatar image: {}", e.getMessage());
            // Continue processing even if image extraction fails
            return null;
        }
    }

    /**
     * Read InputStream to byte array
     */
    private byte[] readStreamToBytes(InputStream inputStream) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[8192];
        int nRead;
        while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        buffer.flush();
        return buffer.toByteArray();
    }

    /**
     * Log text preview for debugging
     */
    private void logTextPreview(String rawText) {
        if (rawText != null && rawText.length() > 0) {
            log.info("[STEP 3-DOC] Raw text preview (first 200 chars): {}",
                    rawText.length() > 200 ? rawText.substring(0, 200) + "..." : rawText);
        } else {
            log.warn("[STEP 3-DOC] ⚠️ Raw text is NULL or EMPTY!");
        }
    }

    @Override
    public boolean publishExtractionTask(String fileId) {
        if (fileId == null || fileId.trim().isEmpty()) {
            log.error("File ID is required");
            return false;
        }

        final UUID fileUUID;
        try {
            fileUUID = UUID.fromString(fileId);
        } catch (Exception ex) {
            log.error("Invalid file ID format: {}", fileId);
            return false;
        }

        var uploadedFileEntity = uploadedFileRepository.findById(fileUUID)
                .orElse(null);
        if (uploadedFileEntity == null) {
            log.error("File not found in database: {}", fileId);
            return false;
        }

        var message = CVExtractionMessage.builder()
                .taskId(UUID.randomUUID().toString())
                .fileId(fileId)
                .fileName(uploadedFileEntity.getOriginalFileName())
                .fileType(uploadedFileEntity.getContentType())
                .fileSize(uploadedFileEntity.getFileSize())
                .build();

        try {
            cvExtractionProducer.sendExtractionTask(message);
        } catch (Exception e) {
            log.error("Failed to send extraction task: {}", fileId, e.getMessage(), e);
            throw new RuntimeException("Failed to send extraction task", e);
        }
        return true;
    }
}
