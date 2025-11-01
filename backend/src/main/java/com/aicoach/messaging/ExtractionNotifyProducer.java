package com.aicoach.messaging;

import com.aicoach.config.RabbitMQConfig;
import com.aicoach.models.ExtractionNotifyMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExtractionNotifyProducer {
    private final RabbitTemplate rabbitTemplate;
    public void sendNotify(ExtractionNotifyMessage message) {
        log.info("Sending notify with extraction resultId={}", message.getResultId());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EXTRACTION_NOTIFY_EXCHANGE,
            RabbitMQConfig.EXTRACTION_NOTIFY_ROUTING_KEY,
            message
        );
    }
}
