package co3065.ai_coach.repository.postgresql;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import co3065.ai_coach.models.Chapter;
import co3065.ai_coach.repository.ChapterRepository;
import co3065.ai_coach.repository.postgresql.entity.ChapterEntity;
import co3065.ai_coach.repository.postgresql.mapper.ChapterMapper;
import co3065.ai_coach.repository.postgresql.specification.ChapterSpecification;
import co3065.ai_coach.usecase.types.ChapterPageResult;
import co3065.ai_coach.usecase.types.ChapterSearchCriteria;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Infrastructure Repository Implementation cho Chapter
 * Adapter cho persistence layer, implement Port Out interface
 */
@Repository
public class JpaChapterRepository implements ChapterRepository {

    private final SpringDataChapterRepository springDataChapterRepository;

    public JpaChapterRepository(SpringDataChapterRepository springDataChapterRepository) {
        this.springDataChapterRepository = springDataChapterRepository;
    }

    @Override
    public Chapter save(Chapter chapter) {
        ChapterEntity entity = ChapterMapper.toEntity(chapter);
        ChapterEntity savedEntity = springDataChapterRepository.save(entity);
        return ChapterMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Chapter> findById(UUID chapterId) {
        return springDataChapterRepository.findById(chapterId)
            .map(ChapterMapper::toDomain);
    }

    @Override
    public ChapterPageResult search(ChapterSearchCriteria criteria) {
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize());
        
        Specification<ChapterEntity> spec = ChapterSpecification.createSpecification(criteria);
        Page<ChapterEntity> page = springDataChapterRepository.findAll(spec, pageable);
        
        List<Chapter> chapters = page.getContent().stream()
            .map(ChapterMapper::toDomain)
            .collect(Collectors.toList());
        
        return new ChapterPageResult(
            chapters,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }

    @Override
    public void deleteByIds(List<UUID> chapterIds) {
        springDataChapterRepository.deleteAllById(chapterIds);
    }

    @Override
    public boolean existsById(UUID chapterId) {
        return springDataChapterRepository.existsById(chapterId);
    }

    @Override
    public boolean existsByCourseIdAndSequence(UUID courseId, Integer sequenceNumber) {
        return springDataChapterRepository.existsByCourseIdAndSequenceNumber(courseId, sequenceNumber);
    }
}
