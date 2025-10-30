package co3065.ai_coach.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co3065.ai_coach.models.Chapter;
import co3065.ai_coach.usecase.types.ChapterPageResult;
import co3065.ai_coach.usecase.types.ChapterSearchCriteria;
import co3065.ai_coach.usecase.types.CreateChapterCommand;
import co3065.ai_coach.usecase.types.UpdateChapterCommand;

/**
 * Chapter Use Case Interface - Tất cả use cases cho Chapter domain
 */
public interface ChapterUseCase {
    // Create
    Chapter create(CreateChapterCommand command);
    
    // Read
    Optional<Chapter> detail(UUID chapterId);
    ChapterPageResult list(ChapterSearchCriteria criteria);
    
    // Update
    Optional<Chapter> update(UUID chapterId, UpdateChapterCommand command);
    
    // Delete
    int deletes(List<UUID> chapterIds);
    
    // Existence check
    boolean existsById(UUID chapterId);
    boolean existsByCourseIdAndSequence(UUID courseId, Integer sequenceNumber);
}
