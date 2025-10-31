# Image Extraction Implementation Guide

## Overview

This document describes the implementation of image extraction from CV documents (PDF and DOCX files). The first image found in a CV is automatically extracted and uploaded as the user's avatar.

## What Was Implemented

### 1. Image Extraction Infrastructure

Created a new **ImageExtractor** port interface and adapter implementations:

```
src/main/java/com/aicoach/repository/
├── ImageExtractor.java                    # Port interface
└── fileextraction/
    ├── PdfImageExtractor.java            # PDF image extraction (PDFBox)
    └── DocxImageExtractor.java           # DOCX image extraction (Apache POI)
```

### 2. Updated Use Cases

Enhanced **FileExtractionUseCase** interface with image extraction capabilities:

**Location**: `src/main/java/com/aicoach/usecase/FileExtractionUseCase.java`

**New Methods**:
```java
// Extract first image from document
byte[] extractFirstImage(InputStream inputStream, String fileName);

// Check if file supports image extraction
boolean supportsImageExtraction(String fileName);
```

### 3. Updated Service Implementation

Enhanced **FileExtractionService** to support image extraction:

**Location**: `src/main/java/com/aicoach/usecase/service/FileExtractionService.java`

**Changes**:
- Injected `List<ImageExtractor>` for image extraction adapters
- Implemented `extractFirstImage()` method
- Added `findImageExtractor()` helper method

### 4. Updated CV Extraction Flow

Modified **CVExtractionConsumer** to extract avatar images from CV documents:

**Location**: `src/main/java/com/aicoach/messaging/CVExtractionConsumer.java`

**Flow Changes**:
```
Old Flow:
1. Download file from MinIO
2. Extract text
3. Save to database

New Flow:
1. Download file from MinIO
2. Extract text from document
3. Extract first image from document (NEW!)
4. Upload extracted image as avatar to MinIO (NEW!)
5. Save text + avatarId to database
```

### 5. Added Dependencies

Added Apache POI libraries to `pom.xml` for DOCX image extraction:

```xml
<!-- Apache POI for DOCX Image Extraction -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.5</version>
</dependency>
```

---

## Architecture

### Hexagonal Architecture Pattern

```
┌─────────────────────────────────────────┐
│   CVExtractionConsumer                  │
│   (Adapter - Message Consumer)          │
└───────────┬─────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────┐
│   FileExtractionUseCase                 │
│   (Port - Interface)                    │
│   - extractText()                       │
│   - extractFirstImage() ← NEW           │
└───────────┬─────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────┐
│   FileExtractionService                 │
│   (Service - Orchestrator)              │
└───┬──────────────────────────┬──────────┘
    │                          │
    ↓                          ↓
┌──────────────┐      ┌────────────────┐
│ImageExtractor│      │ FileExtractor  │
│   (Port)     │      │    (Port)      │
└──────┬───────┘      └────────┬───────┘
       │                       │
       ↓                       ↓
┌─────────────────┐   ┌───────────────┐
│PdfImageExtractor│   │ PdfExtractor  │
│DocxImageExtractor   │ DocxExtractor │
│  (Adapters)     │   │  (Adapters)   │
└─────────────────┘   └───────────────┘
```

---

## How It Works

### PDF Image Extraction

**Class**: `PdfImageExtractor`

**Algorithm**:
1. Load PDF document using PDFBox
2. Iterate through each page
3. Extract XObjects (embedded objects) from page resources
4. Filter for PDImageXObject instances
5. Skip small images (< 50x50 pixels) to avoid icons/logos
6. Convert first suitable image to PNG byte array
7. Return image data

**Example**:
```java
// Extract first image from PDF
byte[] imageData = pdfImageExtractor.extractFirstImage(inputStream, "cv.pdf");
// Returns: PNG image as byte array (or null if no images found)
```

### DOCX Image Extraction

**Class**: `DocxImageExtractor`

**Algorithm**:
1. Open DOCX using Apache POI XWPFDocument
2. Get all embedded pictures from document
3. Return first picture's raw data (preserves original format)
4. Return image data

**Example**:
```java
// Extract first image from DOCX
byte[] imageData = docxImageExtractor.extractFirstImage(inputStream, "cv.docx");
// Returns: Image in original format (JPG, PNG, etc.)
```

### CV Extraction Flow (Detailed)

**CVExtractionConsumer.processExtractionTask()**

```java
1. Download file from MinIO
   ↓
2. Read file bytes into ByteArrayOutputStream
   ↓
3. Extract text from document
   - Create ByteArrayInputStream from file bytes
   - Call fileExtractionUseCase.extractText()
   - Store extracted text in rawText variable
   ↓
4. Extract first image (avatar)
   - Create new ByteArrayInputStream from file bytes
   - Call fileExtractionUseCase.extractFirstImage()
   - If image found:
     ↓
     a. Create ByteArrayInputStream for upload
     b. Generate avatar filename: "avatar-{fileId}.png"
     c. Upload to MinIO using fileStorage.uploadFile()
     d. Store avatarId
   ↓
5. Save extraction result to database
   - Create ExtractionResultEntity with:
     * fileId
     * rawText (extracted text)
     * avatarId (uploaded avatar file ID or null)
   ↓
6. Publish completion notification
```

---

## Database Schema

The `extraction_result` table already supports avatar storage:

```sql
CREATE TABLE extraction_result (
    id UUID PRIMARY KEY,
    file_id UUID NOT NULL,
    raw_text TEXT,
    avatar_id UUID,              -- Stores avatar file ID
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_uploaded_file
        FOREIGN KEY(file_id)
        REFERENCES uploaded_file(file_id)
);
```

**Fields**:
- `file_id`: Reference to original uploaded CV file
- `raw_text`: Extracted text content from CV
- `avatar_id`: Reference to uploaded avatar image file (or NULL if no image found)

---

## Usage Examples

### Example 1: Upload CV with Image and Extract

```bash
# 1. Upload CV file with embedded image
curl -X POST http://localhost:8090/api/cv/upload \
  -F "file=@john_doe_cv.pdf"

Response:
{
  "error_code": 0,
  "message": "File uploaded successfully",
  "data": {
    "file_id": "550e8400-e29b-41d4-a716-446655440000",
    "original_file_name": "john_doe_cv.pdf",
    ...
  }
}

# 2. Trigger extraction
curl -X POST http://localhost:8090/api/cv/extract/550e8400-e29b-41d4-a716-446655440000

Response:
{
  "error_code": 0,
  "message": "Task accepted",
  "data": null
}

# 3. Consumer processes the task (check logs):
[STEP 3-DOC] Processing DOCUMENT type: pdf
[STEP 3-DOC] ✅ Extraction success: true
[STEP 4-IMG] Attempting to extract avatar image from document
[STEP 4-IMG] ✅ Found image in document, size: 45678 bytes
[STEP 4-IMG] ✅ Uploaded avatar as fileId: abc123...

# 4. Check database:
SELECT id, file_id, avatar_id FROM extraction_result
WHERE file_id = '550e8400-e29b-41d4-a716-446655440000';

Result:
id                  | file_id               | avatar_id
--------------------|-----------------------|------------
xyz789...           | 550e8400-e29b...      | abc123...
```

### Example 2: CV Without Image

```bash
# If CV has no images:
[STEP 3-DOC] Processing DOCUMENT type: pdf
[STEP 3-DOC] ✅ Extraction success: true
[STEP 4-IMG] Attempting to extract avatar image from document
[STEP 4-IMG] No image found in document

# Database result:
id                  | file_id               | avatar_id
--------------------|-----------------------|------------
xyz789...           | 550e8400-e29b...      | NULL
```

### Example 3: Direct Image Upload (Existing Feature)

```bash
# If user uploads a pure image file (PNG/JPG):
[STEP 3-IMG] Processing IMAGE type: png
[STEP 3-IMG] ✅ Uploaded entire file as avatar

# Database result:
id                  | file_id               | avatar_id
--------------------|-----------------------|------------
xyz789...           | 550e8400-e29b...      | abc123...
```

---

## API Integration

### Retrieve Avatar Image

After extraction, the avatar can be downloaded from MinIO:

```java
// In your application code:
ExtractionResultEntity result = extractionResultRepository.findById(resultId);

if (result.getAvatarId() != null) {
    // Download avatar from MinIO
    InputStream avatarStream = fileStorage.downloadFile(result.getAvatarId().toString());

    // Serve to user or process further
    return ResponseEntity.ok()
        .contentType(MediaType.IMAGE_PNG)
        .body(avatarStream.readAllBytes());
}
```

### Example REST Endpoint (Optional - Not Implemented Yet)

You can create an endpoint to retrieve avatars:

```java
@GetMapping("/extraction/{resultId}/avatar")
public ResponseEntity<byte[]> getAvatar(@PathVariable UUID resultId) {
    ExtractionResultEntity result = repository.findById(resultId)
        .orElseThrow(() -> new NotFoundException("Result not found"));

    if (result.getAvatarId() == null) {
        return ResponseEntity.notFound().build();
    }

    InputStream stream = fileStorage.downloadFile(result.getAvatarId().toString());
    byte[] imageBytes = stream.readAllBytes();

    return ResponseEntity.ok()
        .contentType(MediaType.IMAGE_PNG)
        .body(imageBytes);
}
```

---

## Testing

### Manual Testing Steps

1. **Start services**:
   ```bash
   make dev-up
   make dev-shell

   # Terminal 1: API Service
   make run-api

   # Terminal 2: Consumer Service
   make run-consumer
   ```

2. **Prepare test CV files**:
   - Create a PDF with embedded image (use MS Word → Export to PDF)
   - Create a DOCX with embedded image
   - Create a PDF without images

3. **Test PDF with image**:
   ```bash
   # Upload CV
   curl -X POST http://localhost:8090/api/cv/upload \
     -F "file=@cv_with_image.pdf"

   # Note the file_id from response
   FILE_ID="<file_id_from_response>"

   # Trigger extraction
   curl -X POST http://localhost:8090/api/cv/extract/$FILE_ID

   # Check consumer logs for:
   # [STEP 4-IMG] ✅ Found image in document
   # [STEP 4-IMG] ✅ Uploaded avatar as fileId: ...
   ```

4. **Test DOCX with image**:
   ```bash
   curl -X POST http://localhost:8090/api/cv/upload \
     -F "file=@cv_with_image.docx"

   # Repeat extraction steps
   ```

5. **Test PDF without image**:
   ```bash
   curl -X POST http://localhost:8090/api/cv/upload \
     -F "file=@cv_no_image.pdf"

   # Trigger extraction
   # Check logs for:
   # [STEP 4-IMG] No image found in document
   ```

6. **Verify in database**:
   ```sql
   -- Connect to PostgreSQL
   psql -h localhost -U admin -d co3065_db

   -- Check results
   SELECT
       er.id,
       er.file_id,
       er.avatar_id,
       uf.original_file_name,
       LENGTH(er.raw_text) as text_length
   FROM extraction_result er
   JOIN uploaded_file uf ON er.file_id = uf.file_id
   ORDER BY er.created_at DESC;
   ```

7. **Verify in MinIO**:
   - Open MinIO Console: http://localhost:9001
   - Login: admin / admin123
   - Browse bucket: `cv-files`
   - Look for files starting with `avatar-`

### Unit Testing

Create test file: `src/test/java/com/aicoach/repository/fileextraction/PdfImageExtractorTest.java`

```java
@ExtendWith(MockitoExtension.class)
class PdfImageExtractorTest {

    @InjectMocks
    private PdfImageExtractor extractor;

    @Test
    void testExtractFirstImage_PdfWithImage() throws Exception {
        // Given
        InputStream pdfStream = getClass()
            .getResourceAsStream("/test-cv-with-image.pdf");

        // When
        byte[] imageData = extractor.extractFirstImage(pdfStream, "test.pdf");

        // Then
        assertNotNull(imageData);
        assertTrue(imageData.length > 0);
    }

    @Test
    void testExtractFirstImage_PdfWithoutImage() throws Exception {
        // Given
        InputStream pdfStream = getClass()
            .getResourceAsStream("/test-cv-no-image.pdf");

        // When
        byte[] imageData = extractor.extractFirstImage(pdfStream, "test.pdf");

        // Then
        assertNull(imageData);
    }

    @Test
    void testSupports_ValidPdf() {
        assertTrue(extractor.supports("document.pdf"));
        assertTrue(extractor.supports("DOCUMENT.PDF"));
    }

    @Test
    void testSupports_InvalidType() {
        assertFalse(extractor.supports("document.docx"));
        assertFalse(extractor.supports("image.png"));
    }
}
```

---

## Error Handling

### Graceful Degradation

Image extraction failures **do not** stop CV text extraction:

```java
try {
    byte[] imageData = fileExtractionUseCase.extractFirstImage(...);
    // Upload avatar if found
} catch (Exception e) {
    log.warn("Failed to extract/upload avatar image: {}", e.getMessage());
    // Continue processing - text extraction still succeeds
}
```

### Common Error Scenarios

| Scenario | Behavior | Impact |
|----------|----------|--------|
| No images in CV | `avatarId = NULL` | Text extraction succeeds, no avatar |
| Image extraction fails | `avatarId = NULL` | Text extraction succeeds, no avatar |
| MinIO upload fails | `avatarId = NULL` | Text extraction succeeds, no avatar |
| Corrupted image | `avatarId = NULL` | Text extraction succeeds, no avatar |

**Result**: The system is resilient - CV text extraction always completes even if avatar extraction fails.

---

## Performance Considerations

### Memory Usage

- Files are read into `ByteArrayOutputStream` to allow multiple reads
- For large files (>50MB), consider streaming approach
- Current implementation suitable for typical CV sizes (1-10MB)

### Image Filtering

**PDF**: Filters out small images (<50x50 pixels) to avoid extracting:
- Icons
- Logos
- Decorative elements
- QR codes

**DOCX**: Returns first picture found (no size filtering currently)

### Optimization Tips

1. **Limit image size**:
   ```java
   // In PdfImageExtractor, adjust threshold:
   if (imageObject.getWidth() < 100 || imageObject.getHeight() < 100) {
       continue; // Skip smaller images
   }
   ```

2. **Image compression**:
   ```java
   // Compress large images before upload
   if (imageData.length > 1_000_000) { // 1MB
       imageData = compressImage(imageData, 0.8f);
   }
   ```

3. **Async processing**: Already implemented via RabbitMQ consumer

---

## Troubleshooting

### Issue 1: No Images Extracted from PDF

**Symptoms**: Logs show "No image found in document" for PDF with images

**Possible Causes**:
1. Images are vector graphics (not raster images)
2. Images are too small (<50x50px)
3. Images are embedded as forms/annotations (not XObjects)

**Solution**:
- Lower size threshold in `PdfImageExtractor`
- Check PDF structure using PDF tools
- Try different PDF export settings

### Issue 2: DOCX Image Extraction Fails

**Symptoms**: Exception during DOCX processing

**Possible Causes**:
1. Missing Apache POI dependency
2. Corrupted DOCX file
3. Unsupported DOCX version (DOC format)

**Solution**:
```bash
# Rebuild with dependencies
mvn clean install -U

# Check logs for specific exception
# Verify file is valid DOCX (not DOC)
```

### Issue 3: Avatar Upload Fails

**Symptoms**: Image extracted but avatarId is NULL

**Possible Causes**:
1. MinIO connection issue
2. Bucket doesn't exist
3. Insufficient permissions

**Solution**:
```bash
# Check MinIO connectivity
curl http://localhost:9000/minio/health/live

# Verify bucket exists
mc ls minio/cv-files

# Check consumer logs for specific error
```

---

## Future Enhancements

### 1. Multiple Image Support

Extract all images from CV:
```java
List<byte[]> extractAllImages(InputStream inputStream, String fileName);
```

Store multiple avatars:
```sql
CREATE TABLE cv_images (
    id UUID PRIMARY KEY,
    extraction_result_id UUID NOT NULL,
    image_file_id UUID NOT NULL,
    image_order INT,
    is_primary BOOLEAN DEFAULT FALSE
);
```

### 2. Image Recognition

Detect if image is a face/person:
```java
// Using ML/AI service
boolean isFaceImage(byte[] imageData);
```

### 3. Image Quality Enhancement

Improve image quality:
```java
byte[] enhanceImage(byte[] imageData) {
    // Resize, crop, adjust brightness
    // Return optimized image
}
```

### 4. Smart Avatar Selection

Choose best avatar from multiple images:
```java
// Score images based on:
// - Size (larger = better)
// - Position (top of document = better)
// - Face detection confidence
// - Image quality metrics
byte[] selectBestAvatar(List<byte[]> images);
```

### 5. Thumbnail Generation

Create thumbnails for avatars:
```java
byte[] createThumbnail(byte[] imageData, int width, int height);
```

---

## Summary

### What Changed

✅ **New Files Created**:
- `ImageExtractor.java` - Port interface
- `PdfImageExtractor.java` - PDF image extraction adapter
- `DocxImageExtractor.java` - DOCX image extraction adapter

✅ **Modified Files**:
- `FileExtractionUseCase.java` - Added image extraction methods
- `FileExtractionService.java` - Implemented image extraction
- `CVExtractionConsumer.java` - Added avatar extraction flow
- `pom.xml` - Added Apache POI dependencies

### Key Features

✅ Automatically extracts first image from PDF/DOCX CVs
✅ Uploads extracted image as avatar to MinIO
✅ Stores avatar reference in database
✅ Graceful degradation (text extraction succeeds even if image fails)
✅ Supports both document images and pure image files
✅ Filters out small images (icons/logos)

### Testing Checklist

- [ ] PDF with image → Avatar extracted ✓
- [ ] DOCX with image → Avatar extracted ✓
- [ ] PDF without image → No avatar, text extracted ✓
- [ ] Pure image file (PNG/JPG) → Entire file as avatar ✓
- [ ] Database contains correct avatarId
- [ ] MinIO contains uploaded avatar files

---

**Implementation Date**: 2025-10-31
**Version**: 1.0.0
**Status**: ✅ Complete and Ready for Testing
