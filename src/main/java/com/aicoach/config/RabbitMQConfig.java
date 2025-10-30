package com.aicoach.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ Configuration
 * 
 * Defines:
 * - Exchanges
 * - Queues
 * - Bindings
 * - Message converters
 */
@Configuration
public class RabbitMQConfig {

    // Queue names
    public static final String CV_EXTRACTION_QUEUE = "cv.extraction.queue";
    public static final String CV_EXTRACTION_DLQ = "cv.extraction.dlq"; // Dead Letter Queue

    // Exchange names
    public static final String CV_EXCHANGE = "cv.exchange";
    public static final String CV_DLX = "cv.dlx"; // Dead Letter Exchange

    // Routing keys
    public static final String CV_EXTRACTION_ROUTING_KEY = "cv.extraction";
    public static final String CV_EXTRACTION_DLQ_ROUTING_KEY = "cv.extraction.dlq";

    /**
     * Main Exchange for CV processing
     */
    @Bean
    public DirectExchange cvExchange() {
        return new DirectExchange(CV_EXCHANGE, true, false);
    }

    /**
     * Dead Letter Exchange for failed messages
     */
    @Bean
    public DirectExchange cvDeadLetterExchange() {
        return new DirectExchange(CV_DLX, true, false);
    }

    /**
     * Main Queue for CV extraction with DLQ configuration
     */
    @Bean
    public Queue cvExtractionQueue() {
        return QueueBuilder.durable(CV_EXTRACTION_QUEUE)
                .withArgument("x-dead-letter-exchange", CV_DLX)
                .withArgument("x-dead-letter-routing-key", CV_EXTRACTION_DLQ_ROUTING_KEY)
                .withArgument("x-message-ttl", 300000) // 5 minutes TTL
                .build();
    }

    /**
     * Dead Letter Queue for failed messages
     */
    @Bean
    public Queue cvExtractionDeadLetterQueue() {
        return QueueBuilder.durable(CV_EXTRACTION_DLQ).build();
    }

    /**
     * Binding: CV Extraction Queue → CV Exchange
     */
    @Bean
    public Binding cvExtractionBinding(Queue cvExtractionQueue, DirectExchange cvExchange) {
        return BindingBuilder.bind(cvExtractionQueue)
                .to(cvExchange)
                .with(CV_EXTRACTION_ROUTING_KEY);
    }

    /**
     * Binding: CV Extraction DLQ → DLX
     */
    @Bean
    public Binding cvExtractionDlqBinding(Queue cvExtractionDeadLetterQueue, DirectExchange cvDeadLetterExchange) {
        return BindingBuilder.bind(cvExtractionDeadLetterQueue)
                .to(cvDeadLetterExchange)
                .with(CV_EXTRACTION_DLQ_ROUTING_KEY);
    }

    /**
     * Message Converter - JSON serialization
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * RabbitTemplate with JSON converter
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
