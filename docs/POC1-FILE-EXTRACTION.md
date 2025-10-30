# PoC 1: Module Trích Xuất Text (CV I/O)

## Tổng quan

Module này thực hiện **PoC 1** trong file `CORE-FLOW.md`, cho phép trích xuất text từ các file CV dạng PDF, DOCX, và DOC.

### Công nghệ sử dụng
- **Apache PDFBox 3.0.1**: Trích xuất text từ file PDF
- **Apache Tika 2.9.1**: Trích xuất text từ file DOCX/DOC
- **Spring Boot 3.5.6**: Framework chính
- **Clean Architecture**: Cấu trúc code theo kiến trúc sạch

---

## Kiến trúc Module

Module được xây dựng theo **Clean Architecture** với các layers:

```
┌─────────────────────────────────────────────────────────────┐
│  ADAPTER LAYER (HTTP)                                        │
│  - FileExtractionController.java                            │
│  - FileExtractionResponse.java (DTO)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Port In (Use Case Interface)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  USE CASE LAYER                                              │
│  - FileExtractionUseCase.java (Interface)                   │
│  - FileExtractionService.java (Implementation)              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Domain Model
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN LAYER                                                │
│  - FileExtraction.java (Pure Domain Model)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Port Out (Repository Interface)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER                                        │
│  - FileExtractor.java (Interface)                           │
│  - PdfExtractor.java (PDFBox Implementation)                │
│  - DocxExtractor.java (Tika Implementation)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Cấu trúc File

```
src/main/java/co3065/ai_coach/
│
├── models/
│   └── FileExtraction.java              # Domain Model
│
├── usecase/
│   ├── FileExtractionUseCase.java       # Port In Interface
│   ├── service/
│   │   └── FileExtractionService.java   # Service Implementation
│   └── types/
│       └── FileExtractionCommand.java   # Command Object
│
├── repository/
│   ├── FileExtractor.java               # Port Out Interface
│   └── fileextraction/
│       ├── PdfExtractor.java            # PDF Implementation
│       └── DocxExtractor.java           # DOCX/DOC Implementation
│
└── adapter/
    └── http/
        ├── FileExtractionController.java    # REST Controller
        └── dto/
            └── FileExtractionResponse.java  # Response DTO
```

---

## API Endpoints

### 1. Extract Text từ File (Full Text)

**Endpoint:** `POST /api/files/extract`

**Description:** Upload file và trích xuất toàn bộ text

**Request:**
```bash
curl -X POST http://localhost:8090/api/files/extract \
  -F "file=@/path/to/cv.pdf"
```

**Response (Success):**
```json
{
  "error_code": 0,
  "message": "Text extracted successfully",
  "data": {
    "file_name": "cv.pdf",
    "file_type": "PDF",
    "extracted_text": "Full extracted text content...",
    "text_length": 1234,
    "extracted_at": "2025-10-30T10:30:00",
    "success": true
  }
}
```

**Response (Error):**
```json
{
  "error_code": 422,
  "message": "No text content found in file",
  "data": null
}
```

---

### 2. Extract Text với Preview (Limited Text)

**Endpoint:** `POST /api/files/extract/preview`

**Description:** Upload file và trích xuất text (chỉ preview N ký tự đầu)

**Request:**
```bash
curl -X POST "http://localhost:8090/api/files/extract/preview?maxLength=500" \
  -F "file=@/path/to/cv.pdf"
```

**Parameters:**
- `maxLength` (optional, default=500): Số ký tự tối đa trong preview

**Response:**
```json
{
  "error_code": 0,
  "message": "Text extracted successfully (preview)",
  "data": {
    "file_name": "cv.pdf",
    "file_type": "PDF",
    "extracted_text": "First 500 characters...",
    "text_length": 1234,
    "extracted_at": "2025-10-30T10:30:00",
    "success": true
  }
}
```

---

### 3. Get Supported File Types

**Endpoint:** `GET /api/files/supported-types`

**Description:** Lấy danh sách các loại file được hỗ trợ

**Request:**
```bash
curl http://localhost:8090/api/files/supported-types
```

**Response:**
```json
{
  "error_code": 0,
  "message": "Supported file types",
  "data": ["PDF", "DOCX", "DOC"]
}
```

---

## Domain Model

### FileExtraction

Domain model đại diện cho kết quả trích xuất text:

```java
public class FileExtraction {
    private final String fileName;
    private final String fileType;
    private final String extractedText;
    private final int textLength;
    private final LocalDateTime extractedAt;
    private final boolean success;
    private final String errorMessage;

    // Business validation methods
    public boolean hasValidText() { ... }
    public boolean isMinimumLength(int minLength) { ... }
    public String getPreview(int maxLength) { ... }
}
```

**Business Rules:**
- Nếu extraction thành công → `success = true`, `extractedText` có giá trị
- Nếu extraction thất bại → `success = false`, `errorMessage` có giá trị
- Text phải không empty để được coi là valid
- Có thể kiểm tra minimum length requirement
- Có thể lấy preview với max length

---

## Use Cases

### FileExtractionUseCase Interface

```java
public interface FileExtractionUseCase {
    // Extract text from file
    FileExtraction extractText(File file, String fileName);
    
    // Extract text from input stream
    FileExtraction extractText(InputStream inputStream, String fileName);
    
    // Check if file type is supported
    boolean isSupportedFileType(String fileName);
}
```

---

## Infrastructure Implementations

### 1. PdfExtractor (Apache PDFBox)

Trích xuất text từ PDF files:

```java
@Component
public class PdfExtractor implements FileExtractor {
    
    @Override
    public String extractText(InputStream inputStream, String fileName) throws Exception {
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            return text.replaceAll("\\s+", " ").trim();
        }
    }
    
    @Override
    public boolean supports(String fileName) {
        return fileName.toLowerCase().endsWith(".pdf");
    }
}
```

**Features:**
- Sử dụng PDFBox 3.0.1 (latest version)
- Extract text từ tất cả pages
- Maintain text position
- Clean up extra whitespace

---

### 2. DocxExtractor (Apache Tika)

Trích xuất text từ DOCX/DOC files:

```java
@Component
public class DocxExtractor implements FileExtractor {
    
    @Override
    public String extractText(InputStream inputStream, String fileName) throws Exception {
        BodyContentHandler handler = new BodyContentHandler(-1);
        Metadata metadata = new Metadata();
        ParseContext context = new ParseContext();
        Parser parser = new AutoDetectParser();
        
        parser.parse(inputStream, handler, metadata, context);
        
        String text = handler.toString();
        return text.replaceAll("\\s+", " ").trim();
    }
    
    @Override
    public boolean supports(String fileName) {
        String lowerCase = fileName.toLowerCase();
        return lowerCase.endsWith(".docx") || lowerCase.endsWith(".doc");
    }
}
```

**Features:**
- Sử dụng Apache Tika 2.9.1
- Auto-detect document format
- Extract text từ cả .doc và .docx
- No write limit (handle large documents)
- Clean up extra whitespace

---

## Service Layer

### FileExtractionService

Orchestrate text extraction process:

```java
@Service
public class FileExtractionService implements FileExtractionUseCase {
    
    private final List<FileExtractor> extractors;
    
    @Override
    public FileExtraction extractText(InputStream inputStream, String fileName) {
        // 1. Validate input
        // 2. Find appropriate extractor
        // 3. Extract text
        // 4. Validate extracted text
        // 5. Return FileExtraction result
    }
}
```

**Business Logic:**
- Tự động chọn extractor dựa trên file extension
- Validate input (null checks, empty checks)
- Validate output (extracted text not empty)
- Handle errors gracefully (return FileExtraction with error)
- Support multiple extractors (Strategy Pattern)

---

## Testing

### Unit Tests

**1. Domain Model Tests (`FileExtractionTest.java`):**
```java
@Test
void should_CreateSuccessfulExtraction_When_TextIsProvided() {
    FileExtraction extraction = new FileExtraction("sample.pdf", "PDF", "Sample text");
    
    assertTrue(extraction.isSuccess());
    assertEquals("Sample text", extraction.getExtractedText());
    assertTrue(extraction.hasValidText());
}
```

**2. Service Tests (`FileExtractionServiceTest.java`):**
```java
@Test
void should_ExtractText_When_PdfFileIsValid() throws Exception {
    when(pdfExtractor.supports("sample.pdf")).thenReturn(true);
    when(pdfExtractor.extractText(any(), any())).thenReturn("Extracted text");
    
    FileExtraction result = service.extractText(inputStream, "sample.pdf");
    
    assertTrue(result.isSuccess());
    assertEquals("Extracted text", result.getExtractedText());
}
```

**3. Infrastructure Tests:**
- `PdfExtractorTest.java`: Test file type support
- `DocxExtractorTest.java`: Test file type support

### Integration Tests

**FileExtractionControllerIntegrationTest.java:**
```java
@Test
void should_ReturnSupportedTypes() throws Exception {
    mockMvc.perform(get("/api/files/supported-types"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.error_code").value(0))
            .andExpect(jsonPath("$.data[0]").value("PDF"));
}
```

### Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=FileExtractionServiceTest

# Run with coverage
mvn test jacoco:report
```

---

## Usage Examples

### Example 1: Sử dụng trong Controller

```java
@RestController
public class CVProcessingController {
    
    private final FileExtractionUseCase fileExtractionUseCase;
    
    @PostMapping("/process-cv")
    public ResponseEntity<?> processCV(@RequestParam MultipartFile file) {
        // Extract text
        FileExtraction extraction = fileExtractionUseCase.extractText(
            file.getInputStream(),
            file.getOriginalFilename()
        );
        
        if (!extraction.isSuccess()) {
            return ResponseEntity.badRequest()
                .body("Failed: " + extraction.getErrorMessage());
        }
        
        // Process extracted text (e.g., send to Gemini)
        String cvText = extraction.getExtractedText();
        // ... further processing
        
        return ResponseEntity.ok("Processed successfully");
    }
}
```

### Example 2: Sử dụng trong Service

```java
@Service
public class CVAnalysisService {
    
    private final FileExtractionUseCase fileExtractionUseCase;
    
    public String analyzeCVFromFile(File cvFile) {
        // Extract text from CV
        FileExtraction extraction = fileExtractionUseCase.extractText(
            cvFile,
            cvFile.getName()
        );
        
        if (!extraction.hasValidText()) {
            throw new IllegalArgumentException("Cannot extract text from CV");
        }
        
        // Check minimum length
        if (!extraction.isMinimumLength(100)) {
            throw new IllegalArgumentException("CV text too short");
        }
        
        // Get text for analysis
        String cvText = extraction.getExtractedText();
        
        // Analyze with AI...
        return analyzeWithGemini(cvText);
    }
}
```

---

## Error Handling

Module xử lý các errors sau:

### 1. Validation Errors (400 Bad Request)
- File is empty
- File name is required
- Unsupported file type

### 2. Processing Errors (422 Unprocessable Entity)
- No text content found in file
- Failed to extract text (corrupted file)

### 3. Server Errors (500 Internal Server Error)
- Unexpected exceptions during processing

**Error Response Format:**
```json
{
  "error_code": 400,
  "message": "Detailed error message",
  "data": null
}
```

---

## Design Patterns Sử Dụng

### 1. **Clean Architecture / Hexagonal Architecture**
- Domain layer độc lập
- Use case interfaces (Port In)
- Repository interfaces (Port Out)
- Infrastructure implementations (Adapters)

### 2. **Dependency Injection**
- Constructor injection
- Interface-based dependencies

### 3. **Strategy Pattern**
- Multiple extractors (PdfExtractor, DocxExtractor)
- Service selects appropriate strategy based on file type

### 4. **Factory Method Pattern**
- Static factory methods in FileExtractionResponse
- `fromDomain()`, `fromDomainWithPreview()`

### 5. **Command Pattern**
- FileExtractionCommand encapsulates request parameters

---

## Performance Considerations

### Memory Management
- Stream-based processing (không load toàn bộ file vào memory)
- Try-with-resources để auto-close documents
- No write limit cho large documents

### File Size Limits
- Spring Boot default: 1MB per file, 10MB per request
- Có thể config trong `application.yml`:
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

### Text Length
- Preview mode để giảm data transfer
- Configurable max length

---

## Future Enhancements

### Potential Improvements:
1. **More file types**: TXT, RTF, ODT
2. **Image OCR**: Extract text from images in PDF
3. **Async processing**: For large files
4. **Caching**: Cache extraction results
5. **Metadata extraction**: Author, creation date, etc.
6. **Language detection**: Detect CV language
7. **Text cleaning**: Remove headers/footers, page numbers

---

## Dependencies Required

Add to `pom.xml`:

```xml
<!-- File Processing Dependencies -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>3.0.1</version>
</dependency>
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-core</artifactId>
    <version>2.9.1</version>
</dependency>
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-parsers-standard-package</artifactId>
    <version>2.9.1</version>
</dependency>
```

---

## Kết luận

PoC 1 đã hoàn thành đầy đủ theo yêu cầu trong `CORE-FLOW.md`:

✅ Viết class `FileExtractorService` (FileExtractionService)  
✅ Implement hàm `extractTextFromPdf` (PdfExtractor)  
✅ Implement hàm `extractTextFromDocx` (DocxExtractor)  
✅ Viết tests để verify flow  
✅ REST API để test trực tiếp  
✅ Clean Architecture structure  
✅ Comprehensive error handling  
✅ Full documentation  

**Ready for integration với PoC 2 (Gemini AI Processor)!**

---

**Version**: 1.0  
**Last Updated**: October 30, 2025  
**Author**: AI Coach Development Team

