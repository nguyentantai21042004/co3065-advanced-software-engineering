package com.aicoach.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

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

    // Notify queue for extraction result
    public static final String EXTRACTION_NOTIFY_QUEUE = "extraction.notify.queue";
    public static final String EXTRACTION_NOTIFY_EXCHANGE = "extraction.notify.exchange";
    public static final String EXTRACTION_NOTIFY_ROUTING_KEY = "extraction.notify";

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

    @Bean
    public DirectExchange extractionNotifyExchange() {
        return new DirectExchange(EXTRACTION_NOTIFY_EXCHANGE, true, false);
    }

    @Bean
    public Queue extractionNotifyQueue() {
        return QueueBuilder.durable(EXTRACTION_NOTIFY_QUEUE).build();
    }

    @Bean
    public Binding extractionNotifyBinding(Queue extractionNotifyQueue, DirectExchange extractionNotifyExchange) {
        return BindingBuilder.bind(extractionNotifyQueue)
                .to(extractionNotifyExchange)
                .with(EXTRACTION_NOTIFY_ROUTING_KEY);
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

    /**
     * Container Factory with JSON converter for listeners
     * ONLY active in consumer profile to prevent API from listening to queues
     */
    @Bean
    @Profile("consumer")
    public org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory factory =
            new org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        return factory;
    }
}
