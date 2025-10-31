package com.aicoach.messaging;

import com.aicoach.config.RabbitMQConfig;
import com.aicoach.models.CVAnalysisMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/**
 * Message Producer for CV Analysis
 * Publishes CV analysis tasks to RabbitMQ after extraction is completed
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CVAnalysisProducer {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Send CV analysis message to queue
     *
     * @param message CV analysis message
     */
    public void sendAnalysisTask(CVAnalysisMessage message) {
        try {
            log.info("Sending CV analysis task to queue: taskId={}, extractionResultId={}, fileId={}",
                    message.getTaskId(), message.getExtractionResultId(), message.getFileId());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.CV_ANALYSIS_EXCHANGE,
                    RabbitMQConfig.CV_ANALYSIS_ROUTING_KEY,
                    message);

            log.info("CV analysis task sent successfully: taskId={}", message.getTaskId());

        } catch (Exception e) {
            log.error("Failed to send CV analysis task: taskId={}, error={}",
                    message.getTaskId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send message to queue", e);
        }
    }
}
