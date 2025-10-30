package com.aicoach.usecase.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.aicoach.models.FileExtraction;
import com.aicoach.repository.FileExtractor;

/**
 * Unit Tests for FileExtractionService
 */
class FileExtractionServiceTest {

    private FileExtractionService service;

    @Mock
    private FileExtractor pdfExtractor;

    @Mock
    private FileExtractor docxExtractor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new FileExtractionService(Arrays.asList(pdfExtractor, docxExtractor));
    }

    @Test
    void should_ExtractText_When_PdfFileIsValid() throws Exception {
        // Given
        String fileName = "sample.pdf";
        InputStream inputStream = new ByteArrayInputStream(new byte[0]);
        String expectedText = "This is sample CV text from PDF";

        when(pdfExtractor.supports(fileName)).thenReturn(true);
        when(pdfExtractor.extractText(any(InputStream.class), eq(fileName)))
            .thenReturn(expectedText);

        // When
        FileExtraction result = service.extractText(inputStream, fileName);

        // Then
        assertTrue(result.isSuccess());
        assertEquals(fileName, result.getFileName());
        assertEquals("PDF", result.getFileType());
        assertEquals(expectedText, result.getExtractedText());
        assertEquals(expectedText.length(), result.getTextLength());
        verify(pdfExtractor).extractText(any(InputStream.class), eq(fileName));
    }

    @Test
    void should_ExtractText_When_DocxFileIsValid() throws Exception {
        // Given
        String fileName = "sample.docx";
        InputStream inputStream = new ByteArrayInputStream(new byte[0]);
        String expectedText = "This is sample CV text from DOCX";

        when(pdfExtractor.supports(fileName)).thenReturn(false);
        when(docxExtractor.supports(fileName)).thenReturn(true);
        when(docxExtractor.extractText(any(InputStream.class), eq(fileName)))
            .thenReturn(expectedText);

        // When
        FileExtraction result = service.extractText(inputStream, fileName);

        // Then
        assertTrue(result.isSuccess());
        assertEquals(fileName, result.getFileName());
        assertEquals("DOCX", result.getFileType());
        assertEquals(expectedText, result.getExtractedText());
    }

    @Test
    void should_ReturnError_When_FileTypeIsUnsupported() {
        // Given
        String fileName = "sample.txt";
        InputStream inputStream = new ByteArrayInputStream(new byte[0]);

        when(pdfExtractor.supports(fileName)).thenReturn(false);
        when(docxExtractor.supports(fileName)).thenReturn(false);

        // When
        FileExtraction result = service.extractText(inputStream, fileName);

        // Then
        assertFalse(result.isSuccess());
        assertEquals("Unsupported file type. Supported types: PDF, DOCX, DOC", 
                    result.getErrorMessage());
    }

    @Test
    void should_ReturnError_When_InputStreamIsNull() {
        // Given
        String fileName = "sample.pdf";

        // When
        FileExtraction result = service.extractText((InputStream) null, fileName);

        // Then
        assertFalse(result.isSuccess());
        assertEquals("Input stream is null", result.getErrorMessage());
    }

    @Test
    void should_ReturnError_When_FileNameIsNull() {
        // Given
        InputStream inputStream = new ByteArrayInputStream(new byte[0]);

        // When
        FileExtraction result = service.extractText(inputStream, null);

        // Then
        assertFalse(result.isSuccess());
        assertEquals("File name is required", result.getErrorMessage());
    }

    @Test
    void should_ReturnError_When_ExtractedTextIsEmpty() throws Exception {
        // Given
        String fileName = "empty.pdf";
        InputStream inputStream = new ByteArrayInputStream(new byte[0]);

        when(pdfExtractor.supports(fileName)).thenReturn(true);
        when(pdfExtractor.extractText(any(InputStream.class), eq(fileName)))
            .thenReturn("");

        // When
        FileExtraction result = service.extractText(inputStream, fileName);

        // Then
        assertFalse(result.isSuccess());
        assertEquals("No text content found in file", result.getErrorMessage());
    }

    @Test
    void should_ReturnError_When_ExtractionThrowsException() throws Exception {
        // Given
        String fileName = "corrupted.pdf";
        InputStream inputStream = new ByteArrayInputStream(new byte[0]);

        when(pdfExtractor.supports(fileName)).thenReturn(true);
        when(pdfExtractor.extractText(any(InputStream.class), eq(fileName)))
            .thenThrow(new RuntimeException("Corrupted file"));

        // When
        FileExtraction result = service.extractText(inputStream, fileName);

        // Then
        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("Failed to extract text"));
    }

    @Test
    void should_ReturnTrue_When_FileTypeIsSupported() {
        // Given
        when(pdfExtractor.supports("test.pdf")).thenReturn(true);

        // When
        boolean result = service.isSupportedFileType("test.pdf");

        // Then
        assertTrue(result);
    }

    @Test
    void should_ReturnFalse_When_FileTypeIsNotSupported() {
        // Given
        when(pdfExtractor.supports("test.txt")).thenReturn(false);
        when(docxExtractor.supports("test.txt")).thenReturn(false);

        // When
        boolean result = service.isSupportedFileType("test.txt");

        // Then
        assertFalse(result);
    }
}

