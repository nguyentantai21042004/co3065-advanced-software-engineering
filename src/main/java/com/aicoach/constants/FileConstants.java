package com.aicoach.constants;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Centralized file constants
 */
public class FileConstants {
    public static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            "pdf", "docx", "doc"));

    public static final Set<String> ALLOWED_MIME_TYPES = new HashSet<>(Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"));

    // Utility: check allowed
    public static boolean isAllowedExtension(String ext) {
        return ext != null && ALLOWED_EXTENSIONS.contains(ext.toLowerCase());
    }

    public static boolean isAllowedMimeType(String mime) {
        return mime != null && ALLOWED_MIME_TYPES.contains(mime.toLowerCase());
    }
}
