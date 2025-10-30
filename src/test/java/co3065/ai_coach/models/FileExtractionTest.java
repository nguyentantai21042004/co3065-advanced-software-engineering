package co3065.ai_coach.models;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

/**
 * Unit Tests for FileExtraction Domain Model
 */
class FileExtractionTest {

    @Test
    void should_CreateSuccessfulExtraction_When_TextIsProvided() {
        // Given
        String fileName = "sample.pdf";
        String fileType = "PDF";
        String extractedText = "This is sample CV text";

        // When
        FileExtraction extraction = new FileExtraction(fileName, fileType, extractedText);

        // Then
        assertTrue(extraction.isSuccess());
        assertEquals(fileName, extraction.getFileName());
        assertEquals(fileType, extraction.getFileType());
        assertEquals(extractedText, extraction.getExtractedText());
        assertEquals(extractedText.length(), extraction.getTextLength());
        assertNull(extraction.getErrorMessage());
        assertNotNull(extraction.getExtractedAt());
    }

    @Test
    void should_CreateFailedExtraction_When_ErrorOccurs() {
        // Given
        String fileName = "corrupted.pdf";
        String fileType = "PDF";
        String errorMessage = "Failed to parse PDF";

        // When
        FileExtraction extraction = FileExtraction.failed(fileName, fileType, errorMessage);

        // Then
        assertFalse(extraction.isSuccess());
        assertEquals(fileName, extraction.getFileName());
        assertEquals(fileType, extraction.getFileType());
        assertNull(extraction.getExtractedText());
        assertEquals(0, extraction.getTextLength());
        assertEquals(errorMessage, extraction.getErrorMessage());
    }

    @Test
    void should_ReturnTrue_When_TextIsValid() {
        // Given
        FileExtraction extraction = new FileExtraction("test.pdf", "PDF", "Valid text");

        // When & Then
        assertTrue(extraction.hasValidText());
    }

    @Test
    void should_ReturnFalse_When_TextIsEmpty() {
        // Given
        FileExtraction extraction = new FileExtraction("test.pdf", "PDF", "   ");

        // When & Then
        assertFalse(extraction.hasValidText());
    }

    @Test
    void should_ReturnTrue_When_TextMeetsMinimumLength() {
        // Given
        FileExtraction extraction = new FileExtraction("test.pdf", "PDF", 
            "This is a long enough text for minimum length check");

        // When & Then
        assertTrue(extraction.isMinimumLength(10));
    }

    @Test
    void should_ReturnFalse_When_TextDoesNotMeetMinimumLength() {
        // Given
        FileExtraction extraction = new FileExtraction("test.pdf", "PDF", "Short");

        // When & Then
        assertFalse(extraction.isMinimumLength(100));
    }

    @Test
    void should_ReturnPreview_When_TextIsLong() {
        // Given
        String longText = "This is a very long text that should be truncated to a preview length";
        FileExtraction extraction = new FileExtraction("test.pdf", "PDF", longText);

        // When
        String preview = extraction.getPreview(20);

        // Then
        assertEquals("This is a very long ...", preview);
    }

    @Test
    void should_ReturnFullText_When_TextIsShorterThanMaxLength() {
        // Given
        String shortText = "Short text";
        FileExtraction extraction = new FileExtraction("test.pdf", "PDF", shortText);

        // When
        String preview = extraction.getPreview(100);

        // Then
        assertEquals(shortText, preview);
    }

    @Test
    void should_ReturnEmptyString_When_PreviewRequestedForFailedExtraction() {
        // Given
        FileExtraction extraction = FileExtraction.failed("test.pdf", "PDF", "Error occurred");

        // When
        String preview = extraction.getPreview(100);

        // Then
        assertEquals("", preview);
    }
}

