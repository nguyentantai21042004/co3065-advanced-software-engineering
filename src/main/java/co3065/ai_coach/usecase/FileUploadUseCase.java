package co3065.ai_coach.usecase;

import java.io.InputStream;

import co3065.ai_coach.models.UploadedFile;

/**
 * File Upload Use Case Interface
 * Port In - Upload files to storage
 */
public interface FileUploadUseCase {

    /**
     * Upload a file to storage
     * 
     * @param inputStream File input stream
     * @param fileName    Original file name
     * @param contentType MIME type
     * @param fileSize    File size in bytes
     * @return UploadedFile with file ID
     */
    UploadedFile uploadFile(InputStream inputStream, String fileName,
            String contentType, long fileSize);
}
