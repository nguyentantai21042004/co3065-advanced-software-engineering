# Swagger API Documentation

## Giới thiệu

Project đã tích hợp **SpringDoc OpenAPI 3** (Swagger) để tự động generate API documentation. Bạn có thể:

1. Xem tất cả API endpoints với mô tả chi tiết
2. Test API trực tiếp trên Swagger UI
3. Export OpenAPI spec để import vào Postman
4. Xem request/response examples

---

## Truy cập Swagger UI

### 1. Start ứng dụng

```bash
# Dùng Docker Compose (recommended)
make dev-up

# Hoặc chạy trực tiếp
mvn spring-boot:run
```

### 2. Mở Swagger UI trong browser

```
http://localhost:8090/swagger-ui.html
```

Hoặc:

```
http://localhost:8090/swagger-ui/index.html
```

### 3. Swagger UI Features

![Swagger UI Interface](https://raw.githubusercontent.com/springdoc/springdoc-openapi/master/img/swagger-ui.png)

**Chức năng chính:**
- Danh sách tất cả API endpoints
- Mô tả chi tiết từng API
- Test API trực tiếp (Try it out)
- Request examples
- Response examples
- Schema models

---

## OpenAPI JSON/YAML

### Download OpenAPI Specification

**JSON Format:**
```
http://localhost:8090/api-docs
```

**YAML Format:**
```
http://localhost:8090/api-docs.yaml
```

### Import vào Postman

1. Mở Postman
2. Click **Import**
3. Chọn **Link** tab
4. Dán URL: `http://localhost:8090/api-docs`
5. Click **Continue** → **Import**

Postman sẽ tự động tạo collection với tất cả API endpoints! 

### Import vào Insomnia

1. Mở Insomnia
2. Click **Create** → **Import From** → **URL**
3. Dán URL: `http://localhost:8090/api-docs`
4. Click **Fetch and Import**

---

## Test API với Swagger UI

### Example: Upload CV

1. Truy cập: http://localhost:8090/swagger-ui.html
2. Tìm endpoint **POST /api/cv/upload**
3. Click **Try it out**
4. Click **Choose File** → Chọn file CV (PDF/DOCX)
5. Click **Execute**
6. Xem response, copy **file_id**

### Example: Extract Text

1. Tìm endpoint **POST /api/cv/extract/{fileId}**
2. Click **Try it out**
3. Paste **file_id** từ bước trên
4. Click **Execute**
5. Xem extracted text trong response

---

## API Endpoints Overview

### 1. Upload CV File

```http
POST /api/cv/upload
Content-Type: multipart/form-data

Parameter:
- file: CV file (PDF, DOCX, DOC)

Response:
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
```

### 2. Extract Text from CV

```http
POST /api/cv/extract/{fileId}

Response:
{
  "error_code": 0,
  "message": "Text extracted successfully",
  "data": {
    "file_name": "550e8400-e29b-41d4-a716-446655440000.pdf",
    "file_type": "PDF",
    "extracted_text": "CURRICULUM VITAE\n\nJohn Doe...",
    "text_length": 234,
    "extracted_at": "2025-10-30T14:21:00",
    "success": true
  }
}
```

### 3. Get Supported File Types

```http
GET /api/cv/supported-types

Response:
{
  "error_code": 0,
  "message": "Supported file types",
  "data": ["PDF", "DOCX", "DOC"]
}
```

---

## Configuration

### application.yml

```yaml
# OpenAPI/Swagger Configuration
springdoc:
  api-docs:
    path: /api-docs              # OpenAPI spec JSON path
    enabled: true                # Enable API docs
  swagger-ui:
    path: /swagger-ui.html       # Swagger UI path
    enabled: true                # Enable Swagger UI
    operations-sorter: method    # Sort by HTTP method
    tags-sorter: alpha           # Sort tags alphabetically
    display-request-duration: true
    doc-expansion: none          # Collapse all sections by default
```

### Disable Swagger in Production

Nếu muốn tắt Swagger trong production:

```yaml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

Hoặc dùng profile:

```yaml
spring:
  profiles:
    active: prod

---
# Development profile
spring:
  config:
    activate:
      on-profile: dev
springdoc:
  swagger-ui:
    enabled: true

---
# Production profile
spring:
  config:
    activate:
      on-profile: prod
springdoc:
  swagger-ui:
    enabled: false
```

---

## Security (Future)

Khi thêm authentication, cần config Swagger để support:

```java
@Bean
public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(...)
        .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
        .components(new Components()
            .addSecuritySchemes("Bearer Authentication",
                new SecurityScheme()
                    .name("Bearer Authentication")
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
}
```

---

## Tài liệu tham khảo

- [SpringDoc Official Docs](https://springdoc.org/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

## Tips & Best Practices

1. **Luôn thêm mô tả chi tiết** cho API bằng `@Operation`
2. **Cung cấp examples** cho request/response bằng `@ExampleObject`
3. **Document tất cả status codes** bằng `@ApiResponses`
4. **Sử dụng `@Schema`** để document DTO fields
5. **Group APIs** bằng `@Tag` cho dễ navigate
6. **Disable Swagger trong production** nếu không cần thiết

---

## Troubleshooting

### Swagger UI không hiển thị

1. Kiểm tra application đã start thành công chưa
2. Kiểm tra port 8090 có bị conflict không
3. Clear browser cache và thử lại
4. Kiểm tra logs xem có error không

### OpenAPI spec không generate

1. Kiểm tra `springdoc.api-docs.enabled=true`
2. Kiểm tra controllers có annotations đúng không
3. Restart application

### Upload file không hoạt động trong Swagger UI

1. Kiểm tra file size < 10MB
2. Kiểm tra file type (PDF, DOCX, DOC)
3. Kiểm tra MinIO đã start chưa: `docker ps | grep minio`

---

## Checklist

- [x] SpringDoc dependency added
- [x] OpenAPI configuration created
- [x] Swagger annotations added to controllers
- [x] API documentation accessible
- [x] OpenAPI spec can be exported
- [x] Can import to Postman/Insomnia

**All done! Your API is now fully documented!**
