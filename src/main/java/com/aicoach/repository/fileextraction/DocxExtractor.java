package com.aicoach.repository.fileextraction;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Component;

import com.aicoach.repository.FileExtractor;

/**
 * Infrastructure Implementation - DOCX Text Extractor
 * Uses Apache Tika to extract text from Word documents
 */
@Component
public class DocxExtractor implements FileExtractor {

    @Override
    public String extractText(File file) throws Exception {
        try (InputStream stream = new FileInputStream(file)) {
            return extractTextFromStream(stream);
        }
    }

    @Override
    public String extractText(InputStream inputStream, String fileName) throws Exception {
        return extractTextFromStream(inputStream);
    }

    @Override
    public boolean supports(String fileName) {
        if (fileName == null) {
            return false;
        }
        String lowerCase = fileName.toLowerCase();
        return lowerCase.endsWith(".docx") || lowerCase.endsWith(".doc");
    }

    /**
     * Extract text using Apache Tika
     */
    private String extractTextFromStream(InputStream stream) throws Exception {
        // Create content handler with no write limit
        BodyContentHandler handler = new BodyContentHandler(-1);
        
        // Create metadata object
        Metadata metadata = new Metadata();
        
        // Create parser context
        ParseContext context = new ParseContext();
        
        // Auto-detect parser
        Parser parser = new AutoDetectParser();
        
        // Parse the document
        parser.parse(stream, handler, metadata, context);
        
        // Get extracted text
        String text = handler.toString();
        
        // Clean up extra whitespace
        return text.replaceAll("\\s+", " ").trim();
    }
}

