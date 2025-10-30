package com.aicoach.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.aicoach.config.RabbitMQConfig;
import com.aicoach.models.CVExtractionMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Message Producer for CV Extraction
 * 
 * Used by API Service to publish CV extraction tasks to RabbitMQ
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CVExtractionProducer {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Send CV extraction message to queue
     * 
     * @param message CV extraction message
     */
    public void sendExtractionTask(CVExtractionMessage message) {
        try {
            log.info("Sending CV extraction task to queue: taskId={}, fileId={}",
                    message.getTaskId(), message.getFileId());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.CV_EXCHANGE,
                    RabbitMQConfig.CV_EXTRACTION_ROUTING_KEY,
                    message);

            log.info("CV extraction task sent successfully: taskId={}", message.getTaskId());

        } catch (Exception e) {
            log.error("Failed to send CV extraction task: taskId={}, error={}",
                    message.getTaskId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send message to queue", e);
        }
    }

    /**
     * Send CV extraction message with custom properties
     */
    public void sendExtractionTaskWithPriority(CVExtractionMessage message, int priority) {
        try {
            log.info("Sending high-priority CV extraction task: taskId={}, priority={}",
                    message.getTaskId(), priority);

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.CV_EXCHANGE,
                    RabbitMQConfig.CV_EXTRACTION_ROUTING_KEY,
                    message,
                    messagePostProcessor -> {
                        messagePostProcessor.getMessageProperties().setPriority(priority);
                        return messagePostProcessor;
                    });

            log.info("High-priority CV extraction task sent: taskId={}", message.getTaskId());

        } catch (Exception e) {
            log.error("Failed to send high-priority CV extraction task: taskId={}",
                    message.getTaskId(), e);
            throw new RuntimeException("Failed to send message to queue", e);
        }
    }
}
