package co3065.ai_coach.adapter.http.response;

import java.util.List;
import java.util.stream.Collectors;

import co3065.ai_coach.adapter.http.dto.ChapterResponse;
import co3065.ai_coach.models.Chapter;

/**
 * Response Builder cho Chapter
 * Chuyển đổi từ Domain → Response DTO
 */
public class ChapterResponseBuilder {

    /**
     * Chuyển Domain Chapter → ChapterResponse DTO
     */
    public static ChapterResponse toResponse(Chapter chapter) {
        return new ChapterResponse(
            chapter.getChapterId(),
            chapter.getCourseId(),
            chapter.getSequenceNumber(),
            chapter.getCreatedAt(),
            chapter.getUpdatedAt()
        );
    }

    /**
     * Chuyển List Domain Chapter → List ChapterResponse DTO
     */
    public static List<ChapterResponse> toResponseList(List<Chapter> chapters) {
        return chapters.stream()
            .map(ChapterResponseBuilder::toResponse)
            .collect(Collectors.toList());
    }
}
