package co3065.ai_coach.usecase.types;

import java.io.InputStream;

/**
 * Command object for file extraction operation
 */
public class FileExtractionCommand {
    private final InputStream inputStream;
    private final String fileName;
    private final String contentType;
    private final long fileSize;

    public FileExtractionCommand(InputStream inputStream, String fileName, 
                                 String contentType, long fileSize) {
        this.inputStream = inputStream;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
    }

    public InputStream getInputStream() {
        return inputStream;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public String getFileExtension() {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
}

