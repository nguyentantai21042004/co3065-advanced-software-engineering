package co3065.ai_coach.repository;

import java.io.InputStream;

import co3065.ai_coach.models.UploadedFile;

/**
 * Port Out - File Storage Interface
 * Infrastructure layer will implement this for MinIO/S3
 */
public interface FileStorage {

    /**
     * Upload file to storage
     * 
     * @param inputStream File input stream
     * @param fileName    Original file name
     * @param contentType MIME type
     * @param fileSize    File size in bytes
     * @return UploadedFile with storage information
     * @throws Exception if upload fails
     */
    UploadedFile uploadFile(InputStream inputStream, String fileName,
            String contentType, long fileSize) throws Exception;

    /**
     * Download file from storage
     * 
     * @param fileId File ID from upload
     * @return InputStream of the file
     * @throws Exception if download fails
     */
    InputStream downloadFile(String fileId) throws Exception;

    /**
     * Delete file from storage
     * 
     * @param fileId File ID to delete
     * @return true if deleted successfully
     * @throws Exception if deletion fails
     */
    boolean deleteFile(String fileId) throws Exception;

    /**
     * Check if file exists in storage
     * 
     * @param fileId File ID to check
     * @return true if exists
     */
    boolean fileExists(String fileId) throws Exception;
}
