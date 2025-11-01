# RabbitMQ Event-Driven Architecture

## Tổng quan

Hệ thống sử dụng **RabbitMQ** làm message broker để xử lý CV extraction một cách bất đồng bộ (asynchronous).

## Kiến trúc

```
┌─────────────┐         ┌──────────────┐         ┌───────────────┐
│             │         │              │         │               │
│  API        │ Publish │  RabbitMQ    │ Consume │  Consumer     │
│  Service    ├────────►│  Queue       ├────────►│  Service      │
│             │         │              │         │               │
└─────────────┘         └──────────────┘         └───────────────┘
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌─────────────┐                                  ┌───────────────┐
│   MinIO     │                                  │  File         │
│   Storage   │◄─────────────────────────────────┤  Extraction   │
└─────────────┘                                  └───────────────┘
```

## Components

### 1. API Service (`cmd/api`)
- **Responsibilities:**
  - Handle REST API requests
  - Upload files to MinIO
  - Publish extraction tasks to RabbitMQ
  - Return file ID to client

- **Entry Point:** `AICoachServiceApplication.java`
- **Port:** 8090
- **Endpoints:**
  - `POST /api/cv/upload` - Upload CV and publish extraction task
  - `POST /api/cv/extract/{fileId}` - Trigger extraction (legacy, sync)
  - `GET /api/cv/supported-types` - Get supported file types

### 2. Consumer Service (`cmd/consumer`)
- **Responsibilities:**
  - Listen to RabbitMQ queues
  - Download files from MinIO
  - Extract text using PDFBox/Tika
  - Store results (database or another queue)

- **Entry Point:** `CVProcessingConsumerApplication.java`
- **Scaling:** Can run multiple instances for horizontal scaling

### 3. RabbitMQ
- **Version:** 3.12 (with Management UI)
- **Ports:**
  - 5672 - AMQP protocol
  - 15672 - Management UI
- **Credentials:** Set in `.env` file

## Queue Configuration

### Main Queue
- **Name:** `cv.extraction.queue`
- **Type:** Durable
- **TTL:** 5 minutes
- **Features:**
  - Dead Letter Queue (DLQ) support
  - Message persistence
  - Priority support

### Dead Letter Queue (DLQ)
- **Name:** `cv.extraction.dlq`
- **Purpose:** Store failed messages after max retries
- **Use Case:** Manual investigation and reprocessing

### Exchange & Routing
- **Exchange:** `cv.exchange` (Direct)
- **Routing Key:** `cv.extraction`
- **DLX:** `cv.dlx` (Dead Letter Exchange)
- **DLQ Routing Key:** `cv.extraction.dlq`

## Message Flow

### 1. Upload & Publish Flow

```java
// Client uploads CV to API
POST /api/cv/upload
↓
// API Service:
1. Validate file (type, size)
2. Upload to MinIO → Get file_id
3. Create CVExtractionMessage
4. Publish to RabbitMQ queue
5. Return file_id to client
```

### 2. Consumer Processing Flow

```java
// Consumer Service listens to queue
Consumer receives message
↓
1. Download file from MinIO using file_id
2. Determine file type (PDF/DOCX/DOC)
3. Extract text using appropriate extractor
4. Log results
5. Store results (database/another queue)
6. Acknowledge message
```

### 3. Error Handling Flow

```
Message processing fails
↓
Retry #1 → Failed
↓
Retry #2 → Failed
↓
Retry #3 → Failed
↓
Max retries reached
↓
Send to Dead Letter Queue (DLQ)
↓
Alert ops team
```

## Message Model

```java
public class CVExtractionMessage {
    private String taskId;           // Unique task ID
    private String fileId;           // MinIO file ID
    private String fileName;         // Original filename
    private String fileType;         // PDF, DOCX, DOC
    private long fileSize;           // File size in bytes
    private LocalDateTime createdAt; // Timestamp
    private String userId;           // Optional user ID
    private int retryCount;          // Retry attempts
}
```

## Configuration

### Application.yml

```yaml
spring:
  rabbitmq:
    host: ${SPRING_RABBITMQ_HOST:localhost}
    port: ${SPRING_RABBITMQ_PORT:5672}
    username: ${SPRING_RABBITMQ_USERNAME:guest}
    password: ${SPRING_RABBITMQ_PASSWORD:guest}
    listener:
      simple:
        acknowledge-mode: auto
        concurrency: 3
        max-concurrency: 10
        prefetch: 10
```

### Environment Variables

```bash
SPRING_RABBITMQ_HOST=rabbitmq
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=admin
SPRING_RABBITMQ_PASSWORD=secret123
```

## Docker Services

### Development (`docker-compose.dev.yml`)
- Single container with hot reload
- Runs both API and consumer in same JVM
- For development and testing

### Production (`docker-compose.yml`)
- Separate containers for API and Consumer
- Independent scaling
- Better fault isolation
- Consumer can have multiple replicas

```yaml
services:
  api-service:
    build:
      dockerfile: cmd/api/Dockerfile
    replicas: 1
    
  consumer-service:
    build:
      dockerfile: cmd/consumer/Dockerfile
    replicas: 2  # Scale consumers
```

## Monitoring

### RabbitMQ Management UI
```
http://localhost:15672
Username: admin (from .env)
Password: secret123 (from .env)
```

**Features:**
- Monitor queue depth
- View message rates
- Check consumer status
- Manual message management

### Key Metrics to Monitor
1. **Queue Length** - Should stay low
2. **Message Rate** - Messages/second
3. **Consumer Count** - Number of active consumers
4. **DLQ Messages** - Failed messages count

## Scaling Strategy

### Horizontal Scaling
```bash
# Scale consumers to handle more load
docker-compose up -d --scale consumer-service=5
```

### Vertical Scaling
```yaml
consumer-service:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
```

## Error Handling

### Retry Strategy
- **Max Retries:** 3
- **Delay:** Handled by RabbitMQ
- **After Max Retries:** Message sent to DLQ

### Error Types
1. **Transient Errors** (network, timeout) → Retry
2. **Permanent Errors** (invalid file, corrupt) → DLQ
3. **Fatal Errors** (out of memory) → Alert and restart

## Best Practices

1. **Message Idempotency**
   - Design consumers to handle duplicate messages
   - Use task_id to detect duplicates

2. **Graceful Shutdown**
   - Allow consumers to finish processing
   - Acknowledge messages only after successful processing

3. **Monitoring & Alerting**
   - Set up alerts for DLQ messages
   - Monitor queue depth
   - Track processing time

4. **Resource Management**
   - Set appropriate prefetch count
   - Limit concurrent consumers
   - Use connection pooling

## Testing

### Manual Test

1. **Start services:**
```bash
docker-compose up -d
```

2. **Upload CV:**
```bash
curl -X POST http://localhost:8090/api/cv/upload \
  -F "file=@sample.pdf"
```

3. **Check RabbitMQ UI:**
```
http://localhost:15672
→ Queues → cv.extraction.queue
→ Should see 1 message processed
```

4. **Check Consumer logs:**
```bash
docker logs co3065-consumer-service
```

## Troubleshooting

### Consumer not processing messages
```bash
# Check consumer is running
docker ps | grep consumer

# Check consumer logs
docker logs co3065-consumer-service

# Check RabbitMQ connection
docker exec co3065-rabbitmq rabbitmq-diagnostics ping
```

### Messages stuck in queue
```bash
# Check consumer health
curl http://localhost:8090/actuator/health

# Restart consumer
docker-compose restart consumer-service
```

### DLQ has messages
```bash
# Access RabbitMQ UI
http://localhost:15672

# Manually requeue or delete messages
# Or implement DLQ processing logic
```

## Future Enhancements

1. **Priority Queue** - High-priority users get faster processing
2. **Result Notification** - Send results via WebSocket or SSE
3. **Batch Processing** - Process multiple CVs at once
4. **Analytics** - Track processing metrics and success rates
5. **Dead Letter Handler** - Auto-retry or manual intervention for DLQ

## References

- [Spring AMQP Documentation](https://docs.spring.io/spring-amqp/reference/)
- [RabbitMQ Best Practices](https://www.rabbitmq.com/best-practices.html)
- [Clean Architecture with Event-Driven](https://herbertograca.com/2017/10/05/event-driven-architecture/)

