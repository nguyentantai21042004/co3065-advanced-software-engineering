package com.aicoach.adapter.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.aicoach.adapter.http.dto.ApiResponse;
import com.aicoach.adapter.http.dto.FileExtractionResponse;
import com.aicoach.adapter.http.dto.UploadedFileResponse;
import com.aicoach.models.FileExtraction;
import com.aicoach.models.UploadedFile;
import com.aicoach.usecase.CVExtractionUseCase;
import com.aicoach.usecase.FileUploadUseCase;
import com.aicoach.repository.postgresql.UploadedFileRepository;
import com.aicoach.messaging.CVExtractionProducer;
import com.aicoach.models.CVExtractionMessage;
import org.springframework.beans.factory.annotation.Autowired;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.UUID;

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
  private final UploadedFileRepository uploadedFileRepository;
  private final CVExtractionProducer cvExtractionProducer;

  @Autowired
  public CVProcessingController(FileUploadUseCase fileUploadUseCase, CVExtractionUseCase cvExtractionUseCase,
      UploadedFileRepository uploadedFileRepository, CVExtractionProducer cvExtractionProducer) {
    this.fileUploadUseCase = fileUploadUseCase;
    this.cvExtractionUseCase = cvExtractionUseCase;
    this.uploadedFileRepository = uploadedFileRepository;
    this.cvExtractionProducer = cvExtractionProducer;
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

  @Operation(summary = "Extract from file id", description = "Publish extraction job for a file by fileId (in URI)", tags = {
      "CV Processing" })
  @ApiResponses(value = {
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Task accepted"),
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "File ID not found")
  })
  @PostMapping("/extract/{fileId}")
  public ResponseEntity<ApiResponse<String>> extractByUri(@PathVariable String fileId) {
    if (fileId == null || fileId.trim().isEmpty()) {
      return ResponseEntity.badRequest().body(ApiResponse.error(400, "File ID is required"));
    }
    boolean exists = false;
    UUID fileUUID;
    try {
      fileUUID = UUID.fromString(fileId);
      exists = uploadedFileRepository.existsById(fileUUID);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, "Invalid file_id format"));
    }
    if (!exists) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(404, "File ID not found in db"));
    }

    // Fetch file info from DB to get fileName
    var uploadedFileEntity = uploadedFileRepository.findById(fileUUID).orElse(null);
    String fileName = uploadedFileEntity != null ? uploadedFileEntity.getOriginalFileName() : null;
    String contentType = uploadedFileEntity != null ? uploadedFileEntity.getContentType() : null;
    Long fileSize = uploadedFileEntity != null ? uploadedFileEntity.getFileSize() : null;

    CVExtractionMessage msg = CVExtractionMessage.builder()
        .taskId(UUID.randomUUID().toString())
        .fileId(fileId)
        .fileName(fileName)
        .fileType(contentType)
        .fileSize(fileSize)
        .build();
    cvExtractionProducer.sendExtractionTask(msg);
    return ResponseEntity.ok(ApiResponse.success("Task accepted", null));
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
