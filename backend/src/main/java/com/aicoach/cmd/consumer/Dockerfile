# Multi-stage build for CV Processing Consumer
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -Dspring.main.allow-bean-definition-overriding=true

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /build/target/*.jar app.jar

# Health check (check if JVM is running)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
CMD pgrep java || exit 1

# Run Consumer service
ENTRYPOINT ["java", "-cp", "app.jar", "com.aicoach.cmd.consumer.CVProcessingConsumerApplication"]

