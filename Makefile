.PHONY: help dev-up dev-down dev-logs dev-restart dev-exec dev-shell dev-ps \
        prod-up prod-down prod-logs prod-exec api-logs consumer-logs \
        rabbitmq-ui minio-ui swagger-ui postgres-connect \
        run-api run-consumer run-tests clean build \
        up down logs restart test

# Default target
help:
	@echo "======================================"
	@echo "  AI Coach - Makefile Commands"
	@echo "======================================"
	@echo ""
	@echo "Development Environment:"
	@echo "  make dev-up          - Start development environment"
	@echo "  make dev-down        - Stop development environment"
	@echo "  make dev-logs        - View all development logs"
	@echo "  make dev-restart     - Restart development environment"
	@echo "  make dev-exec        - Access development container shell"
	@echo "  make dev-ps          - View development containers status"
	@echo ""
	@echo "Run Services Locally:"
	@echo "  make run-api         - Run API service locally"
	@echo "  make run-consumer    - Run Consumer service locally"
	@echo "  make run-tests       - Run all tests"
	@echo ""
	@echo "View Logs:"
	@echo "  make api-logs        - View API service logs"
	@echo "  make consumer-logs   - View Consumer service logs"
	@echo ""
	@echo "Access UIs:"
	@echo "  make swagger-ui      - Open Swagger API docs"
	@echo "  make rabbitmq-ui     - Open RabbitMQ Management"
	@echo "  make minio-ui        - Open MinIO Console"
	@echo "  make pgadmin-ui      - Open PgAdmin"
	@echo ""
	@echo "Database:"
	@echo "  make postgres-connect - Connect to PostgreSQL"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make build           - Build project"
	@echo "  make kill-port-8090  - Kill process on port 8090"
	@echo "  make kill-all-ports  - Kill all Java processes and port 8090"
	@echo ""

# ==========================================
# Development Environment
# ==========================================

dev-up:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started!"
	@echo ""
	@echo "📚 Access points:"
	@echo "  - API: http://localhost:8090"
	@echo "  - Swagger: http://localhost:8090/swagger-ui.html"
	@echo "  - RabbitMQ: http://localhost:15672 (admin/rabbitmq123)"
	@echo "  - MinIO: http://localhost:9001 (minioadmin/minioadmin123)"
	@echo ""

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ Development environment stopped!"

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-restart:
	@echo "🔄 Restarting development environment..."
	docker-compose -f docker-compose.dev.yml restart
	@echo "✅ Development environment restarted!"

dev-exec:
	@echo "🔧 Accessing development container..."
	@if ! docker inspect -f '{{.State.Running}}' co3065-dev 2>/dev/null | grep -q true; then \
		echo "Error: co3065-dev container is not running. Please start it with 'make dev-up'."; \
		exit 1; \
	fi
	@docker exec -it co3065-dev bash || docker exec -it co3065-dev sh

dev-shell: dev-exec

dev-ps:
	docker-compose -f docker-compose.dev.yml ps

# ==========================================
# Run Services inside Dev Container
# ==========================================

run-api:
	@echo "🚀 Running API Service in dev container..."
	mvn spring-boot:run -Dspring-boot.run.main-class=com.aicoach.cmd.api.AICoachServiceApplication

run-consumer:
	@echo "🎧 Running Consumer Service in dev container..."
	mvn spring-boot:run -Dspring-boot.run.main-class=com.aicoach.cmd.consumer.CVProcessingConsumerApplication -Dspring-boot.run.profiles=consumer

run-tests:
	@echo "🧪 Running tests..."
	mvn test"

# ==========================================
# View Logs
# ==========================================

api-logs:
	@echo "📋 Viewing API service logs..."
	docker-compose -f docker-compose.dev.yml logs -f java-maven-dev

consumer-logs:
	@echo "📋 Viewing Consumer service logs..."
	docker-compose -f docker-compose.dev.yml logs -f java-maven-dev

# ==========================================
# Access UIs
# ==========================================

swagger-ui:
	@echo "📚 Opening Swagger UI..."
	open http://localhost:8090/swagger-ui.html

rabbitmq-ui:
	@echo "📬 Opening RabbitMQ Management..."
	@echo "Username: admin"
	@echo "Password: rabbitmq123"
	open http://localhost:15672

minio-ui:
	@echo "📦 Opening MinIO Console..."
	@echo "Username: minioadmin"
	@echo "Password: minioadmin123"
	open http://localhost:9001

pgadmin-ui:
	@echo "🗄️  Opening PgAdmin..."
	@echo "Email: admin@example.com"
	@echo "Password: admin123"
	open http://localhost:5050
