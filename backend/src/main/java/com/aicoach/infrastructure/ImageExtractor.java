package com.aicoach.infrastructure;

import java.io.File;
import java.io.InputStream;
import java.util.List;

/**
 * Port Out - Image Extractor Interface
 * Extracts images from document files (PDF, DOCX, etc.)
 */
public interface ImageExtractor {

    /**
     * Extract images from a file
     * 
     * @param file File to extract images from
     * @return List of image data as byte arrays
     * @throws Exception if extraction fails
     */
    List<byte[]> extractImages(File file) throws Exception;

    /**
     * Extract images from input stream
     * 
     * @param inputStream Input stream of the file
     * @param fileName    File name for context (to determine type)
     * @return List of image data as byte arrays
     * @throws Exception if extraction fails
     */
    List<byte[]> extractImages(InputStream inputStream, String fileName) throws Exception;

    /**
     * Extract only the first image from a file
     * 
     * @param inputStream Input stream of the file
     * @param fileName    File name for context
     * @return First image as byte array, or null if no images found
     * @throws Exception if extraction fails
     */
    byte[] extractFirstImage(InputStream inputStream, String fileName) throws Exception;

    /**
     * Check if this extractor supports the given file type
     * 
     * @param fileName File name with extension
     * @return true if supported
     */
    boolean supports(String fileName);
}
