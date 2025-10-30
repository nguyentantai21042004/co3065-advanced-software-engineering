package com.aicoach.repository.fileextraction;

import java.io.File;
import java.io.InputStream;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import com.aicoach.repository.FileExtractor;

/**
 * Infrastructure Implementation - PDF Text Extractor
 * Uses Apache PDFBox to extract text from PDF files
 */
@Component
public class PdfExtractor implements FileExtractor {

    @Override
    public String extractText(File file) throws Exception {
        try (PDDocument document = Loader.loadPDF(file)) {
            return extractTextFromDocument(document);
        }
    }

    @Override
    public String extractText(InputStream inputStream, String fileName) throws Exception {
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            return extractTextFromDocument(document);
        }
    }

    @Override
    public boolean supports(String fileName) {
        if (fileName == null) {
            return false;
        }
        String lowerCase = fileName.toLowerCase();
        return lowerCase.endsWith(".pdf");
    }

    /**
     * Extract text from PDDocument
     */
    private String extractTextFromDocument(PDDocument document) throws Exception {
        if (document.getNumberOfPages() == 0) {
            return "";
        }

        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setSortByPosition(true);
        
        // Extract text from all pages
        String text = stripper.getText(document);
        
        // Clean up extra whitespace
        return text.replaceAll("\\s+", " ").trim();
    }
}

