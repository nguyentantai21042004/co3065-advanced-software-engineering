package com.aicoach.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration - Allow all cross-origin requests
 * Configured to allow all origins, methods, and headers
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")  // Allow all origins (using patterns supports credentials)
                .allowedMethods("*")          // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
                .allowedHeaders("*")          // Allow all headers
                .exposedHeaders("*")          // Expose all response headers to client
                .allowCredentials(true)       // Allow credentials (cookies, authorization headers)
                .maxAge(3600);                // Cache preflight requests for 1 hour
    }
}