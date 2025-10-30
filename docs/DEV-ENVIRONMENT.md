# Development Environment Setup

## 🚀 Quick Start

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f java-maven-dev

# Stop environment
docker-compose -f docker-compose.dev.yml down
```

## 📋 Services

### Application Service
- **Container:** `co3065-dev`
- **Port:** 8090
- **Main Class:** `com.aicoach.cmd.api.AICoachServiceApplication`
- **Hot Reload:** ✅ Enabled (volume mount)

### Infrastructure Services

| Service | Container | Ports | UI/Management |
|---------|-----------|-------|---------------|
| **PostgreSQL** | co3065-postgres-dev | 5432 | PgAdmin: http://localhost:5050 |
| **RabbitMQ** | co3065-rabbitmq-dev | 5672, 15672 | Management: http://localhost:15672 |
| **MinIO** | co3065-minio-dev | 9000, 9001 | Console: http://localhost:9001 |
| **PgAdmin** | co3065-pgadmin-dev | 5050 | UI: http://localhost:5050 |

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=co3065

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123

# RabbitMQ
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=rabbitmq123

# PgAdmin
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin123
```

## 🔥 Hot Reload Development

The development environment supports hot reload:

1. **Edit source code** in `src/main/java/com/aicoach/`
2. **Spring Boot DevTools** auto-detects changes
3. **Application restarts** automatically

Example workflow:
```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up -d

# Watch logs
docker-compose -f docker-compose.dev.yml logs -f java-maven-dev

# Edit files in your IDE
# Changes are automatically detected and reloaded
```

## 📊 Access Management UIs

### Swagger API Documentation
```
http://localhost:8090/swagger-ui.html
```

### RabbitMQ Management
```
http://localhost:15672
Username: admin
Password: rabbitmq123
```

### MinIO Console
```
http://localhost:9001
Username: minioadmin
Password: minioadmin123
```

### PgAdmin
```
http://localhost:5050
Email: admin@example.com
Password: admin123
```

## 🧪 Testing in Dev Environment

### Test API Endpoints

```bash
# Health check
curl http://localhost:8090/actuator/health

# Upload CV
curl -X POST http://localhost:8090/api/cv/upload \
  -F "file=@test.pdf"

# Get supported types
curl http://localhost:8090/api/cv/supported-types
```

### View RabbitMQ Queues

1. Open http://localhost:15672
2. Login with admin/rabbitmq123
3. Go to **Queues** tab
4. Check `cv.extraction.queue`

### View MinIO Files

1. Open http://localhost:9001
2. Login with minioadmin/minioadmin123
3. Browse `cv-files` bucket

## 🐛 Debugging

### View Application Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Only Java application
docker-compose -f docker-compose.dev.yml logs -f java-maven-dev

# Only RabbitMQ
docker-compose -f docker-compose.dev.yml logs -f rabbitmq
```

### Connect to Container

```bash
# Access Java container
docker exec -it co3065-dev bash

# Check Java version
docker exec co3065-dev java -version

# Check Maven version
docker exec co3065-dev mvn -version
```

### Database Connection

```bash
# Connect to PostgreSQL
docker exec -it co3065-postgres-dev psql -U postgres -d co3065

# List tables
\dt

# Exit
\q
```

## 🔄 Reset Environment

```bash
# Stop and remove all containers + volumes
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
docker-compose -f docker-compose.dev.yml up -d
```

## 📦 Package Structure

```
src/main/java/com/aicoach/
├── cmd/                    # Entry points
│   ├── api/               # API Service entry
│   └── consumer/          # Consumer Service entry
├── adapter/               # HTTP Controllers
├── config/                # Configuration
├── messaging/             # RabbitMQ Producers/Consumers
├── models/                # Domain Models
├── repository/            # Data Access
└── usecase/               # Business Logic
```

## 🚨 Common Issues

### Port Already in Use

```bash
# Check what's using port 8090
lsof -i :8090

# Kill process
kill -9 <PID>
```

### RabbitMQ Not Starting

```bash
# Check RabbitMQ logs
docker logs co3065-rabbitmq-dev

# Restart RabbitMQ
docker-compose -f docker-compose.dev.yml restart rabbitmq
```

### Hot Reload Not Working

1. Check volume mount is correct
2. Ensure Spring DevTools is in pom.xml
3. Restart container:
   ```bash
   docker-compose -f docker-compose.dev.yml restart java-maven-dev
   ```

## 💡 Development Tips

1. **Use Swagger UI** for API testing instead of curl
2. **Monitor RabbitMQ** to see message flow
3. **Check MinIO** to verify file uploads
4. **Use PgAdmin** for database queries
5. **Watch logs** to debug issues quickly

## 🎯 Next Steps

1. Start dev environment
2. Access Swagger UI
3. Test file upload
4. Check RabbitMQ queue
5. Verify file in MinIO
6. Monitor logs

Happy coding! 🚀

