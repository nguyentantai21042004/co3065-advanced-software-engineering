package co3065.ai_coach.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co3065.ai_coach.models.Chapter;
import co3065.ai_coach.usecase.types.ChapterPageResult;
import co3065.ai_coach.usecase.types.ChapterSearchCriteria;

/**
 * Port Out - Repository interface cho Chapter
 * Infrastructure layer sẽ implement interface này
 */
public interface ChapterRepository {
    Chapter save(Chapter chapter);
    Optional<Chapter> findById(UUID chapterId);
    ChapterPageResult search(ChapterSearchCriteria criteria);
    void deleteByIds(List<UUID> chapterIds);
    boolean existsById(UUID chapterId);
    boolean existsByCourseIdAndSequence(UUID courseId, Integer sequenceNumber);
}
