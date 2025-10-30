package com.aicoach.cmd.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

/**
 * AI Coach API Service - Main Entry Point
 * 
 * Responsibilities:
 * - Expose REST APIs for CV processing
 * - Handle file uploads to MinIO
 * - Publish messages to RabbitMQ for async processing
 * - Provide Swagger/OpenAPI documentation
 * 
 * NOTE: Excludes CVExtractionConsumer from scanning - it should only run in Consumer app
 */
@SpringBootApplication
@ComponentScan(
    basePackages = "com.aicoach",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = com.aicoach.messaging.CVExtractionConsumer.class
    )
)
@EnableJpaRepositories(basePackages = "com.aicoach.repository.postgresql")
@EntityScan(basePackages = { "com.aicoach.repository.postgresql.entity" })
public class AICoachServiceApplication {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AICoachServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AICoachServiceApplication.class, args);
        logger.info("🚀 AI Coach API Service started successfully!");
        logger.info("📚 Swagger UI: http://localhost:8090/swagger-ui.html");
        logger.info("📄 API Docs: http://localhost:8090/api-docs");
    }
}
