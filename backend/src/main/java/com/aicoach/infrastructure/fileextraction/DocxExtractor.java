package com.aicoach.infrastructure.fileextraction;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Component;

import com.aicoach.infrastructure.FileExtractor;

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

    private String extractTextFromStream(InputStream stream) throws Exception {
        BodyContentHandler handler = new BodyContentHandler(-1);
        Metadata metadata = new Metadata();
        ParseContext context = new ParseContext();
        Parser parser = new AutoDetectParser();
        parser.parse(stream, handler, metadata, context);
        String text = handler.toString();
        return text.replaceAll("\\s+", " ").trim();
    }
}


