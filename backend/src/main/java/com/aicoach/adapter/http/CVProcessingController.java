package com.aicoach.adapter.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.aicoach.adapter.http.dto.ApiResponse;
import com.aicoach.adapter.http.dto.CVDataResponse;
import com.aicoach.adapter.http.dto.UploadedFileResponse;
import com.aicoach.constants.FileConstants;
import com.aicoach.models.UploadedFile;
import com.aicoach.usecase.FileUploadUseCase;
import com.aicoach.usecase.CVExtractionUseCase;
import com.aicoach.usecase.CVDataUseCase;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/cv")
@Tag(name = "CV Processing", description = "APIs for uploading CV files and extracting text content")
@Slf4j
public class CVProcessingController {

        private final CVExtractionUseCase cvExtractionUseCase;
        private final FileUploadUseCase fileUploadUseCase;
        private final CVDataUseCase cvDataUseCase;

        @Autowired
        public CVProcessingController(
                        CVExtractionUseCase cvExtractionUseCase,
                        FileUploadUseCase fileUploadUseCase,
                        CVDataUseCase cvDataUseCase) {
                this.cvExtractionUseCase = cvExtractionUseCase;
                this.fileUploadUseCase = fileUploadUseCase;
                this.cvDataUseCase = cvDataUseCase;
        }

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
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad request - Invalid file or file type not supported", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 400,
                                          "message": "Unsupported file type. Supported types: PDF, DOCX, DOC"
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error - Failed to upload file", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 500,
                                          "message": "Failed to upload file: Connection timeout"
                                        }
                                        """)))
        })
        @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<UploadedFileResponse>> uploadCV(
                        @Parameter(description = "CV file to upload. Supported formats: PDF (.pdf), DOCX (.docx), or DOC (.doc). Maximum file size: 10MB.", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE), example = "john_doe_cv.pdf") @RequestParam("file") MultipartFile file)
                        throws Exception {

                try {
                        log.info("Received file upload: name={}, type={}, size={}",
                                        file.getOriginalFilename(), file.getContentType(), file.getSize());
                        UploadedFile uploadedFile = fileUploadUseCase.uploadFile(
                                        file.isEmpty() ? null : file.getInputStream(),
                                        file.getOriginalFilename(),
                                        file.getContentType(),
                                        file.getSize());

                        UploadedFileResponse response = UploadedFileResponse.fromDomain(uploadedFile);
                        log.info("File uploaded successfully: fileId={}", response.getFileId());
                        return ResponseEntity
                                        .status(HttpStatus.CREATED)
                                        .body(
                                                        ApiResponse.success(
                                                                        "File uploaded successfully",
                                                                        response));

                } catch (IllegalArgumentException e) {
                        log.warn("Bad request on upload: {}", e.getMessage(), e);
                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        ApiResponse.error(
                                                                        400,
                                                                        e.getMessage()));
                } catch (Exception e) {
                        log.error("Failed to upload file: {}", e.getMessage(), e);
                        return ResponseEntity
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        ApiResponse.error(
                                                                        500,
                                                                        "Failed to upload file: " + e.getMessage()));
                }
        }

        @Operation(summary = "Extract text from uploaded CV file", description = """
                        Publishes an extraction job for a previously uploaded CV file identified by file_id.

                        **Process:**
                        1. Validates that the file_id exists in the database
                        2. Publishes an extraction task to RabbitMQ queue
                        3. Returns immediately with task acceptance status

                        **Asynchronous Processing:**
                        - The actual extraction is processed asynchronously by the consumer service
                        - Extraction results will be saved to the database
                        - A notification will be sent when extraction is complete

                        **Use Cases:**
                        - Upload a CV file first using POST /api/cv/upload to get a file_id
                        - Then call this endpoint with the file_id to start extraction
                        """, tags = { "CV Processing" })
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Extraction task accepted and queued successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 0,
                                          "message": "Task accepted",
                                          "data": null
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad request - Invalid file_id format or missing", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 400,
                                          "message": "Invalid file_id format"
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "File ID not found - The specified file_id does not exist in the database", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 404,
                                          "message": "File ID not found in db"
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error - Failed to publish extraction task", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 500,
                                          "message": "Failed to publish extraction task: Connection timeout"
                                        }
                                        """)))
        })
        @PostMapping("/extract/{file_id}")
        public ResponseEntity<ApiResponse<String>> extractByUri(
                        @Parameter(description = "The UUID of the uploaded file to extract text from. Must be a valid UUID format.", required = true, example = "550e8400-e29b-41d4-a716-446655440000") @PathVariable("file_id") String fileId) {
                try {
                        boolean success = cvExtractionUseCase.publishExtractionTask(fileId);
                        if (!success) {
                                log.error("Failed to publish extraction task: {}", fileId);
                                return ResponseEntity
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                                .body(ApiResponse.error(500,
                                                                "Failed to publish extraction task: " + fileId));
                        }
                        return ResponseEntity.ok(ApiResponse.success("Task accepted", null));
                } catch (Exception e) {
                        log.error("Failed to publish extraction task: {}", fileId, e);
                        return ResponseEntity
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error(500, "Failed to publish extraction task: " + fileId));
                }
        }

        @Operation(summary = "Get supported file types", description = """
                        Returns a list of file types that are supported for CV upload and text extraction.

                        **Supported Formats:**
                        - PDF (.pdf) - Portable Document Format
                        - DOCX (.docx) - Microsoft Word 2007+ format
                        - DOC (.doc) - Microsoft Word legacy format

                        **Note:** Only these file types will be accepted when uploading CV files.
                        """, tags = { "CV Processing" })
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved list of supported file types", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 0,
                                          "message": "Supported file types",
                                          "data": ["PDF", "DOCX", "DOC"]
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 500,
                                          "message": "Internal server error: <details>"
                                        }
                                        """)))
        })
        @GetMapping("/supported-types")
        public ResponseEntity<ApiResponse<String[]>> getSupportedTypes() {
                String[] supportedTypes = FileConstants.ALLOWED_EXTENSIONS.stream().toArray(String[]::new);
                return ResponseEntity.ok(
                                ApiResponse.success("Supported file types", supportedTypes));
        }

        @Operation(summary = "Get complete CV extracted data", description = """
                        Get all extracted data from a CV file including:
                        - Raw extracted text
                        - Avatar image ID
                        - Basic info (name, email, phone, gender, address, date_of_birth)
                        - Education (school, degree, major, graduation_date)
                        - Work experience (array of work experiences)
                        - Skills (skills with levels/points)
                        - Certificates and languages
                        - Complete analysis result (combined JSON)

                        **Authentication Required:**
                        - This endpoint requires JWT token authentication
                        - Include `Authorization: Bearer <token>` header in the request
                        - Only the user who uploaded the file can access the data

                        **Response Format:**
                        - All JSON fields are returned as JSON strings that can be parsed by the client
                        - If analysis is still processing, only extraction data will be returned
                        """, tags = { "CV Processing" })
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "CV data retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 0,
                                          "message": "CV data retrieved successfully",
                                          "data": {
                                            "file_id": "550e8400-e29b-41d4-a716-446655440000",
                                            "extraction_result_id": "660e8400-e29b-41d4-a716-446655440001",
                                            "analysis_result_id": "770e8400-e29b-41d4-a716-446655440002",
                                            "raw_text": "John Doe\nSoftware Engineer\n...",
                                            "avatar_id": "880e8400-e29b-41d4-a716-446655440003",
                                            "basic_info": "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"phone\":\"+1234567890\"}",
                                            "education": "{\"school\":\"MIT\",\"degree\":\"Bachelor\",\"major\":\"Computer Science\"}",
                                            "work_experience": "[{\"company\":\"Tech Corp\",\"position\":\"Software Engineer\",\"duration\":\"2020-2024\"}]",
                                            "skills": "{\"java\":90,\"python\":85,\"javascript\":80}",
                                            "certificates_languages": "{\"certificates\":[\"AWS Certified\"],\"languages\":[\"English\",\"Spanish\"]}",
                                            "analysis_result": "{\"basic_info\":{...},\"education\":{...},...}",
                                            "extraction_completed_at": "2025-10-30T14:20:35",
                                            "analysis_completed_at": "2025-10-30T14:25:40"
                                          }
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "File or extraction result not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 404,
                                          "message": "File not found"
                                        }
                                        """))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User does not have access to this file", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "error_code": 403,
                                          "message": "You do not have access to this file"
                                        }
                                        """)))
        })
        @GetMapping("/data/{file_id}")
        public ResponseEntity<ApiResponse<CVDataResponse>> getCVData(
                        @Parameter(description = "The UUID of the file to get CV data for", required = true, example = "550e8400-e29b-41d4-a716-446655440000") @PathVariable("file_id") String fileId) {
                try {
                        log.info("Get CV data request: fileId={}", fileId);

                        UUID fileUUID;
                        try {
                                fileUUID = UUID.fromString(fileId);
                        } catch (IllegalArgumentException e) {
                                log.warn("Invalid file ID format: {}", fileId);
                                return ResponseEntity.badRequest()
                                                .body(ApiResponse.error(400, "Invalid file ID format"));
                        }

                        // Get userId from SecurityContext if available (for access control)
                        UUID userId = null;
                        try {
                                String email = org.springframework.security.core.context.SecurityContextHolder
                                                .getContext()
                                                .getAuthentication()
                                                .getName();
                                if (email != null && !email.equals("anonymousUser")) {
                                        // Query UserRepository to get userId from email if needed
                                        // For now, we'll pass null and let service handle ownership check
                                        // TODO: Add UserRepository injection and query userId if needed
                                }
                        } catch (Exception e) {
                                log.debug("Could not extract userId from SecurityContext: {}", e.getMessage());
                        }

                        CVDataResponse data = cvDataUseCase.getCVData(fileUUID, userId);

                        return ResponseEntity.ok(
                                        ApiResponse.success("CV data retrieved successfully", data));

                } catch (IllegalArgumentException e) {
                        log.warn("Bad request on get CV data: {}", e.getMessage());
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(ApiResponse.error(404, e.getMessage()));
                } catch (SecurityException e) {
                        log.warn("Access denied for fileId: {}", fileId);
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.error(403, e.getMessage()));
                } catch (Exception e) {
                        log.error("Failed to get CV data: fileId={}", fileId, e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error(500, "Failed to get CV data: " + e.getMessage()));
                }
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
                log.error("Unhandled exception: {}", e.getMessage(), e);
                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(
                                                ApiResponse.error(
                                                                500,
                                                                "Internal server error: " + e.getMessage()));
        }
}
