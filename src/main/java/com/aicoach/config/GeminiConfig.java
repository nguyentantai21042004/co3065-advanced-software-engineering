package com.aicoach.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Configuration for Google Gemini API
 * Supports multiple API keys for load balancing and failover
 */
@Configuration
@ConfigurationProperties(prefix = "gemini")
@Data
public class GeminiConfig {

    /**
     * List of Gemini API keys (can be configured as comma-separated string or YAML list)
     * The client will rotate through these keys
     */
    private List<String> apiKeys;

    /**
     * Setter that accepts comma-separated string and converts to list
     */
    public void setApiKeys(Object apiKeys) {
        if (apiKeys == null) {
            this.apiKeys = null;
        } else if (apiKeys instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> list = (List<String>) apiKeys;
            this.apiKeys = list.stream()
                    .filter(key -> key != null && !key.trim().isEmpty())
                    .collect(Collectors.toList());
        } else if (apiKeys instanceof String) {
            String str = (String) apiKeys;
            this.apiKeys = Arrays.stream(str.split(","))
                    .map(String::trim)
                    .filter(key -> !key.isEmpty())
                    .collect(Collectors.toList());
        } else {
            this.apiKeys = List.of(apiKeys.toString());
        }
    }

    /**
     * Gemini API endpoint
     * Recommended: v1 (supports latest models)
     * Legacy: v1beta (may not support newer models)
     */
    private String endpoint = "https://generativelanguage.googleapis.com/v1/models";

    /**
     * Default model to use
     * Recommended options:
     * - gemini-2.5-flash: Fast and cost-effective (default)
     * - gemini-2.5-pro: More powerful, better for complex tasks
     * - gemini-1.5-flash: Alternative fast model
     * - gemini-1.5-pro: Alternative powerful model
     * Legacy: gemini-2.5-flash (deprecated, may not work on v1beta)
     */
    private String defaultModel = "gemini-2.5-flash";

    /**
     * Default temperature (0.0 - 1.0)
     */
    private Double defaultTemperature = 0.7;

    /**
     * Default max tokens
     */
    private Integer defaultMaxTokens = 2048;

    /**
     * Request timeout in milliseconds
     */
    private Integer timeoutMs = 30000;

    /**
     * Strategy for selecting API key: ROUND_ROBIN, RANDOM, FAILOVER
     */
    private ApiKeyStrategy keyStrategy = ApiKeyStrategy.ROUND_ROBIN;

    /**
     * Retry configuration
     */
    private RetryConfig retry = new RetryConfig();

    public enum ApiKeyStrategy {
        ROUND_ROBIN,  // Rotate through keys in order
        RANDOM,       // Randomly select a key
        FAILOVER      // Use first key, fallback to next on failure
    }

    @Data
    public static class RetryConfig {
        /**
         * Maximum number of retries
         */
        private Integer maxRetries = 3;

        /**
         * Initial retry delay in milliseconds
         */
        private Long initialDelayMs = 1000L;

        /**
         * Maximum retry delay in milliseconds
         */
        private Long maxDelayMs = 10000L;
    }
}
