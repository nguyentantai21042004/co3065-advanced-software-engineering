package com.aicoach.infrastructure.llm;

import com.aicoach.config.GeminiConfig;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Google Gemini API Client Implementation
 * Supports multiple API keys with rotation/failover strategies
 */
@Component
@Slf4j
public class GoogleGeminiClient implements GeminiClient {

    private final GeminiConfig config;
    private final RestTemplate restTemplate;
    private final PromptTemplateService promptTemplateService;
    private final AtomicInteger roundRobinIndex = new AtomicInteger(0);

    public GoogleGeminiClient(GeminiConfig config, RestTemplateBuilder restTemplateBuilder,
                              PromptTemplateService promptTemplateService) {
        this.config = config;
        this.promptTemplateService = promptTemplateService;
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(config.getTimeoutMs());
        factory.setReadTimeout(config.getTimeoutMs());
        
        this.restTemplate = restTemplateBuilder
                .requestFactory(() -> factory)
                .build();

        validateConfig();
    }

    private void validateConfig() {
        if (config.getApiKeys() == null || config.getApiKeys().isEmpty()) {
            throw new IllegalArgumentException("Gemini API keys are required. Please configure gemini.api-keys in application.yml");
        }
        log.info("Initialized GoogleGeminiClient with {} API key(s), strategy: {}", 
                config.getApiKeys().size(), config.getKeyStrategy());
    }

    @Override
    public String generateText(String prompt) throws Exception {
        return generateText(prompt, config.getDefaultTemperature(), config.getDefaultMaxTokens());
    }

    @Override
    public String generateText(String prompt, Double temperature, Integer maxTokens) throws Exception {
        String apiKey = selectApiKey();
        String url = buildApiUrl(apiKey);

        GeminiRequest request = new GeminiRequest();
        request.setContents(List.of(
                new Content(new Part(prompt))
        ));
        GenerationConfig genConfig = new GenerationConfig();
        genConfig.setTemperature(temperature);
        genConfig.setMaxOutputTokens(maxTokens);
        request.setGenerationConfig(genConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<GeminiRequest> httpEntity = new HttpEntity<>(request, headers);

        int retryCount = 0;
        Exception lastException = null;

        while (retryCount <= config.getRetry().getMaxRetries()) {
            try {
                log.info("Calling Gemini API with key #{} (attempt {}/{})", 
                        getCurrentKeyIndex(), retryCount + 1, config.getRetry().getMaxRetries() + 1);

                ResponseEntity<GeminiResponse> response = restTemplate.exchange(
                        url, HttpMethod.POST, httpEntity, GeminiResponse.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    GeminiResponse body = response.getBody();
                    if (body.getCandidates() != null && !body.getCandidates().isEmpty()) {
                        Candidate candidate = body.getCandidates().get(0);
                        if (candidate.getContent() != null && candidate.getContent().getParts() != null 
                                && !candidate.getContent().getParts().isEmpty()) {
                            String generatedText = candidate.getContent().getParts().get(0).getText();
                            log.info("Gemini API call successful, response length: {}", generatedText.length());
                            return generatedText;
                        }
                    }
                    log.warn("Gemini API returned empty response");
                    throw new RuntimeException("Empty response from Gemini API");
                } else {
                    throw new RuntimeException("Unexpected response status: " + response.getStatusCode());
                }

            } catch (RestClientException e) {
                lastException = e;
                log.warn("Gemini API call failed (attempt {}/{}): {}", 
                        retryCount + 1, config.getRetry().getMaxRetries() + 1, e.getMessage());

                // Check if it's a quota/rate limit error - try next key
                if (isQuotaOrAuthError(e)) {
                    apiKey = selectNextApiKey(apiKey);
                    url = buildApiUrl(apiKey);
                    log.info("Switching to next API key due to quota/auth error");
                }

                if (retryCount < config.getRetry().getMaxRetries()) {
                    long delay = calculateRetryDelay(retryCount);
                    Thread.sleep(delay);
                }
                retryCount++;
            }
        }

        throw new RuntimeException("Failed to call Gemini API after " + (retryCount) + " attempts", lastException);
    }

    @Override
    public String generateWithTemplate(String templateName, Map<String, Object> templateData, String actualData) throws Exception {
        return generateWithTemplate(templateName, templateData, actualData, 
                config.getDefaultTemperature(), config.getDefaultMaxTokens());
    }

    @Override
    public String generateWithTemplate(String templateName, Map<String, Object> templateData, 
                                       String actualData, Double temperature, Integer maxTokens) throws Exception {
        // Build final prompt by combining template and data
        String finalPrompt = promptTemplateService.buildPrompt(templateName, templateData, actualData);
        log.info("Generated prompt from template: {} (length: {})", templateName, finalPrompt.length());
        
        // Call API with final prompt
        return generateText(finalPrompt, temperature, maxTokens);
    }

    private String selectApiKey() {
        List<String> keys = config.getApiKeys();
        if (keys == null || keys.isEmpty()) {
            throw new IllegalStateException("No Gemini API keys configured");
        }

        switch (config.getKeyStrategy()) {
            case ROUND_ROBIN:
                int index = roundRobinIndex.getAndIncrement() % keys.size();
                return keys.get(index);
            case RANDOM:
                int randomIndex = (int) (Math.random() * keys.size());
                return keys.get(randomIndex);
            case FAILOVER:
            default:
                return keys.get(0);
        }
    }

    private String selectNextApiKey(String currentKey) {
        List<String> keys = config.getApiKeys();
        int currentIndex = keys.indexOf(currentKey);
        if (currentIndex == -1 || currentIndex >= keys.size() - 1) {
            return keys.get(0); // Wrap around
        }
        return keys.get(currentIndex + 1);
    }

    private int getCurrentKeyIndex() {
        List<String> keys = config.getApiKeys();
        int index = roundRobinIndex.get() % keys.size();
        return index + 1; // 1-based for logging
    }

    private String buildApiUrl(String apiKey) {
        return String.format("%s/%s:generateContent?key=%s",
                config.getEndpoint(), config.getDefaultModel(), apiKey);
    }

    private boolean isQuotaOrAuthError(Exception e) {
        String message = e.getMessage().toLowerCase();
        return message.contains("quota") || message.contains("403") 
                || message.contains("401") || message.contains("429")
                || message.contains("unauthorized") || message.contains("forbidden");
    }

    private long calculateRetryDelay(int retryCount) {
        long delay = config.getRetry().getInitialDelayMs() * (1L << retryCount);
        return Math.min(delay, config.getRetry().getMaxDelayMs());
    }

    // Request/Response DTOs
    @Data
    static class GeminiRequest {
        private List<Content> contents;
        private GenerationConfig generationConfig;
    }

    @Data
    static class Content {
        private List<Part> parts;

        Content(Part part) {
            this.parts = List.of(part);
        }
    }

    @Data
    static class Part {
        private String text;

        Part(String text) {
            this.text = text;
        }
    }

    @Data
    static class GenerationConfig {
        @JsonProperty("temperature")
        private Double temperature;

        @JsonProperty("maxOutputTokens")
        private Integer maxOutputTokens;
    }

    @Data
    static class GeminiResponse {
        private List<Candidate> candidates;
    }

    @Data
    static class Candidate {
        private Content content;
    }
}
