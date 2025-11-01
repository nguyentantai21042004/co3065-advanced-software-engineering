package com.aicoach.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;

/**
 * OpenAPI/Swagger Configuration
 * Access Swagger UI at: http://localhost:8090/swagger-ui.html
 * Access API Docs at: http://localhost:8090/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CV Processing API")
                        .version("2.0")
                        .description("""
                                API để xử lý CV (Curriculum Vitae) với 2 bước:

                                1. **Upload CV** - Upload file PDF/DOCX/DOC → Nhận file ID
                                2. **Extract Text** - Gửi file ID → Nhận text đã trích xuất

                                Files được lưu trữ trong MinIO (S3-compatible storage).

                                ## Supported File Types
                                - PDF (.pdf)
                                - Microsoft Word (.docx, .doc)

                                ## Storage
                                - MinIO S3-compatible object storage
                                - Bucket: cv-files
                                - Max file size: 10MB
                                """)
                        .contact(new Contact()
                                .name("AI Coach Team")
                                .email("support@aicoach.com")
                                .url("https://github.com/your-repo"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addServersItem(new Server()
                        .url("http://localhost:8090")
                        .description("Local Development Server"))
                .addServersItem(new Server()
                        .url("https://api.aicoach.com")
                        .description("Production Server"));
    }
}
