# Multi-stage build for AI Coach API Service
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

# Expose API port
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8090/actuator/health || exit 1

# Run API service
ENTRYPOINT ["java", "-cp", "app.jar", "com.aicoach.cmd.api.AICoachServiceApplication"]

