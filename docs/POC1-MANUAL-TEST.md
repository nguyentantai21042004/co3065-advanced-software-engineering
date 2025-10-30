# PoC 1: Manual Testing Guide

## Quick Start Guide

### Prerequisites
- Java 17 installed
- Maven installed
- PostgreSQL running (for full app, but not required for file extraction module)

### Step 1: Build Project

```bash
cd /Users/tantai/Workspaces/hcmut/co3065-advanced-software-engineering

# Clean and compile
mvn clean compile

# Run tests
mvn test
```

### Step 2: Run Application

```bash
# Start Spring Boot application
mvn spring-boot:run

# Application will start on http://localhost:8090
```

### Step 3: Test File Extraction API

#### Test 1: Check Supported Types

```bash
curl http://localhost:8090/api/files/supported-types
```

**Expected Response:**
```json
{
  "error_code": 0,
  "message": "Supported file types",
  "data": ["PDF", "DOCX", "DOC"]
}
```

---

#### Test 2: Extract Text from PDF (Create a sample PDF first)

**Create a sample PDF:**

On Mac:
```bash
# Create a simple text file
echo "John Doe
Software Engineer
Email: john@example.com
Phone: +84 123 456 789

EXPERIENCE:
- Software Engineer at ABC Company (2020-2023)
- Backend Developer at XYZ Corp (2018-2020)

SKILLS:
Java, Spring Boot, PostgreSQL, Docker

EDUCATION:
Bachelor of Computer Science, HCMUT, 2018" > sample-cv.txt

# Convert to PDF using Mac Preview or online tool
# Or use this command if you have pandoc:
pandoc sample-cv.txt -o sample-cv.pdf
```

**Test extraction:**
```bash
curl -X POST http://localhost:8090/api/files/extract \
  -F "file=@sample-cv.pdf" \
  | jq '.'
```

**Expected Response:**
```json
{
  "error_code": 0,
  "message": "Text extracted successfully",
  "data": {
    "file_name": "sample-cv.pdf",
    "file_type": "PDF",
    "extracted_text": "John Doe Software Engineer Email: john@example.com...",
    "text_length": 250,
    "extracted_at": "2025-10-30T10:30:00",
    "success": true,
    "error_message": null
  }
}
```

---

#### Test 3: Extract Text with Preview (Limited)

```bash
curl -X POST "http://localhost:8090/api/files/extract/preview?maxLength=100" \
  -F "file=@sample-cv.pdf" \
  | jq '.'
```

**Expected Response:**
```json
{
  "error_code": 0,
  "message": "Text extracted successfully (preview)",
  "data": {
    "file_name": "sample-cv.pdf",
    "file_type": "PDF",
    "extracted_text": "John Doe Software Engineer Email: john@example.com Phone: +84 123 456 789 EXPERIENCE: - Softwar...",
    "text_length": 250,
    "extracted_at": "2025-10-30T10:30:00",
    "success": true
  }
}
```

---

#### Test 4: Test with DOCX File

**Create a sample DOCX:**
- Open Microsoft Word or Google Docs
- Create a simple CV with the content above
- Save as `sample-cv.docx`

**Test extraction:**
```bash
curl -X POST http://localhost:8090/api/files/extract \
  -F "file=@sample-cv.docx" \
  | jq '.'
```

---

#### Test 5: Test Error Cases

**Test empty file:**
```bash
touch empty.pdf
curl -X POST http://localhost:8090/api/files/extract \
  -F "file=@empty.pdf" \
  | jq '.'
```

**Expected Response:**
```json
{
  "error_code": 400,
  "message": "File is empty"
}
```

**Test unsupported file type:**
```bash
echo "Some text" > test.txt
curl -X POST http://localhost:8090/api/files/extract \
  -F "file=@test.txt" \
  | jq '.'
```

**Expected Response:**
```json
{
  "error_code": 400,
  "message": "Unsupported file type. Supported types: PDF, DOCX, DOC"
}
```

---

### Step 4: Run Unit Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=FileExtractionServiceTest
mvn test -Dtest=FileExtractionTest
mvn test -Dtest=PdfExtractorTest
mvn test -Dtest=DocxExtractorTest

# Run integration tests
mvn test -Dtest=FileExtractionControllerIntegrationTest

# Run with verbose output
mvn test -X
```

**Expected Output:**
```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.aicoach.usecase.service.FileExtractionServiceTest
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.aicoach.models.FileExtractionTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.aicoach.repository.fileextraction.PdfExtractorTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.aicoach.repository.fileextraction.DocxExtractorTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

---

### Step 5: Test with Postman (Optional)

**Import this JSON into Postman:**

```json
{
  "info": {
    "name": "PoC 1 - File Extraction API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Supported Types",
      "request": {
        "method": "GET",
        "url": "http://localhost:8090/api/files/supported-types"
      }
    },
    {
      "name": "Extract Text from File",
      "request": {
        "method": "POST",
        "url": "http://localhost:8090/api/files/extract",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/sample-cv.pdf"
            }
          ]
        }
      }
    },
    {
      "name": "Extract Text with Preview",
      "request": {
        "method": "POST",
        "url": "http://localhost:8090/api/files/extract/preview?maxLength=200",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/sample-cv.pdf"
            }
          ]
        }
      }
    }
  ]
}
```

---

### Step 6: Verify Implementation

Check that all components exist:

```bash
# Domain layer
ls src/main/java/co3065/ai_coach/models/FileExtraction.java

# Use case layer
ls src/main/java/co3065/ai_coach/usecase/FileExtractionUseCase.java
ls src/main/java/co3065/ai_coach/usecase/service/FileExtractionService.java

# Infrastructure layer
ls src/main/java/co3065/ai_coach/repository/FileExtractor.java
ls src/main/java/co3065/ai_coach/repository/fileextraction/PdfExtractor.java
ls src/main/java/co3065/ai_coach/repository/fileextraction/DocxExtractor.java

# Adapter layer
ls src/main/java/co3065/ai_coach/adapter/http/FileExtractionController.java

# Tests
ls src/test/java/co3065/ai_coach/usecase/service/FileExtractionServiceTest.java
ls src/test/java/co3065/ai_coach/models/FileExtractionTest.java
```

---

## Troubleshooting

### Issue 1: Port 8090 already in use

**Solution:**
```bash
# Change port in application.yml
server:
  port: 8091

# Or kill the process using port 8090
lsof -ti:8090 | xargs kill -9
```

### Issue 2: Cannot extract text from PDF

**Possible causes:**
- PDF is password-protected
- PDF is image-based (no selectable text) - needs OCR
- PDF is corrupted

**Solution:**
- Try a different PDF
- Check PDF opens normally in PDF viewer
- Try DOCX instead

### Issue 3: Compilation errors

**Solution:**
```bash
# Clean and recompile
mvn clean compile

# Update dependencies
mvn clean install -U

# Check Java version
java -version  # Should be 17
```

### Issue 4: Tests failing

**Solution:**
```bash
# Run tests with more info
mvn test -X

# Skip tests temporarily to verify build
mvn clean install -DskipTests

# Check specific failing test
mvn test -Dtest=FileExtractionServiceTest -X
```

---

## Success Criteria

✅ Application starts without errors  
✅ All tests pass (24+ tests)  
✅ Can upload PDF and extract text  
✅ Can upload DOCX and extract text  
✅ Error handling works correctly  
✅ API returns proper JSON format  
✅ Preview mode works with configurable length  

---

## Next Steps

After PoC 1 is verified:

1. **PoC 2**: Integrate Gemini AI for CV analysis
2. **PoC 3**: Implement Message Queue (RabbitMQ/Kafka)
3. **Database**: Store extraction results
4. **Complete Flow**: CV Upload → Extract → Analyze → Generate Plan

---

**Last Updated**: October 30, 2025

