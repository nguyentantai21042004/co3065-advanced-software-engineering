package co3065.ai_coach.usecase.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co3065.ai_coach.models.Chapter;
import co3065.ai_coach.repository.ChapterRepository;
import co3065.ai_coach.repository.CourseRepository;
import co3065.ai_coach.usecase.ChapterUseCase;
import co3065.ai_coach.usecase.types.ChapterPageResult;
import co3065.ai_coach.usecase.types.ChapterSearchCriteria;
import co3065.ai_coach.usecase.types.CreateChapterCommand;
import co3065.ai_coach.usecase.types.UpdateChapterCommand;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Chapter Service Implementation - Tất cả business logic cho Chapter domain
 */
@Service
@Transactional
public class ChapterService implements ChapterUseCase {
    
    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;

    public ChapterService(ChapterRepository chapterRepository, CourseRepository courseRepository) {
        this.chapterRepository = chapterRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public Chapter create(CreateChapterCommand command) {
        // Business validation
        if (command.getCourseId() == null) {
            throw new IllegalArgumentException("Course ID cannot be null");
        }

        if (command.getSequenceNumber() == null || command.getSequenceNumber() <= 0) {
            throw new IllegalArgumentException("Sequence number must be greater than 0");
        }

        // Check if course exists
        if (!courseRepository.existsById(command.getCourseId())) {
            throw new IllegalArgumentException("Course with ID " + command.getCourseId() + " does not exist");
        }

        // Check duplicate sequence number in the same course
        if (chapterRepository.existsByCourseIdAndSequence(command.getCourseId(), command.getSequenceNumber())) {
            throw new IllegalArgumentException("Chapter with sequence number " + command.getSequenceNumber() + " already exists in this course");
        }

        // Tạo domain entity
        Chapter chapter = new Chapter(command.getCourseId(), command.getSequenceNumber());

        // Domain validation
        if (!chapter.isValid()) {
            throw new IllegalArgumentException("Invalid chapter data");
        }

        // Lưu vào database
        return chapterRepository.save(chapter);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Chapter> detail(UUID chapterId) {
        if (chapterId == null) {
            throw new IllegalArgumentException("Chapter ID cannot be null");
        }
        return chapterRepository.findById(chapterId);
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterPageResult list(ChapterSearchCriteria criteria) {
        if (criteria == null) {
            criteria = new ChapterSearchCriteria(); // Default criteria
        }
        
        // Validate pagination parameters
        if (criteria.getPage() < 0) {
            criteria.setPage(0);
        }
        if (criteria.getSize() <= 0 || criteria.getSize() > 100) {
            criteria.setSize(20); // Default page size
        }
        
        return chapterRepository.search(criteria);
    }

    @Override
    public Optional<Chapter> update(UUID chapterId, UpdateChapterCommand command) {
        if (chapterId == null) {
            throw new IllegalArgumentException("Chapter ID cannot be null");
        }

        if (command.getSequenceNumber() == null || command.getSequenceNumber() <= 0) {
            throw new IllegalArgumentException("Sequence number must be greater than 0");
        }

        return chapterRepository.findById(chapterId)
            .map(chapter -> {
                // Check if new sequence number conflicts with existing chapter in the same course
                if (!chapter.getSequenceNumber().equals(command.getSequenceNumber()) && 
                    chapterRepository.existsByCourseIdAndSequence(chapter.getCourseId(), command.getSequenceNumber())) {
                    throw new IllegalArgumentException("Chapter with sequence number " + command.getSequenceNumber() + " already exists in this course");
                }

                // Update chapter fields
                chapter.updateSequenceNumber(command.getSequenceNumber());

                return chapterRepository.save(chapter);
            });
    }

    @Override
    public int deletes(List<UUID> chapterIds) {
        if (chapterIds == null || chapterIds.isEmpty()) {
            throw new IllegalArgumentException("Chapter IDs list cannot be null or empty");
        }

        // Validate all IDs exist before deleting
        for (UUID chapterId : chapterIds) {
            if (chapterId == null) {
                throw new IllegalArgumentException("Chapter ID cannot be null");
            }
            if (!chapterRepository.existsById(chapterId)) {
                throw new IllegalArgumentException("Chapter with ID " + chapterId + " not found");
            }
        }

        chapterRepository.deleteByIds(chapterIds);
        return chapterIds.size();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(UUID chapterId) {
        if (chapterId == null) {
            throw new IllegalArgumentException("Chapter ID cannot be null");
        }
        return chapterRepository.existsById(chapterId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCourseIdAndSequence(UUID courseId, Integer sequenceNumber) {
        if (courseId == null) {
            throw new IllegalArgumentException("Course ID cannot be null");
        }
        if (sequenceNumber == null || sequenceNumber <= 0) {
            throw new IllegalArgumentException("Sequence number must be greater than 0");
        }
        return chapterRepository.existsByCourseIdAndSequence(courseId, sequenceNumber);
    }
}
