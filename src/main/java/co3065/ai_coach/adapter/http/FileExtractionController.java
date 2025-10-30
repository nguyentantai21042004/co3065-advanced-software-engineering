package co3065.ai_coach.adapter.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import co3065.ai_coach.adapter.http.dto.ApiResponse;
import co3065.ai_coach.adapter.http.dto.FileExtractionResponse;
import co3065.ai_coach.models.FileExtraction;
import co3065.ai_coach.usecase.FileExtractionUseCase;

/**
 * REST Controller - File Extraction HTTP Adapter
 * PoC 1: Module Trích Xuất Text (CV I/O)
 */
@RestController
@RequestMapping("/api/files")
public class FileExtractionController {

    private final FileExtractionUseCase fileExtractionUseCase;

    public FileExtractionController(FileExtractionUseCase fileExtractionUseCase) {
        this.fileExtractionUseCase = fileExtractionUseCase;
    }

    /**
     * POST /api/files/extract - Upload và extract text từ file
     * Supports: PDF, DOCX, DOC
     * 
     * Example:
     * curl -X POST http://localhost:8090/api/files/extract \
     *   -F "file=@/path/to/cv.pdf"
     */
    @PostMapping(value = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileExtractionResponse>> extractText(
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

            // Check if file type is supported
            if (!fileExtractionUseCase.isSupportedFileType(fileName)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, 
                            "Unsupported file type. Supported types: PDF, DOCX, DOC"));
            }

            // Extract text from file
            FileExtraction extraction = fileExtractionUseCase.extractText(
                file.getInputStream(), 
                fileName
            );

            // Check if extraction was successful
            if (!extraction.isSuccess()) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                        .body(ApiResponse.error(422, extraction.getErrorMessage()));
            }

            // Return success response with full text
            FileExtractionResponse response = FileExtractionResponse.fromDomain(extraction);
            return ResponseEntity.ok(
                ApiResponse.success("Text extracted successfully", response)
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, 
                        "Failed to process file: " + e.getMessage()));
        }
    }

    /**
     * POST /api/files/extract/preview - Upload và extract text (với preview)
     * Returns only first 500 characters for quick preview
     */
    @PostMapping(value = "/extract/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileExtractionResponse>> extractTextWithPreview(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "maxLength", defaultValue = "500") int maxLength) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "File is empty"));
            }

            String fileName = file.getOriginalFilename();
            
            // Extract text
            FileExtraction extraction = fileExtractionUseCase.extractText(
                file.getInputStream(), 
                fileName
            );

            // Check if extraction was successful
            if (!extraction.isSuccess()) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                        .body(ApiResponse.error(422, extraction.getErrorMessage()));
            }

            // Return success response with preview
            FileExtractionResponse response = FileExtractionResponse.fromDomainWithPreview(
                extraction, maxLength
            );
            return ResponseEntity.ok(
                ApiResponse.success("Text extracted successfully (preview)", response)
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, 
                        "Failed to process file: " + e.getMessage()));
        }
    }

    /**
     * GET /api/files/supported-types - Get list of supported file types
     */
    @GetMapping("/supported-types")
    public ResponseEntity<ApiResponse<String[]>> getSupportedTypes() {
        String[] supportedTypes = {"PDF", "DOCX", "DOC"};
        return ResponseEntity.ok(
            ApiResponse.success("Supported file types", supportedTypes)
        );
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

