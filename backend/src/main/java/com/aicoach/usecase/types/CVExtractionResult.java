package com.aicoach.usecase.types;

import java.util.UUID;

public class CVExtractionResult {
    private final String extractedText;
    private final UUID avatarId;

    public CVExtractionResult(String extractedText, UUID avatarId) {
        this.extractedText = extractedText;
        this.avatarId = avatarId;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public UUID getAvatarId() {
        return avatarId;
    }
}
