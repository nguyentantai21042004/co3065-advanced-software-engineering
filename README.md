# AI Coach - Hệ thống Huấn luyện viên AI

> **Dự án môn học:** CO3065 - Công Nghệ Phần Mềm Nâng Cao  
> **Học kỳ:** HK251  
> **Trường:** Đại học Bách Khoa TP.HCM

## Tổng quan

**AI Coach** là một hệ thống hỗ trợ phát triển kỹ năng cá nhân thông minh, sử dụng công nghệ AI để phân tích CV và đưa ra các gợi ý phát triển kỹ năng được cá nhân hóa.

### Tầm nhìn

Chúng tôi mong muốn xây dựng một công cụ giúp nhân viên/học sinh – sinh viên cải thiện kỹ năng của họ. Công cụ sẽ:

- **Cá nhân hóa** theo bộ kỹ năng và trình độ hiện tại của từng người
- **Xác định kế hoạch hành động** phù hợp hướng tới các mục tiêu/kỹ năng mong muốn
- **Lựa chọn mục tiêu khả thi và bền vững**
- **Hỗ trợ xác định các hành động SMART** (Specific, Measurable, Achievable, Relevant, Time-bound)

### Tính năng chính

- **Xử lý CV thông minh**: Upload và trích xuất thông tin từ CV (PDF, DOCX, DOC)
- **Phân tích bằng AI**: Sử dụng Google Gemini AI để phân tích kỹ năng, kinh nghiệm và trình độ
- **Đánh giá năng lực**: Tự động đánh giá các kỹ năng cốt lõi và điểm mạnh/yếu
- **Lập kế hoạch SMART**: Tạo kế hoạch hành động cụ thể để đạt được mục tiêu
- **Quản lý người dùng**: Hệ thống đăng ký, đăng nhập với JWT authentication
- **Lịch sử xử lý**: Theo dõi lịch sử upload và phân tích CV

## Kiến trúc hệ thống

Hệ thống được xây dựng theo **Clean Architecture (Hexagonal Architecture)** với sự tách biệt rõ ràng giữa business logic và infrastructure.

### Cấu trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  - React 18 + TypeScript                                 │
│  - Next.js 16                                            │
│  - Tailwind CSS                                          │
│  - Authentication với JWT                                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────┐
│              Backend API (Spring Boot)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Adapter Layer (HTTP Controllers)                │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  Use Case Layer (Business Logic)                 │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  Domain Layer (Pure Java Models)                  │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  Infrastructure Layer (Repositories)              │   │
│  └───────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                  │
┌───▼───┐    ┌──────▼──────┐    ┌─────▼─────┐
│PostgreSQL│  │  RabbitMQ   │    │   MinIO    │
│          │  │  (Message   │    │  (Object   │
│          │  │   Queue)    │    │  Storage)  │
└─────────┘  └─────────────┘    └───────────┘
```

### Luồng xử lý chính

1. **Upload CV**: Người dùng upload file CV → Lưu vào MinIO → Lưu metadata vào PostgreSQL
2. **Trích xuất text**: Consumer service xử lý async → Trích xuất text từ CV → Lưu kết quả
3. **Phân tích AI**: Gửi text đến Google Gemini AI → Phân tích kỹ năng, kinh nghiệm → Tạo profile và assessment
4. **Tạo kế hoạch SMART**: Dựa trên assessment và mục tiêu người dùng → Tạo kế hoạch hành động cụ thể

## Công nghệ sử dụng

### Backend

- **Java 17**: Ngôn ngữ lập trình
- **Spring Boot 3.5.6**: Framework chính
- **Spring Data JPA**: ORM và database interaction
- **PostgreSQL 15**: Database chính
- **RabbitMQ 3.12**: Message queue cho async processing
- **MinIO**: S3-compatible object storage
- **JWT (jjwt 0.12.3)**: Authentication
- **Apache PDFBox 3.0.1**: Xử lý PDF
- **Apache Tika 2.9.1**: Xử lý DOCX/DOC
- **Google Gemini AI**: Phân tích và tạo nội dung
- **Maven**: Build tool
- **Docker**: Containerization

### Frontend

- **Next.js 16**: React framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Component library
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **Zod**: Schema validation

## Cấu trúc dự án

```
co3065-advanced-software-engineering/
├── backend/                    # Backend service (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/aicoach/
│   │   │   │   ├── adapter/        # HTTP Controllers
│   │   │   │   ├── usecase/        # Business logic
│   │   │   │   ├── models/         # Domain models
│   │   │   │   ├── repository/     # Data access
│   │   │   │   ├── messaging/      # RabbitMQ producers/consumers
│   │   │   │   ├── config/         # Configuration
│   │   │   │   └── security/       # JWT authentication
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── sql/            # Database migrations
│   │   └── test/                   # Unit tests
│   ├── docs/                      # Documentation
│   ├── docker-compose.dev.yml     # Development environment
│   ├── Dockerfile.dev             # Development container
│   ├── Makefile                   # Development commands
│   └── pom.xml                    # Maven dependencies
│
└── frontend/                      # Frontend service (Next.js)
    ├── app/                       # Next.js app directory
    │   ├── auth/                  # Authentication pages
    │   └── dashboard/             # Dashboard pages
    ├── components/                # React components
    ├── lib/                       # Utilities and services
    ├── contexts/                  # React contexts
    ├── hooks/                     # Custom hooks
    ├── types/                     # TypeScript types
    ├── public/                    # Static assets
    ├── package.json
    └── next.config.mjs
```

## Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống

- **Java 17+**
- **Node.js 20+** và **pnpm**
- **Docker** và **Docker Compose**
- **Maven 3.9+**
- **PostgreSQL 15+** (hoặc dùng Docker)
- **Google Gemini API Key** (miễn phí tại [Google AI Studio](https://makersuite.google.com/app/apikey))

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd co3065-advanced-software-engineering
```

### Bước 2: Cấu hình Backend

1. Tạo file `.env` trong thư mục `backend/`:

```bash
cd backend
cp .env.example .env  # Nếu có
```

2. Chỉnh sửa file `.env` với các giá trị phù hợp:

```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=<your-secure-password>
POSTGRES_DB=co3065_db

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<your-secure-password>

# RabbitMQ
SPRING_RABBITMQ_USERNAME=admin
SPRING_RABBITMQ_PASSWORD=<your-secure-password>

# Google Gemini API
GEMINI_API_KEYS=<your-gemini-api-key-1>,<your-gemini-api-key-2>
```

3. Cập nhật `application.yml` nếu cần (hoặc sử dụng environment variables):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/co3065_db
    username: ${POSTGRES_USER:admin}
    password: ${POSTGRES_PASSWORD:admin123}

gemini:
  api-keys: ${GEMINI_API_KEYS:}
```

### Bước 3: Khởi động Backend services

Sử dụng Docker Compose để khởi động tất cả services:

```bash
cd backend
make dev-up
```

Hoặc chạy thủ công:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Các services sẽ chạy trên:
- **API**: http://localhost:8090
- **Swagger UI**: http://localhost:8090/swagger-ui.html
- **RabbitMQ Management**: http://localhost:15672 (admin/rabbitmq123)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)
- **PostgreSQL**: localhost:5432

### Bước 4: Chạy Backend Application

```bash
cd backend

# Chạy API service
make run-api
# hoặc
mvn spring-boot:run

# Chạy Consumer service (terminal khác)
make run-consumer
# hoặc
mvn spring-boot:run -Dspring.profiles.active=consumer
```

### Bước 5: Cấu hình Frontend

1. Tạo file `.env.local` trong thư mục `frontend/`:

```bash
cd frontend
cp .env.example .env.local
```

2. Chỉnh sửa `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8090/api
NEXT_PUBLIC_APP_NAME=AI Coach
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Bước 6: Chạy Frontend

```bash
cd frontend

# Cài đặt dependencies
pnpm install

# Chạy development server
pnpm dev
```

Frontend sẽ chạy tại: http://localhost:3000

## API Documentation

Sau khi khởi động backend, truy cập Swagger UI để xem API documentation:

```
http://localhost:8090/swagger-ui.html
```

### Các endpoint chính

#### Authentication
- `POST /api/users/register` - Đăng ký tài khoản mới
- `POST /api/users/login` - Đăng nhập và nhận JWT token

#### CV Processing
- `POST /api/cv/upload` - Upload file CV
- `POST /api/cv/extract/{fileId}` - Trích xuất text từ CV (async)
- `GET /api/cv/supported-types` - Lấy danh sách file types được hỗ trợ

#### File Extraction
- `POST /api/files/extract` - Trích xuất text từ file (sync)
- `POST /api/files/extract/preview` - Trích xuất preview text

## Bảo mật

### Lưu ý quan trọng trước khi public source code

Dự án hiện tại có một số vấn đề bảo mật cần được xử lý trước khi public:

#### 1. JWT Secret Key

**Vấn đề**: JWT secret key được generate tự động mỗi lần restart server, dẫn đến tokens không hợp lệ sau khi restart.

**Vị trí**: `backend/src/main/java/com/aicoach/security/JwtService.java`

**Giải pháp**: Sử dụng secret key cố định từ environment variable:

```java
@Value("${jwt.secret:your-default-secret-key-change-in-production}")
private String jwtSecret;

private Key getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
    return Keys.hmacShaKeyFor(keyBytes);
}
```

Thêm vào `application.yml`:
```yaml
jwt:
  secret: ${JWT_SECRET:your-base64-encoded-secret-key}
```

#### 2. Database Credentials

**Vấn đề**: Database password được hardcode trong `application.yml` với giá trị mặc định `admin123`.

**Vị trí**: `backend/src/main/resources/application.yml`

**Giải pháp**: 
- Đã sử dụng environment variables: `${POSTGRES_PASSWORD:admin123}`
- Cần đảm bảo không commit file `.env` vào git
- Thay đổi password mặc định trong production

#### 3. MinIO Credentials

**Vấn đề**: MinIO credentials có giá trị mặc định trong code.

**Giải pháp**: 
- Đã sử dụng environment variables
- Thay đổi credentials mặc định trong production

#### 4. API Keys

**Vấn đề**: Google Gemini API keys cần được bảo vệ.

**Giải pháp**: 
- Đã sử dụng environment variables: `${GEMINI_API_KEYS:}`
- Không commit API keys vào git
- Sử dụng secrets management trong production (AWS Secrets Manager, HashiCorp Vault, etc.)

### Checklist bảo mật trước khi public

- [ ] Thay đổi JWT secret key sang environment variable
- [ ] Đảm bảo `.env` và `.env.local` trong `.gitignore`
- [ ] Thay đổi tất cả passwords mặc định
- [ ] Xóa hoặc thay đổi hardcoded credentials trong code
- [ ] Sử dụng strong passwords cho production
- [ ] Cấu hình CORS phù hợp (không dùng `*` trong production)
- [ ] Bật HTTPS trong production
- [ ] Implement rate limiting
- [ ] Thêm input validation và sanitization
- [ ] Review và fix security vulnerabilities

### File `.gitignore` cần có

Đảm bảo các file sau được ignore:

```
# Environment files
.env
.env.local
.env*.local
.env.production

# Secrets
*.pem
*.key
secrets/
```

## Testing

### Backend Tests

```bash
cd backend
mvn test
```

### Frontend Tests

```bash
cd frontend
pnpm test
```

## Tài liệu tham khảo

- [Backend Architecture](backend/docs/ARCHITECTURE.md) - Kiến trúc chi tiết của backend
- [CV Processing API](backend/docs/CV-PROCESSING-API.md) - Tài liệu API xử lý CV
- [Project Index](backend/docs/PROJECT_INDEX.md) - Chỉ mục tài liệu dự án
- [RabbitMQ Architecture](backend/docs/RABBITMQ-ARCHITECTURE.md) - Kiến trúc message queue
- [Development Guide](backend/docs/MODULE_DEVELOPMENT_GUIDE.md) - Hướng dẫn phát triển module mới

## Đóng góp

Dự án này được phát triển cho môn học CO3065. Nếu bạn muốn đóng góp:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Dự án này được phát triển cho mục đích học tập. Xem file `LICENSE` để biết thêm chi tiết.

## Tác giả

**Nhóm CO3065 - HK251**

- Đại học Bách Khoa TP.HCM

## Lời cảm ơn

- Google Gemini AI cho API miễn phí
- Spring Boot community
- Next.js team
- Tất cả các open source libraries được sử dụng trong dự án
