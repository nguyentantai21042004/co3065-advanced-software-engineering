package com.aicoach.infrastructure.llm;

import java.util.Map;

/**
 * Interface for Google Gemini LLM Client
 * Handles API calls to Google Gemini and returns responses
 */
public interface GeminiClient {

    /**
     * Generate text completion using Gemini API
     *
     * @param prompt The input prompt/text
     * @return Generated text response
     * @throws Exception If API call fails
     */
    String generateText(String prompt) throws Exception;

    /**
     * Generate text completion with custom parameters
     *
     * @param prompt The input prompt/text
     * @param temperature Temperature parameter (0.0-1.0)
     * @param maxTokens Maximum tokens to generate
     * @return Generated text response
     * @throws Exception If API call fails
     */
    String generateText(String prompt, Double temperature, Integer maxTokens) throws Exception;

    /**
     * Generate text using prompt template and data
     * Combines system prompt template with actual data
     *
     * @param templateName Name of prompt template (without .md extension)
     * @param templateData Variables for template rendering
     * @param actualData Actual data content to process
     * @return Generated text response
     * @throws Exception If API call fails or template not found
     */
    String generateWithTemplate(String templateName, Map<String, Object> templateData, String actualData) throws Exception;

    /**
     * Generate text using prompt template and data with custom parameters
     *
     * @param templateName Name of prompt template
     * @param templateData Variables for template rendering
     * @param actualData Actual data content to process
     * @param temperature Temperature parameter (0.0-1.0)
     * @param maxTokens Maximum tokens to generate
     * @return Generated text response
     * @throws Exception If API call fails or template not found
     */
    String generateWithTemplate(String templateName, Map<String, Object> templateData, 
                                String actualData, Double temperature, Integer maxTokens) throws Exception;
}
