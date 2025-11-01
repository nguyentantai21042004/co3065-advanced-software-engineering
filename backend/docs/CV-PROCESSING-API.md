# CV Processing API - Upload & Extract

## Tổng quan

API xử lý CV với 2 bước riêng biệt:
1. **Upload CV** → Nhận file ID
2. **Extract text** → Gửi file ID để trích xuất text

Files được lưu trữ trong **MinIO** (S3-compatible storage) chạy trong Docker.

---

## Architecture

```
Client
  ↓ (1) Upload CV
CVProcessingController
  ↓
FileUploadService
  ↓
MinioFileStorage → MinIO Storage
  ↓
Return file_id
  
Client
  ↓ (2) Extract with file_id  
CVProcessingController
  ↓
CVExtractionService
  ↓ Download file
MinioFileStorage → MinIO Storage
  ↓ Extract text
FileExtractionService (PDFBox/Tika)
  ↓
Return extracted text
```

---

## Quick Start

### 1. Khởi động services

```bash
# Start Docker services (PostgreSQL + MinIO + App)
docker-compose -f docker-compose.dev.yml --env-file .env up -d

# Hoặc local development
mvn spring-boot:run
```

**Services:**
- App: http://localhost:8090
- MinIO Console: http://localhost:9001 (minioadmin / minioadmin123)
- MinIO API: http://localhost:9000
- PostgreSQL: localhost:5432
- PgAdmin: http://localhost:5050

---

## API Endpoints

### 1. Upload CV File

**Endpoint:** `POST /api/cv/upload`

**Description:** Upload file CV (PDF, DOCX, DOC) → Nhận file ID

**Request:**
```bash
curl -X POST http://localhost:8090/api/cv/upload \
  -F "file=@cv.pdf"
```

**Response (Success - 201 Created):**
```json
{
  "error_code": 0,
  "message": "File uploaded successfully",
  "data": {
    "file_id": "550e8400-e29b-41d4-a716-446655440000",
    "original_file_name": "cv.pdf",
    "content_type": "application/pdf",
    "file_size": 123456,
    "uploaded_at": "2025-10-30T11:30:00"
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error_code": 400,
  "message": "Unsupported file type. Supported types: PDF, DOCX, DOC"
}
```

---

### 2. Extract Text from CV

**Endpoint:** `POST /api/cv/extract/{fileId}`

**Description:** Trích xuất text từ CV đã upload bằng file ID

**Request:**
```bash
curl -X POST http://localhost:8090/api/cv/extract/550e8400-e29b-41d4-a716-446655440000
```

**Response (Success - 200 OK):**
```json
{
  "error_code": 0,
  "message": "Text extracted successfully",
  "data": {
    "file_name": "550e8400-e29b-41d4-a716-446655440000.pdf",
    "file_type": "PDF",
    "extracted_text": "CURRICULUM VITAE\n\nJohn Doe\nSoftware Engineer\nEmail: john@example.com\n\nEXPERIENCE:\n- Software Engineer at ABC Company (2020-2023)\n- Backend Developer at XYZ Corp (2018-2020)\n\nSKILLS:\nJava, Spring Boot, PostgreSQL, Docker...",
    "text_length": 1234,
    "extracted_at": "2025-10-30T11:31:00",
    "success": true
  }
}
```

**Response (Error - 404 Not Found):**
```json
{
  "error_code": 422,
  "message": "File not found: 550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Error - 422 Unprocessable Entity):**
```json
{
  "error_code": 422,
  "message": "No text content found in file"
}
```

---

### 3. Get Supported File Types

**Endpoint:** `GET /api/cv/supported-types`

**Description:** Lấy danh sách các loại file được hỗ trợ

**Request:**
```bash
curl http://localhost:8090/api/cv/supported-types
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

## Complete Flow Example

### Step 1: Upload CV

```bash
# Upload CV file
curl -X POST http://localhost:8090/api/cv/upload \
  -F "file=@john_doe_cv.pdf" \
  | jq '.'

# Response
{
  "error_code": 0,
  "message": "File uploaded successfully",
  "data": {
    "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "original_file_name": "john_doe_cv.pdf",
    "content_type": "application/pdf",
    "file_size": 245678,
    "uploaded_at": "2025-10-30T14:20:30"
  }
}
```

### Step 2: Extract Text from CV

```bash
# Extract text using file_id from step 1
curl -X POST http://localhost:8090/api/cv/extract/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  | jq '.'

# Response
{
  "error_code": 0,
  "message": "Text extracted successfully",
  "data": {
    "file_name": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "file_type": "PDF",
    "extracted_text": "JOHN DOE\nSoftware Engineer...",
    "text_length": 2456,
    "extracted_at": "2025-10-30T14:21:00",
    "success": true
  }
}
```

### Step 3: Use Extracted Text

```bash
# Use extracted text for further processing (e.g., send to AI for analysis)
extracted_text=$(curl -X POST http://localhost:8090/api/cv/extract/a1b2c3d4-e5f6-7890-abcd-ef1234567890 | jq -r '.data.extracted_text')

# Now you can send this text to Gemini AI or other processing services
echo "$extracted_text"
```

---

## MinIO Storage

Files được lưu trong MinIO bucket `cv-files`.

### Access MinIO Console

1. Open: http://localhost:9001
2. Login:
   - Username: `minioadmin`
   - Password: `minioadmin123`
3. Browse bucket: `cv-files`

### File Storage Structure

```
cv-files/
  ├── 550e8400-e29b-41d4-a716-446655440000.pdf
  ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.docx
  └── b2c3d4e5-f6a7-8901-bcde-f12345678901.doc
```

File naming: `{UUID}.{extension}`

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 0 | Success | Operation successful |
| 400 | Bad Request | Invalid input (empty file, wrong type, etc.) |
| 404 | Not Found | File not found with given ID |
| 422 | Unprocessable Entity | Cannot extract text from file |
| 500 | Internal Server Error | Server error |

---

## Environment Variables

### Application (.env file)

```env
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=co3065

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123

# PgAdmin
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin
```

### Spring Boot (application.yml)

```yaml
minio:
  endpoint: ${MINIO_ENDPOINT:http://localhost:9000}
  access-key: ${MINIO_ACCESS_KEY:minioadmin}
  secret-key: ${MINIO_SECRET_KEY:minioadmin}
  bucket-name: ${MINIO_BUCKET_NAME:cv-files}
```

---

## Testing with Postman

**Collection Import:**

```json
{
  "info": {
    "name": "CV Processing API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Upload CV",
      "request": {
        "method": "POST",
        "url": "http://localhost:8090/api/cv/upload",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/cv.pdf"
            }
          ]
        }
      }
    },
    {
      "name": "2. Extract CV Text",
      "request": {
        "method": "POST",
        "url": "http://localhost:8090/api/cv/extract/{{file_id}}"
      }
    },
    {
      "name": "3. Get Supported Types",
      "request": {
        "method": "GET",
        "url": "http://localhost:8090/api/cv/supported-types"
      }
    }
  ]
}
```

---

## Troubleshooting

### Issue 1: Cannot connect to MinIO

**Solution:**
```bash
# Check MinIO is running
docker ps | grep minio

# Check MinIO logs
docker logs co3065-minio

# Restart MinIO
docker-compose -f docker-compose.dev.yml restart minio
```

### Issue 2: File not found after upload

**Possible causes:**
- MinIO not started
- Bucket not created
- Wrong file ID

**Solution:**
```bash
# Check MinIO Console
open http://localhost:9001

# Check if bucket exists
docker exec co3065-minio mc ls myminio/

# Recreate bucket
docker-compose -f docker-compose.dev.yml up minio-init
```

### Issue 3: Cannot extract text from PDF

**Possible causes:**
- PDF is password-protected
- PDF contains only images (need OCR)
- Corrupted PDF file

**Solution:**
- Try with a different PDF
- Use DOCX format instead
- Ensure PDF has selectable text

---

## Performance

### File Size Limits

- Max file size: 10MB (configurable in `application.yml`)
- Recommended: < 5MB for faster processing

### Processing Time

- Upload: ~100-500ms
- Extract PDF: ~1-3s
- Extract DOCX: ~500ms-2s

---

## Security Considerations

### Current Implementation (Development)

- ⚠️ No authentication
- ⚠️ No file content validation
- ⚠️ No rate limiting
- ⚠️ Public MinIO bucket

### Production Recommendations

- ✅ Add JWT authentication
- ✅ Validate file content (not just extension)
- ✅ Implement rate limiting
- ✅ Private MinIO bucket with signed URLs
- ✅ Virus scanning
- ✅ File size validation

---

## Next Steps

### PoC 2: Gemini AI Integration

After extracting CV text, send to Gemini for:
1. Profile analysis
2. Skills extraction
3. Experience summarization
4. Generate recommendations

**Example flow:**
```
Upload CV → Extract Text → Send to Gemini → Get Structured Profile
```

### PoC 3: Message Queue (RabbitMQ/Kafka)

Async processing:
```
Upload → Queue Message → Worker extracts → Queue Result → Notify Client
```

---

## API Examples

### Shell Script

```bash
#!/bin/bash

# Upload CV
FILE_ID=$(curl -s -X POST http://localhost:8090/api/cv/upload \
  -F "file=@cv.pdf" \
  | jq -r '.data.file_id')

echo "Uploaded file ID: $FILE_ID"

# Wait a moment
sleep 1

# Extract text
curl -s -X POST "http://localhost:8090/api/cv/extract/$FILE_ID" \
  | jq '.data.extracted_text' \
  | head -20

echo "Extraction complete!"
```

### Python Script

```python
import requests
import time

# 1. Upload CV
with open('cv.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8090/api/cv/upload',
        files={'file': f}
    )

file_id = response.json()['data']['file_id']
print(f"Uploaded: {file_id}")

# 2. Extract text
time.sleep(1)
response = requests.post(
    f'http://localhost:8090/api/cv/extract/{file_id}'
)

extracted_text = response.json()['data']['extracted_text']
print(f"Extracted text length: {len(extracted_text)}")
print(extracted_text[:200])
```

---

**Last Updated**: October 30, 2025  
**Version**: 2.0 - Upload & Extract API

