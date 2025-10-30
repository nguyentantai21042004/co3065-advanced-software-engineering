package com.aicoach.cmd.consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * CV Processing Consumer - Main Entry Point
 * 
 * Responsibilities:
 * - Listen to RabbitMQ messages
 * - Process CV extraction tasks asynchronously
 * - Download files from MinIO
 * - Extract text using PDFBox/Tika
 * - Store results back to MinIO or database
 */
@SpringBootApplication(scanBasePackages = "com.aicoach")
@EnableScheduling
@EnableRabbit
public class CVProcessingConsumerApplication {

    private static final Logger logger = LoggerFactory.getLogger(CVProcessingConsumerApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CVProcessingConsumerApplication.class, args);
        logger.info("🎧 CV Processing Consumer started successfully!");
        logger.info("📬 Listening to RabbitMQ for CV processing tasks...");

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.info("👋 CV Processing Consumer exited.");
        }));
    }
}
