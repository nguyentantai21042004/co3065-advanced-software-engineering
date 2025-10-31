package com.aicoach.infrastructure.llm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Service to load and render prompt templates
 * Templates are stored in resources/prompts/*.md files
 * Supports variable substitution using {{variableName}} syntax
 */
@Service
@Slf4j
public class PromptTemplateService {

    private final ResourceLoader resourceLoader;
    private static final String PROMPTS_DIR = "classpath:prompts/";

    public PromptTemplateService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Load prompt template from file
     *
     * @param templateName Template file name (e.g., "cv-analysis" loads "cv-analysis.md")
     * @return Prompt template content
     * @throws IOException If template file not found or cannot be read
     */
    public String loadTemplate(String templateName) throws IOException {
        String templatePath = PROMPTS_DIR + templateName + ".md";
        Resource resource = resourceLoader.getResource(templatePath);

        if (!resource.exists()) {
            log.error("Prompt template not found: {}", templatePath);
            throw new IOException("Prompt template not found: " + templatePath);
        }

        try (InputStream inputStream = resource.getInputStream()) {
            String content = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
            log.info("Loaded prompt template: {} ({} bytes)", templateName, content.length());
            return content;
        }
    }

    /**
     * Render prompt template with data variables
     * Replaces {{variableName}} with values from data map
     *
     * @param templateName Template file name
     * @param data Map of variable names to values
     * @return Rendered prompt string
     * @throws IOException If template file not found
     */
    public String renderTemplate(String templateName, Map<String, Object> data) throws IOException {
        String template = loadTemplate(templateName);
        return renderString(template, data);
    }

    /**
     * Render a template string with data variables
     * Replaces {{variableName}} with values from data map
     *
     * @param template Template string with {{variables}}
     * @param data Map of variable names to values
     * @return Rendered prompt string
     */
    public String renderString(String template, Map<String, Object> data) {
        if (template == null || template.isEmpty()) {
            return template;
        }

        if (data == null || data.isEmpty()) {
            return template;
        }

        String result = template;
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            result = result.replace(placeholder, value);
        }

        log.debug("Rendered template with {} variables", data.size());
        return result;
    }

    /**
     * Build final prompt by combining system prompt and data
     *
     * @param templateName System prompt template name
     * @param data Data variables for template
     * @param actualData Actual data content to append
     * @return Final prompt ready for LLM
     * @throws IOException If template file not found
     */
    public String buildPrompt(String templateName, Map<String, Object> data, String actualData) throws IOException {
        String systemPrompt = renderTemplate(templateName, data);
        
        if (actualData == null || actualData.trim().isEmpty()) {
            return systemPrompt;
        }

        return systemPrompt + "\n\n---\n\n## Data:\n\n" + actualData;
    }
}
