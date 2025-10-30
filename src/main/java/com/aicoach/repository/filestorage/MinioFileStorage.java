package com.aicoach.repository.filestorage;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.aicoach.models.UploadedFile;
import com.aicoach.repository.FileStorage;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;

/**
 * Infrastructure Implementation - MinIO File Storage
 * S3-Compatible Object Storage
 */
@Component
public class MinioFileStorage implements FileStorage {

    private final MinioClient minioClient;
    private final String bucketName;

    public MinioFileStorage(MinioClient minioClient,
            @Value("${minio.bucket-name}") String bucketName) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
    }

    @Override
    public UploadedFile uploadFile(InputStream inputStream, String fileName,
            String contentType, long fileSize) throws Exception {
        // Generate unique file ID
        String fileId = UUID.randomUUID().toString();
        String fileExtension = getFileExtension(fileName);
        String storagePath = fileId + (fileExtension.isEmpty() ? "" : "." + fileExtension);

        // Upload to MinIO
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(storagePath)
                        .stream(inputStream, fileSize, -1)
                        .contentType(contentType)
                        .build());

        return new UploadedFile(fileId, fileName, storagePath, contentType, fileSize);
    }

    @Override
    public InputStream downloadFile(String fileId) throws Exception {
        // Try to find file with common extensions
        String[] possiblePaths = {
                fileId + ".pdf",
                fileId + ".docx",
                fileId + ".doc",
                fileId
        };

        for (String path : possiblePaths) {
            try {
                return minioClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(bucketName)
                                .object(path)
                                .build());
            } catch (Exception e) {
                // Try next path
                continue;
            }
        }

        throw new Exception("File not found: " + fileId);
    }

    @Override
    public boolean deleteFile(String fileId) throws Exception {
        String[] possiblePaths = {
                fileId + ".pdf",
                fileId + ".docx",
                fileId + ".doc",
                fileId
        };

        boolean deleted = false;
        for (String path : possiblePaths) {
            try {
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(path)
                                .build());
                deleted = true;
            } catch (Exception e) {
                // Continue to try other paths
            }
        }

        return deleted;
    }

    @Override
    public boolean fileExists(String fileId) throws Exception {
        String[] possiblePaths = {
                fileId + ".pdf",
                fileId + ".docx",
                fileId + ".doc",
                fileId
        };

        for (String path : possiblePaths) {
            try {
                minioClient.statObject(
                        StatObjectArgs.builder()
                                .bucket(bucketName)
                                .object(path)
                                .build());
                return true;
            } catch (Exception e) {
                // Try next path
                continue;
            }
        }

        return false;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
}
