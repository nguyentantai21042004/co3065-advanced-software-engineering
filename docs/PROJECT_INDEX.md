# AI Coach - Project Index

> **Version:** 1.0.0
> **Last Updated:** 2025-10-31
> **Architecture:** Hexagonal Architecture (Ports & Adapters)

## Table of Contents

- [Quick Reference](#quick-reference)
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Message Queue Architecture](#message-queue-architecture)
- [Configuration](#configuration)
- [Development Commands](#development-commands)
- [Service Access Points](#service-access-points)

---

## Quick Reference

### Key Locations

| What | Where |
|------|-------|
| **API Entry Point** | `src/main/java/com/aicoach/cmd/api/AICoachServiceApplication.java` |
| **Consumer Entry Point** | `src/main/java/com/aicoach/cmd/consumer/CVProcessingConsumerApplication.java` |
| **REST Controllers** | `src/main/java/com/aicoach/adapter/http/` |
| **Business Logic** | `src/main/java/com/aicoach/usecase/` |
| **Domain Models** | `src/main/java/com/aicoach/models/` |
| **Repositories** | `src/main/java/com/aicoach/repository/` |
| **Message Producers/Consumers** | `src/main/java/com/aicoach/messaging/` |
| **Configuration** | `src/main/java/com/aicoach/config/` |
| **Database Migrations** | `src/main/resources/sql/` |
| **Application Config** | `src/main/resources/application.yml` |

### Quick Commands

```bash
# Start all services
make dev-up

# Enter development container
make dev-shell

# Run API service
make run-api

# Run consumer service
make run-consumer

# Run tests
make run-tests

# View logs
make dev-logs
```

---

## Project Overview

**AI Coach** is a personal skill development platform that processes CVs and documents to extract information and provide insights. The system is built as a microservice application with:

- **API Service**: REST endpoints for file upload and extraction requests
- **Consumer Service**: Background workers for asynchronous document processing
- **Event-Driven Architecture**: RabbitMQ for task distribution and notifications

### Key Features

- File upload (PDF, DOCX, DOC)
- Asynchronous CV text extraction
- S3-compatible object storage (MinIO)
- PostgreSQL for metadata and results
- RabbitMQ for async processing
- Swagger/OpenAPI documentation
- Multi-profile deployment (API/Consumer)

---

## Technology Stack

### Core Framework
- **Java**: 17
- **Spring Boot**: 3.5.6
- **Maven**: 3.9.8

### Data & Storage
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA / Hibernate
- **Object Storage**: MinIO (S3-compatible)
- **Message Queue**: RabbitMQ 3.12

### Document Processing
- **PDF**: Apache PDFBox 3.0.1
- **DOCX/DOC**: Apache Tika 2.9.1

### Security & API
- **Authentication**: JWT (jjwt 0.12.3)
- **API Documentation**: Springdoc OpenAPI 2.3.0

### Additional
- **Serialization**: Jackson (JSON)
- **Code Quality**: Lombok
- **RPC**: gRPC 1.62.2
- **Protocol**: Protobuf 3.25.3

---

## Architecture Overview

### Hexagonal Architecture (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL WORLD                           │
│  (HTTP Clients, RabbitMQ, PostgreSQL, MinIO)               │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
    ┌────────▼──────────┐          ┌──────────▼─────────┐
    │  Adapters (IN)    │          │ Adapters (OUT)     │
    │  - Controllers    │          │ - Repositories     │
    │  - REST API       │          │ - Storage Services │
    │  - Messaging      │          │ - Producers        │
    └────────┬──────────┘          └──────────┬─────────┘
             │                                │
             └────────────┬───────────────────┘
                          │
        ┌─────────────────▼──────────────────┐
        │   APPLICATION CORE (Ports)         │
        │  ┌────────────────────────────────┐│
        │  │  Use Cases / Services          ││
        │  │  - FileUploadUseCase           ││
        │  │  - FileExtractionUseCase       ││
        │  │  - CVExtractionUseCase         ││
        │  └────────────────────────────────┘│
        │  ┌────────────────────────────────┐│
        │  │  Domain Models                 ││
        │  │  - UploadedFile                ││
        │  │  - FileExtraction              ││
        │  └────────────────────────────────┘│
        │  ┌────────────────────────────────┐│
        │  │  Port Interfaces               ││
        │  │  - FileStorage (out)           ││
        │  │  - FileExtractor (out)         ││
        │  └────────────────────────────────┘│
        └────────────────────────────────────┘
```

### Key Principles

1. **Business logic independence**: Core use cases don't depend on frameworks
2. **Port interfaces**: Define contracts for external dependencies
3. **Adapter implementations**: Concrete implementations of ports
4. **Dependency injection**: Spring wires implementations to interfaces

---

## Directory Structure

```
co3065-advanced-software-engineering/
├── src/main/java/com/aicoach/
│   ├── cmd/                          # Application Entry Points
│   │   ├── api/                      # API Service (Port 8090)
│   │   │   └── AICoachServiceApplication.java
│   │   └── consumer/                 # Consumer Service
│   │       └── CVProcessingConsumerApplication.java
│   │
│   ├── adapter/                      # Input Adapters (Controllers)
│   │   └── http/
│   │       ├── CVProcessingController.java    # /api/cv/*
│   │       ├── FileExtractionController.java  # /api/files/*
│   │       └── dto/                           # Data Transfer Objects
│   │           ├── ApiResponse.java
│   │           ├── UploadedFileResponse.java
│   │           └── FileExtractionResponse.java
│   │
│   ├── usecase/                      # Business Logic (Ports)
│   │   ├── FileExtractionUseCase.java        # Interface
│   │   ├── FileUploadUseCase.java            # Interface
│   │   ├── CVExtractionUseCase.java          # Interface
│   │   ├── types/                            # Command objects
│   │   │   └── FileExtractionCommand.java
│   │   └── service/                          # Implementations
│   │       ├── FileExtractionService.java
│   │       ├── FileUploadService.java
│   │       └── CVExtractionService.java
│   │
│   ├── models/                       # Domain Models
│   │   ├── UploadedFile.java
│   │   ├── FileExtraction.java
│   │   ├── CVExtractionMessage.java
│   │   └── ExtractionNotifyMessage.java
│   │
│   ├── repository/                   # Output Adapters
│   │   ├── FileStorage.java                  # Port (interface)
│   │   ├── FileExtractor.java                # Port (interface)
│   │   ├── filestorage/
│   │   │   └── MinioFileStorage.java         # Adapter
│   │   ├── fileextraction/
│   │   │   ├── PdfExtractor.java             # Adapter
│   │   │   └── DocxExtractor.java            # Adapter
│   │   └── postgresql/
│   │       ├── UploadedFileRepository.java   # JPA Repository
│   │       ├── ExtractionResultRepository.java
│   │       ├── entity/
│   │       │   ├── UploadedFileEntity.java
│   │       │   └── ExtractionResultEntity.java
│   │       └── mapper/
│   │           └── UploadedFileMapper.java
│   │
│   ├── messaging/                    # Message Queue Layer
│   │   ├── CVExtractionProducer.java
│   │   ├── CVExtractionConsumer.java
│   │   └── ExtractionNotifyProducer.java
│   │
│   ├── config/                       # Configuration
│   │   ├── RabbitMQConfig.java
│   │   ├── MinioConfig.java
│   │   ├── OpenApiConfig.java
│   │   └── CorsConfig.java
│   │
│   ├── constants/
│   │   └── FileConstants.java
│   │
│   └── mappers/
│       └── UploadedFileMapper.java
│
├── src/main/resources/
│   ├── application.yml               # Main configuration
│   ├── application-consumer.yml      # Consumer profile config
│   └── sql/                          # Database migrations
│       ├── V1__create_uploaded_file_table.sql
│       └── V2__create_extraction_result_table.sql
│
├── src/test/java/com/aicoach/       # Tests
│
├── docker-compose.dev.yml            # Development environment
├── Dockerfile.dev                    # Development container
├── pom.xml                           # Maven configuration
├── Makefile                          # Development commands
└── .env                              # Environment variables
```

---

## Core Components

### 1. Controllers (Input Adapters)

**Location**: `src/main/java/com/aicoach/adapter/http/`

| Class | Endpoint | Purpose |
|-------|----------|---------|
| `CVProcessingController` | `/api/cv/*` | CV upload and async extraction |
| `FileExtractionController` | `/api/files/*` | Synchronous file text extraction |

### 2. Use Cases (Business Logic)

**Location**: `src/main/java/com/aicoach/usecase/`

| Interface | Implementation | Purpose |
|-----------|----------------|---------|
| `FileUploadUseCase` | `FileUploadService` | Upload files to MinIO |
| `FileExtractionUseCase` | `FileExtractionService` | Extract text from documents |
| `CVExtractionUseCase` | `CVExtractionService` | CV-specific extraction logic |

### 3. Domain Models

**Location**: `src/main/java/com/aicoach/models/`

| Model | Purpose |
|-------|---------|
| `UploadedFile` | File metadata domain object |
| `FileExtraction` | Extraction result domain object |
| `CVExtractionMessage` | RabbitMQ message for extraction task |
| `ExtractionNotifyMessage` | RabbitMQ notification message |

### 4. Repositories (Output Adapters)

**Location**: `src/main/java/com/aicoach/repository/`

#### Storage Adapters
- `MinioFileStorage` implements `FileStorage`: S3-compatible file storage

#### Extraction Adapters
- `PdfExtractor` implements `FileExtractor`: PDF text extraction
- `DocxExtractor` implements `FileExtractor`: DOCX/DOC text extraction

#### JPA Repositories
- `UploadedFileRepository`: File metadata persistence
- `ExtractionResultRepository`: Extraction results persistence

### 5. Messaging

**Location**: `src/main/java/com/aicoach/messaging/`

| Class | Type | Purpose |
|-------|------|---------|
| `CVExtractionProducer` | Producer | Publish extraction tasks |
| `CVExtractionConsumer` | Consumer | Process extraction tasks |
| `ExtractionNotifyProducer` | Producer | Publish completion notifications |

---

## API Endpoints

### Base URL
```
http://localhost:8090/api
```

### CV Processing API

| Method | Endpoint | Request | Response | Description |
|--------|----------|---------|----------|-------------|
| POST | `/cv/upload` | Multipart: file | UploadedFileResponse | Upload CV file |
| POST | `/cv/extract/{fileId}` | Path: fileId | Task accepted | Publish extraction task |
| GET | `/cv/supported-types` | - | List of strings | Get supported file types |

### File Extraction API

| Method | Endpoint | Request | Response | Description |
|--------|----------|---------|----------|-------------|
| POST | `/files/extract` | Multipart: file | FileExtractionResponse | Extract full text |
| POST | `/files/extract/preview` | Multipart: file, maxLength | FileExtractionResponse | Extract preview |
| GET | `/files/supported-types` | - | List of strings | Get supported file types |

### Swagger Documentation
```
http://localhost:8090/swagger-ui.html
```

---

## Database Schema

### Table: `uploaded_file`

```sql
CREATE TABLE uploaded_file (
    file_id UUID PRIMARY KEY,
    original_file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(255) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

### Table: `extraction_result`

```sql
CREATE TABLE extraction_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    raw_text TEXT,
    avatar_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_uploaded_file FOREIGN KEY(file_id)
        REFERENCES uploaded_file(file_id)
);
```

---

## Message Queue Architecture

### Queue: `cv.extraction.queue`

**Purpose**: Distribute CV extraction tasks to consumer workers

**Message**: `CVExtractionMessage`
```json
{
  "taskId": "unique-task-id",
  "fileId": "uploaded-file-id",
  "fileName": "cv.pdf",
  "fileType": "application/pdf",
  "fileSize": 245678,
  "createdAt": "2025-10-30T14:20:30",
  "userId": "user-123",
  "retryCount": 0
}
```

**Configuration**:
- Exchange: `cv.exchange` (Direct)
- Routing Key: `cv.extraction`
- TTL: 5 minutes
- DLX: `cv.dlx`
- DLQ: `cv.extraction.dlq`

### Queue: `extraction.notify.queue`

**Purpose**: Notify completion of extraction tasks

**Message**: `ExtractionNotifyMessage`
```json
{
  "resultId": "extraction-result-uuid"
}
```

**Configuration**:
- Exchange: `extraction.notify.exchange` (Direct)
- Routing Key: `extraction.notify`

---

## Configuration

### Spring Profiles

#### Default Profile (API Service)
```yaml
# application.yml
spring:
  application:
    name: "AI Coach"
  datasource:
    url: jdbc:postgresql://localhost:5432/co3065_db
```

#### Consumer Profile
```yaml
# application-consumer.yml
spring:
  config:
    activate:
      on-profile: consumer
  main:
    web-application-type: none  # No web server
```

### Environment Variables

**Database**:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/co3065_db
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=admin123
```

**MinIO**:
```bash
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
MINIO_BUCKET_NAME=cv-files
```

**RabbitMQ**:
```bash
SPRING_RABBITMQ_HOST=rabbitmq
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=admin
SPRING_RABBITMQ_PASSWORD=admin123
```

---

## Development Commands

### Using Makefile

```bash
# Start all services (PostgreSQL, RabbitMQ, MinIO, pgAdmin)
make dev-up

# Stop all services
make dev-down

# Enter development container shell
make dev-shell

# Run API service (inside container)
make run-api

# Run consumer service (inside container)
make run-consumer

# Run tests
make run-tests

# View logs
make dev-logs        # All services
make api-logs        # API service only
make consumer-logs   # Consumer service only
```

### Using Maven Directly

```bash
# Build project
mvn clean package

# Run API service
mvn spring-boot:run

# Run consumer service
mvn spring-boot:run -Dspring.profiles.active=consumer

# Run tests
mvn test
```

---

## Service Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **API** | http://localhost:8090 | - |
| **Swagger UI** | http://localhost:8090/swagger-ui.html | - |
| **RabbitMQ Management** | http://localhost:15672 | admin / admin123 |
| **MinIO Console** | http://localhost:9001 | admin / admin123 |
| **pgAdmin** | http://localhost:5050 | admin@example.com / admin123 |
| **PostgreSQL** | localhost:5432 | admin / admin123 |

---

## Key Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `pom.xml` | Maven dependencies and build configuration |
| `application.yml` | Spring Boot configuration (API service) |
| `application-consumer.yml` | Consumer profile configuration |
| `.env` | Environment variables for Docker |
| `docker-compose.dev.yml` | Development infrastructure setup |
| `Makefile` | Development command shortcuts |

### Database Migrations

| File | Purpose |
|------|---------|
| `V1__create_uploaded_file_table.sql` | Create uploaded_file table |
| `V2__create_extraction_result_table.sql` | Create extraction_result table |

### Application Entry Points

| File | Purpose |
|------|---------|
| `AICoachServiceApplication.java` | API service main class |
| `CVProcessingConsumerApplication.java` | Consumer service main class |

---

## Data Flow Diagrams

### Synchronous Flow (File Extraction API)

```
HTTP Request → Controller → UseCase → Service → Extractor → Response
                                           ↓
                                      Domain Model
```

### Asynchronous Flow (CV Extraction)

```
Upload:
HTTP Request → Controller → Service → MinIO + PostgreSQL → Response

Extract:
HTTP Request → Controller → Producer → RabbitMQ → Response (202 Accepted)
                                           ↓
                                      Consumer Service
                                           ↓
                                   MinIO + Extractor
                                           ↓
                                      PostgreSQL
                                           ↓
                                    Notify Producer
```

---

## Related Documentation

- [Module Development Guide](MODULE_DEVELOPMENT_GUIDE.md) - Step-by-step guide for creating new modules
- [README.md](README.md) - Project overview and setup instructions
- Swagger UI - API interactive documentation (run server first)

---

**Generated**: 2025-10-31
**Project Version**: 1.0.0
**Java**: 17 | **Spring Boot**: 3.5.6
