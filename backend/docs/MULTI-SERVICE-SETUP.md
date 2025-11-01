# Multi-Service Setup Guide

## Cấu trúc Project

```
co3065-advanced-software-engineering/
├── cmd/
│   ├── api/
│   │   ├── AICoachServiceApplication.java  # API Entry Point
│   │   └── Dockerfile                       # API Dockerfile
│   └── consumer/
│       ├── CVProcessingConsumerApplication.java  # Consumer Entry Point
│       └── Dockerfile                             # Consumer Dockerfile
├── src/
│   └── main/
│       ├── java/co3065/ai_coach/
│       │   ├── adapter/          # HTTP Controllers
│       │   ├── config/           # Configuration
│       │   ├── messaging/        # RabbitMQ Producer & Consumer
│       │   ├── models/           # Domain Models
│       │   ├── repository/       # Repositories
│       │   └── usecase/          # Use Cases
│       └── resources/
│           └── application.yml   # Application Config
├── docker-compose.yml            # Production deployment
└── docker-compose.dev.yml        # Development environment
```

## Services Overview

### 1. API Service
- **Purpose:** REST API endpoints for CV upload
- **Port:** 8090
- **Entry:** `cmd/api/AICoachServiceApplication.java`
- **Features:**
  - File upload to MinIO
  - Publish tasks to RabbitMQ
  - Swagger documentation

### 2. Consumer Service
- **Purpose:** Process CV extraction tasks asynchronously
- **Entry:** `cmd/consumer/CVProcessingConsumerApplication.java`
- **Features:**
  - Listen to RabbitMQ
  - Download from MinIO
  - Extract text
  - Scalable (multiple instances)

### 3. Infrastructure Services
- **PostgreSQL** - Database
- **RabbitMQ** - Message Queue
- **MinIO** - Object Storage
- **PgAdmin** - Database UI
- **RabbitMQ Management** - Queue UI

## Setup Instructions

### Step 1: Update .env file

Add RabbitMQ credentials to `.env`:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=co3065

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123

# RabbitMQ (ADD THESE)
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=rabbitmq123

# PgAdmin
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin123
```

### Step 2: Build & Start Services

#### Development Mode (Single Container)
```bash
# Start all services with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

#### Production Mode (Separate Containers)
```bash
# Build and start all services
docker-compose up -d --build

# Scale consumers
docker-compose up -d --scale consumer-service=3

# View logs
docker-compose logs -f api-service
docker-compose logs -f consumer-service
```

### Step 3: Verify Services

```bash
# Check all services are running
docker-compose ps

# Expected output:
# co3065-api-service       Running   0.0.0.0:8090->8090/tcp
# co3065-consumer-service  Running
# co3065-rabbitmq          Running   0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
# co3065-postgres          Running   0.0.0.0:5432->5432/tcp
# co3065-minio             Running   0.0.0.0:9000-9001->9000-9001/tcp
# co3065-pgadmin           Running   0.0.0.0:5050->80/tcp
```

### Step 4: Access Management UIs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Swagger UI** | http://localhost:8090/swagger-ui.html | - |
| **RabbitMQ Management** | http://localhost:15672 | admin / rabbitmq123 |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |
| **PgAdmin** | http://localhost:5050 | admin@example.com / admin123 |

## Testing the Flow

### 1. Upload CV (API Service)

```bash
curl -X POST http://localhost:8090/api/cv/upload \
  -F "file=@sample.pdf"
```

Response:
```json
{
  "error_code": 0,
  "message": "File uploaded successfully",
  "data": {
    "file_id": "550e8400-e29b-41d4-a716-446655440000",
    "original_file_name": "sample.pdf",
    "content_type": "application/pdf",
    "file_size": 123456,
    "uploaded_at": "2025-10-30T15:00:00"
  }
}
```

### 2. Check RabbitMQ

1. Open: http://localhost:15672
2. Login: admin / rabbitmq123
3. Go to **Queues** tab
4. Click `cv.extraction.queue`
5. Should see 1 message (or 0 if already processed)

### 3. Check Consumer Logs

```bash
docker-compose logs -f consumer-service
```

Expected output:
```
Received CV extraction task: taskId=xxx, fileId=550e8400...
Downloading file from storage: fileId=550e8400...
Extracting text from file: fileName=sample.pdf, fileType=PDF
CV extraction completed successfully: taskId=xxx, textLength=1234
```

## Environment Variables

### API Service

```bash
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/co3065
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres123
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=cv-files
SPRING_RABBITMQ_HOST=rabbitmq
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=admin
SPRING_RABBITMQ_PASSWORD=rabbitmq123
```

### Consumer Service

Same as API Service (both need access to database, storage, and queue)

## Scaling

### Scale Consumers Horizontally

```bash
# Scale to 5 consumer instances
docker-compose up -d --scale consumer-service=5

# Verify
docker-compose ps
```

### Scale Consumers Vertically

Edit `docker-compose.yml`:
```yaml
consumer-service:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-service
docker-compose logs -f consumer-service
docker-compose logs -f rabbitmq
```

### Monitor RabbitMQ

1. Open: http://localhost:15672
2. **Queues** tab:
   - Queue length
   - Message rates
   - Consumer count
3. **Connections** tab:
   - Active connections
   - Channel details

### Monitor MinIO

1. Open: http://localhost:9001
2. Login: minioadmin / minioadmin123
3. Check `cv-files` bucket
4. View uploaded files

## Troubleshooting

### API Service not starting

```bash
# Check logs
docker-compose logs api-service

# Common issues:
# 1. Port 8090 already in use
# 2. Database connection failed
# 3. RabbitMQ not ready

# Solution: Restart
docker-compose restart api-service
```

### Consumer not processing messages

```bash
# Check consumer logs
docker-compose logs consumer-service

# Check RabbitMQ connection
docker exec co3065-rabbitmq rabbitmq-diagnostics ping

# Check queue has consumers
# Open: http://localhost:15672 → Queues → cv.extraction.queue
# Should show "Consumers: 1" (or more if scaled)
```

### Messages going to DLQ

```bash
# Check DLQ
# Open: http://localhost:15672 → Queues → cv.extraction.dlq

# Common reasons:
# 1. File not found in MinIO
# 2. File extraction failed
# 3. Max retries reached (3)

# Solution: Check consumer logs for error details
docker-compose logs consumer-service | grep ERROR
```

## Stop & Clean Up

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: Deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Development Workflow

### Local Development (Hot Reload)

```bash
# Use dev compose file
docker-compose -f docker-compose.dev.yml up -d

# Code changes auto-reload via volume mount
```

### Build & Test Locally

```bash
# Build
mvn clean compile

# Run tests
mvn test

# Package
mvn package -DskipTests
```

### Run API Service Locally

```bash
# Set environment variables
export SPRING_RABBITMQ_HOST=localhost
export SPRING_RABBITMQ_PORT=5672
export SPRING_RABBITMQ_USERNAME=admin
export SPRING_RABBITMQ_PASSWORD=rabbitmq123

# Run
java -cp target/ai_coach-0.0.1-SNAPSHOT.jar \
  com.aicoach.AICoachServiceApplication
```

### Run Consumer Service Locally

```bash
# Same environment variables
java -cp target/ai_coach-0.0.1-SNAPSHOT.jar \
  com.aicoach.CVProcessingConsumerApplication
```

## CI/CD Considerations

### Build Pipeline

```yaml
# Example GitHub Actions
jobs:
  build:
    steps:
      - name: Build API Service
        run: docker build -f cmd/api/Dockerfile -t api:latest .
      
      - name: Build Consumer Service
        run: docker build -f cmd/consumer/Dockerfile -t consumer:latest .
```

### Deployment

```bash
# Tag images
docker tag api:latest registry.example.com/co3065/api:v1.0
docker tag consumer:latest registry.example.com/co3065/consumer:v1.0

# Push to registry
docker push registry.example.com/co3065/api:v1.0
docker push registry.example.com/co3065/consumer:v1.0

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Performance Tips

1. **Consumer Scaling**
   - Start with 2-3 consumers
   - Monitor queue depth
   - Scale up if queue grows

2. **RabbitMQ Tuning**
   - Set appropriate prefetch count (10-20)
   - Use persistent messages
   - Monitor memory usage

3. **Database Connection Pool**
   - Set max pool size in application.yml
   - Monitor active connections

4. **MinIO Performance**
   - Use CDN for file downloads
   - Set appropriate bucket policies
   - Monitor disk I/O

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong RabbitMQ credentials
- [ ] Enable SSL/TLS for RabbitMQ
- [ ] Restrict MinIO bucket access
- [ ] Use secrets management (Vault, AWS Secrets Manager)
- [ ] Enable firewall rules
- [ ] Regular security updates

## Next Steps

1. ✅ RabbitMQ integration complete
2. ✅ Multiple entry points (API + Consumer)
3. ✅ Docker setup complete
4. ⏳ Add result persistence (database)
5. ⏳ Add WebSocket for real-time updates
6. ⏳ Implement monitoring (Prometheus + Grafana)
7. ⏳ Add Gemini AI integration (PoC 2)

## Support

- **Architecture:** See `docs/ARCHITECTURE.md`
- **RabbitMQ Details:** See `docs/RABBITMQ-ARCHITECTURE.md`
- **API Docs:** See `docs/SWAGGER-API-DOCS.md`
- **Core Flow:** See `docs/CORE-FLOW.md`

