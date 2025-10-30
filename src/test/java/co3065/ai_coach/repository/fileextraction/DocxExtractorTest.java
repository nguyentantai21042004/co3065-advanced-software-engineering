package co3065.ai_coach.repository.fileextraction;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit Tests for DocxExtractor
 */
class DocxExtractorTest {

    private DocxExtractor extractor;

    @BeforeEach
    void setUp() {
        extractor = new DocxExtractor();
    }

    @Test
    void should_SupportDocxFiles() {
        assertTrue(extractor.supports("sample.docx"));
        assertTrue(extractor.supports("SAMPLE.DOCX"));
        assertTrue(extractor.supports("document.docx"));
    }

    @Test
    void should_SupportDocFiles() {
        assertTrue(extractor.supports("sample.doc"));
        assertTrue(extractor.supports("SAMPLE.DOC"));
    }

    @Test
    void should_NotSupportNonWordFiles() {
        assertFalse(extractor.supports("sample.pdf"));
        assertFalse(extractor.supports("sample.txt"));
        assertFalse(extractor.supports(null));
    }

    @Test
    void should_NotSupportFilesWithoutExtension() {
        assertFalse(extractor.supports("sample"));
    }
}

