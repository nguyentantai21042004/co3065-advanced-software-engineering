package com.aicoach.repository.fileextraction;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.aicoach.repository.fileextraction.PdfExtractor;

/**
 * Unit Tests for PdfExtractor
 */
class PdfExtractorTest {

    private PdfExtractor extractor;

    @BeforeEach
    void setUp() {
        extractor = new PdfExtractor();
    }

    @Test
    void should_SupportPdfFiles() {
        assertTrue(extractor.supports("sample.pdf"));
        assertTrue(extractor.supports("SAMPLE.PDF"));
        assertTrue(extractor.supports("document.pdf"));
    }

    @Test
    void should_NotSupportNonPdfFiles() {
        assertFalse(extractor.supports("sample.docx"));
        assertFalse(extractor.supports("sample.txt"));
        assertFalse(extractor.supports("sample.doc"));
        assertFalse(extractor.supports(null));
    }

    @Test
    void should_NotSupportFilesWithoutExtension() {
        assertFalse(extractor.supports("sample"));
    }
}

