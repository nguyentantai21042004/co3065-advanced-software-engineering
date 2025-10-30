package co3065.ai_coach.adapter.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import co3065.ai_coach.adapter.http.dto.ApiResponse;
import co3065.ai_coach.adapter.http.dto.FileExtractionResponse;
import co3065.ai_coach.adapter.http.dto.UploadedFileResponse;
import co3065.ai_coach.models.FileExtraction;
import co3065.ai_coach.models.UploadedFile;
import co3065.ai_coach.usecase.CVExtractionUseCase;
import co3065.ai_coach.usecase.FileUploadUseCase;

/**
 * REST Controller - CV Processing (Upload & Extract)
 * 
 * API 1: POST /api/cv/upload - Upload CV file → Get file ID
 * API 2: POST /api/cv/extract/{fileId} - Extract text from uploaded CV
 */
@RestController
@RequestMapping("/api/cv")
public class CVProcessingController {

    private final FileUploadUseCase fileUploadUseCase;
    private final CVExtractionUseCase cvExtractionUseCase;

    public CVProcessingController(FileUploadUseCase fileUploadUseCase,
            CVExtractionUseCase cvExtractionUseCase) {
        this.fileUploadUseCase = fileUploadUseCase;
        this.cvExtractionUseCase = cvExtractionUseCase;
    }

    /**
     * API 1: Upload CV file
     * POST /api/cv/upload
     * 
     * Example:
     * curl -X POST http://localhost:8090/api/cv/upload \
     * -F "file=@cv.pdf"
     * 
     * Response:
     * {
     * "error_code": 0,
     * "message": "File uploaded successfully",
     * "data": {
     * "file_id": "550e8400-e29b-41d4-a716-446655440000",
     * "original_file_name": "cv.pdf",
     * "content_type": "application/pdf",
     * "file_size": 123456,
     * "uploaded_at": "2025-10-30T11:30:00"
     * }
     * }
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadedFileResponse>> uploadCV(
            @RequestParam("file") MultipartFile file) {

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "File is empty"));
            }

            String fileName = file.getOriginalFilename();
            if (fileName == null || fileName.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "File name is required"));
            }

            // Upload file
            UploadedFile uploadedFile = fileUploadUseCase.uploadFile(
                    file.getInputStream(),
                    fileName,
                    file.getContentType(),
                    file.getSize());

            // Return file ID
            UploadedFileResponse response = UploadedFileResponse.fromDomain(uploadedFile);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("File uploaded successfully", response));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500,
                            "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * API 2: Extract text from uploaded CV
     * POST /api/cv/extract/{fileId}
     * 
     * Example:
     * curl -X POST
     * http://localhost:8090/api/cv/extract/550e8400-e29b-41d4-a716-446655440000
     * 
     * Response:
     * {
     * "error_code": 0,
     * "message": "Text extracted successfully",
     * "data": {
     * "file_name": "550e8400-e29b-41d4-a716-446655440000.pdf",
     * "file_type": "PDF",
     * "extracted_text": "Full CV text content...",
     * "text_length": 1234,
     * "extracted_at": "2025-10-30T11:31:00",
     * "success": true
     * }
     * }
     */
    @PostMapping("/extract/{fileId}")
    public ResponseEntity<ApiResponse<FileExtractionResponse>> extractCV(
            @PathVariable String fileId) {

        try {
            // Validate file ID
            if (fileId == null || fileId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "File ID is required"));
            }

            // Extract text from CV
            FileExtraction extraction = cvExtractionUseCase.extractTextFromFileId(fileId);

            // Check if extraction was successful
            if (!extraction.isSuccess()) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                        .body(ApiResponse.error(422, extraction.getErrorMessage()));
            }

            // Return extracted text
            FileExtractionResponse response = FileExtractionResponse.fromDomain(extraction);
            return ResponseEntity.ok(
                    ApiResponse.success("Text extracted successfully", response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500,
                            "Failed to extract text: " + e.getMessage()));
        }
    }

    /**
     * GET /api/cv/supported-types - Get list of supported file types
     */
    @GetMapping("/supported-types")
    public ResponseEntity<ApiResponse<String[]>> getSupportedTypes() {
        String[] supportedTypes = { "PDF", "DOCX", "DOC" };
        return ResponseEntity.ok(
                ApiResponse.success("Supported file types", supportedTypes));
    }

    /**
     * Exception Handler
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "Internal server error: " + e.getMessage()));
    }
}
