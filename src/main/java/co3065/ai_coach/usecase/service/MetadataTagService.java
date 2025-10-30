package co3065.ai_coach.usecase.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import co3065.ai_coach.models.MetadataTag;
import co3065.ai_coach.repository.MetadataTagRepository;
import co3065.ai_coach.repository.postgresql.entity.MetadataTagEntity;
import co3065.ai_coach.repository.postgresql.specification.MetadataTagSpecification;
import co3065.ai_coach.usecase.MetadataTagUseCase;
import co3065.ai_coach.usecase.types.CreateMetadataTagCommand;
import co3065.ai_coach.usecase.types.MetadataTagPageResult;
import co3065.ai_coach.usecase.types.MetadataTagSearchCriteria;
import co3065.ai_coach.usecase.types.UpdateMetadataTagCommand;

import java.util.List;
import java.util.Optional;

/**
 * MetadataTag Service Implementation
 * Chứa business logic cho MetadataTag
 */
@Service
public class MetadataTagService implements MetadataTagUseCase {
    private final MetadataTagRepository repository;

    public MetadataTagService(MetadataTagRepository repository) {
        this.repository = repository;
    }

    @Override
    public MetadataTag create(CreateMetadataTagCommand command) {
        // Validation
        if (command.getTagName() == null || command.getTagName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tag name is required");
        }

        // Check if tag name already exists
        if (repository.existsByTagName(command.getTagName())) {
            throw new IllegalArgumentException("Tag name already exists");
        }

        // Create domain object
        MetadataTag metadataTag = new MetadataTag(command.getTagName());

        // Business validation
        if (!metadataTag.isValid()) {
            throw new IllegalArgumentException("Invalid metadata tag data");
        }

        // Save to database
        return repository.save(metadataTag);
    }

    @Override
    public Optional<MetadataTag> detail(Integer tagId) {
        if (tagId == null) {
            throw new IllegalArgumentException("Tag ID is required");
        }
        return repository.findById(tagId);
    }

    @Override
    public MetadataTagPageResult list(MetadataTagSearchCriteria criteria) {
        if (criteria == null) {
            criteria = new MetadataTagSearchCriteria();
        }

        // Create specification
        MetadataTagSpecification.Builder specBuilder = new MetadataTagSpecification.Builder();
        if (criteria.getKeyword() != null) {
            specBuilder.keyword(criteria.getKeyword());
        }
        if (criteria.getTagIds() != null) {
            specBuilder.tagIds(criteria.getTagIds());
        }
        Specification<MetadataTagEntity> spec = specBuilder.build();

        // Create pageable
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), criteria.getSort());

        // Query with pagination
        Page<MetadataTag> page = repository.findAll(spec, pageable);

        return new MetadataTagPageResult(
            page.getContent(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.getNumber(),
            page.getSize(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Override
    public Optional<MetadataTag> update(Integer tagId, UpdateMetadataTagCommand command) {
        if (tagId == null) {
            throw new IllegalArgumentException("Tag ID is required");
        }
        if (command == null) {
            throw new IllegalArgumentException("Command is required");
        }

        // Find existing metadata tag
        Optional<MetadataTag> existingOpt = repository.findById(tagId);
        if (existingOpt.isEmpty()) {
            return Optional.empty();
        }

        MetadataTag existing = existingOpt.get();

        // Check if new tag name already exists (excluding current tag)
        if (command.getTagName() != null && !command.getTagName().equals(existing.getTagName())) {
            if (repository.existsByTagName(command.getTagName())) {
                throw new IllegalArgumentException("Tag name already exists");
            }
        }

        // Update fields
        if (command.getTagName() != null) {
            existing.updateTagName(command.getTagName());
        }

        // Save updated metadata tag
        MetadataTag updated = repository.save(existing);
        return Optional.of(updated);
    }

    @Override
    public int deletes(List<Integer> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return 0;
        }

        // Validate all IDs exist
        List<MetadataTag> existingTags = repository.findAllByIds(tagIds);
        if (existingTags.size() != tagIds.size()) {
            throw new IllegalArgumentException("Some metadata tags not found");
        }

        return repository.deleteByIds(tagIds);
    }

    @Override
    public boolean existsById(Integer tagId) {
        if (tagId == null) {
            return false;
        }
        return repository.existsById(tagId);
    }

    @Override
    public boolean existsByTagName(String tagName) {
        if (tagName == null || tagName.trim().isEmpty()) {
            return false;
        }
        return repository.existsByTagName(tagName);
    }
}
