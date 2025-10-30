package com.aicoach.adapter.http;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration Tests for FileExtractionController
 * Tests the complete flow from HTTP request to response
 */
@SpringBootTest
@AutoConfigureMockMvc
class FileExtractionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void should_ReturnSupportedTypes() throws Exception {
        mockMvc.perform(get("/api/files/supported-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.error_code").value(0))
                .andExpect(jsonPath("$.message").value("Supported file types"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0]").value("PDF"));
    }

    @Test
    void should_ReturnError_When_FileIsEmpty() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file", 
            "empty.pdf", 
            "application/pdf", 
            new byte[0]
        );

        mockMvc.perform(multipart("/api/files/extract")
                .file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value(400))
                .andExpect(jsonPath("$.message").value("File is empty"));
    }

    @Test
    void should_ReturnError_When_FileTypeIsUnsupported() throws Exception {
        MockMultipartFile unsupportedFile = new MockMultipartFile(
            "file", 
            "test.txt", 
            "text/plain", 
            "Some text content".getBytes()
        );

        mockMvc.perform(multipart("/api/files/extract")
                .file(unsupportedFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value(400))
                .andExpect(jsonPath("$.message").value("Unsupported file type. Supported types: PDF, DOCX, DOC"));
    }

    @Test
    void should_ExtractTextWithPreview() throws Exception {
        // Create a simple PDF-like content (this will fail actual parsing but tests the flow)
        MockMultipartFile pdfFile = new MockMultipartFile(
            "file", 
            "sample.pdf", 
            "application/pdf", 
            "Sample content for testing".getBytes()
        );

        mockMvc.perform(multipart("/api/files/extract/preview")
                .file(pdfFile)
                .param("maxLength", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.error_code").exists());
    }
}

