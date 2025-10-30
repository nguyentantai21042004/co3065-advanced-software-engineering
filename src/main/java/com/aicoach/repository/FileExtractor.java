package com.aicoach.repository;

import java.io.File;
import java.io.InputStream;

/**
 * Port Out - File Extractor Interface
 * Infrastructure layer will implement this
 */
public interface FileExtractor {
    
    /**
     * Extract text from file
     * @param file File to extract
     * @return Extracted text
     * @throws Exception if extraction fails
     */
    String extractText(File file) throws Exception;
    
    /**
     * Extract text from input stream
     * @param inputStream Input stream
     * @param fileName File name for context
     * @return Extracted text
     * @throws Exception if extraction fails
     */
    String extractText(InputStream inputStream, String fileName) throws Exception;
    
    /**
     * Check if this extractor supports the given file type
     * @param fileName File name with extension
     * @return true if supported
     */
    boolean supports(String fileName);
}

