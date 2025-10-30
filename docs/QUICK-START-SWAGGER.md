# Quick Start - Swagger API

## Truy cập Swagger UI

1. **Start ứng dụng:**
   ```bash
   make dev-up
   ```

2. **Mở browser:**
   ```
   http://localhost:8090/swagger-ui.html
   ```

## Import vào Postman

1. Mở Postman → Click **Import**
2. Chọn **Link** tab
3. Dán URL: 
   ```
   http://localhost:8090/api-docs
   ```
4. Click **Import**

Done!

## Export OpenAPI Spec

- **JSON:** http://localhost:8090/api-docs
- **YAML:** http://localhost:8090/api-docs.yaml

## Test Flow

1. **Upload CV** → `/api/cv/upload` → Get `file_id`
2. **Extract Text** → `/api/cv/extract/{fileId}` → Get extracted text

---

Chi tiết xem: [SWAGGER-API-DOCS.md](./SWAGGER-API-DOCS.md)
