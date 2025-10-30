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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST Controller - CV Processing (Upload & Extract)
 * 
 * API 1: POST /api/cv/upload - Upload CV file → Get file ID
 * API 2: POST /api/cv/extract/{fileId} - Extract text from uploaded CV
 */
@RestController
@RequestMapping("/api/cv")
@Tag(name = "CV Processing", description = "APIs for uploading CV files and extracting text content")
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
         */
        @Operation(summary = "Upload CV file", description = """
                        Upload a CV file (PDF, DOCX, or DOC) to storage and get a unique file ID.

                        **Supported file types:**
                        - PDF (.pdf)
                        - Microsoft Word (.docx, .doc)

                        **Maximum file size:** 10MB

                        The file will be stored in MinIO storage and you'll receive a unique file ID
                        that can be used later to extract text from the file.
                        """, tags = { "CV Processing" })
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "File uploaded successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 0,
                                          "message": "File uploaded successfully",
                                          "data": {
                                            "file_id": "550e8400-e29b-41d4-a716-446655440000",
                                            "original_file_name": "john_doe_cv.pdf",
                                            "content_type": "application/pdf",
                                            "file_size": 245678,
                                            "uploaded_at": "2025-10-30T14:20:30"
                                          }
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad request - Invalid file or file type not supported", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                                        {
                                          "error_code": 400,
                                          "message": "Unsupported file type. Supported types: PDF, DOCX, DOC"
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                                        {
                                          "error_code": 500,
                                          "message": "Failed to upload file: Connection timeout"
                                        }
                                        """)))
        })
        @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<UploadedFileResponse>> uploadCV(
                        @Parameter(description = "CV file to upload (PDF, DOCX, or DOC)", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)) @RequestParam("file") MultipartFile file) {

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
         */
        @Operation(summary = "Extract text from CV", description = """
                        Extract text content from a previously uploaded CV file using its file ID.

                        **Process:**
                        1. Download file from MinIO storage using the file ID
                        2. Extract text using Apache PDFBox (for PDF) or Apache Tika (for DOCX/DOC)
                        3. Return extracted text with metadata

                        **Note:** The file must be uploaded first using the /upload endpoint.
                        """, tags = { "CV Processing" })
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Text extracted successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 0,
                                          "message": "Text extracted successfully",
                                          "data": {
                                            "file_name": "550e8400-e29b-41d4-a716-446655440000.pdf",
                                            "file_type": "PDF",
                                            "extracted_text": "CURRICULUM VITAE\\n\\nJohn Doe\\nSoftware Engineer\\nEmail: john@example.com\\n\\nEXPERIENCE:\\n- Software Engineer at ABC Company (2020-2023)\\n- Backend Developer at XYZ Corp (2018-2020)\\n\\nSKILLS:\\nJava, Spring Boot, PostgreSQL, Docker",
                                            "text_length": 234,
                                            "extracted_at": "2025-10-30T14:21:00",
                                            "success": true
                                          }
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad request - File ID is required", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                                        {
                                          "error_code": 400,
                                          "message": "File ID is required"
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Unprocessable entity - File not found or cannot extract text", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                                        {
                                          "error_code": 422,
                                          "message": "File not found: 550e8400-e29b-41d4-a716-446655440000"
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                                        {
                                          "error_code": 500,
                                          "message": "Failed to extract text: Internal error"
                                        }
                                        """)))
        })
        @PostMapping("/extract/{fileId}")
        public ResponseEntity<ApiResponse<FileExtractionResponse>> extractCV(
                        @Parameter(description = "File ID received from upload endpoint", required = true, example = "550e8400-e29b-41d4-a716-446655440000") @PathVariable String fileId) {

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
         * Get list of supported file types
         */
        @Operation(summary = "Get supported file types", description = "Returns a list of file types that are supported for CV upload and text extraction.", tags = {
                        "CV Processing" })
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of supported file types", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                                        {
                                          "error_code": 0,
                                          "message": "Supported file types",
                                          "data": ["PDF", "DOCX", "DOC"]
                                        }
                                        """)))
        })
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
