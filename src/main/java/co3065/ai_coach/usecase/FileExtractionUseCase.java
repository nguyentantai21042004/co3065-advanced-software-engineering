package co3065.ai_coach.usecase;

import java.io.File;
import java.io.InputStream;

import co3065.ai_coach.models.FileExtraction;

/**
 * File Extraction Use Case Interface
 * Port In - Defines operations for extracting text from files
 */
public interface FileExtractionUseCase {
    
    /**
     * Extract text from a file based on its type
     * @param file The file to extract text from
     * @param fileName Original file name
     * @return FileExtraction result
     */
    FileExtraction extractText(File file, String fileName);
    
    /**
     * Extract text from an input stream
     * @param inputStream Input stream of the file
     * @param fileName Original file name
     * @return FileExtraction result
     */
    FileExtraction extractText(InputStream inputStream, String fileName);
    
    /**
     * Check if file type is supported
     * @param fileName File name with extension
     * @return true if supported
     */
    boolean isSupportedFileType(String fileName);
}

