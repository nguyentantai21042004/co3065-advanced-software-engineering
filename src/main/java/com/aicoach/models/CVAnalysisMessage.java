package com.aicoach.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message for CV Analysis Task
 * Published after CV extraction is completed
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVAnalysisMessage {
    /**
     * Unique task ID for this analysis
     */
    private String taskId;

    /**
     * Extraction result ID (UUID) - used to fetch raw text from database
     */
    private String extractionResultId;

    /**
     * File ID (UUID) - reference to original uploaded file
     */
    private String fileId;

    /**
     * File name - original file name
     */
    private String fileName;

    /**
     * Retry count for failed attempts
     */
    @Builder.Default
    private int retryCount = 0;

    /**
     * Increment retry count
     */
    public void incrementRetry() {
        this.retryCount++;
    }
}
