package co3065.ai_coach.usecase.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import co3065.ai_coach.models.ContentVersion;
import co3065.ai_coach.repository.ContentVersionRepository;
import co3065.ai_coach.repository.postgresql.entity.ContentVersionEntity;
import co3065.ai_coach.repository.postgresql.specification.ContentVersionSpecification;
import co3065.ai_coach.usecase.ContentVersionUseCase;
import co3065.ai_coach.usecase.types.ContentVersionPageResult;
import co3065.ai_coach.usecase.types.ContentVersionSearchCriteria;
import co3065.ai_coach.usecase.types.CreateContentVersionCommand;
import co3065.ai_coach.usecase.types.UpdateContentVersionCommand;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * ContentVersion Service Implementation
 * Chứa business logic cho ContentVersion
 */
@Service
public class ContentVersionService implements ContentVersionUseCase {
    private final ContentVersionRepository repository;

    public ContentVersionService(ContentVersionRepository repository) {
        this.repository = repository;
    }

    @Override
    public ContentVersion create(CreateContentVersionCommand command) {
        // Validation
        if (command.getUnitId() == null) {
            throw new IllegalArgumentException("Unit ID is required");
        }
        if (command.getVersionNumber() == null || command.getVersionNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Version number is required");
        }
        if (command.getContentData() == null || command.getContentData().isEmpty()) {
            throw new IllegalArgumentException("Content data is required");
        }

        // Create domain object
        ContentVersion contentVersion = new ContentVersion(
            command.getUnitId(),
            command.getVersionNumber(),
            command.getContentData(),
            command.isActive()
        );

        // Business validation
        if (!contentVersion.isValid()) {
            throw new IllegalArgumentException("Invalid content version data");
        }

        // If setting as active, deactivate other versions of the same unit
        if (command.isActive()) {
            repository.deactivateAllVersionsByUnitId(command.getUnitId());
        }

        // Save to database
        return repository.save(contentVersion);
    }

    @Override
    public Optional<ContentVersion> detail(Long versionId) {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        return repository.findById(versionId);
    }

    @Override
    public ContentVersionPageResult list(ContentVersionSearchCriteria criteria) {
        if (criteria == null) {
            criteria = new ContentVersionSearchCriteria();
        }

        // Create specification
        ContentVersionSpecification.Builder specBuilder = new ContentVersionSpecification.Builder();
        if (criteria.getKeyword() != null) {
            specBuilder.keyword(criteria.getKeyword());
        }
        if (criteria.getVersionIds() != null) {
            specBuilder.versionIds(criteria.getVersionIds());
        }
        if (criteria.getUnitId() != null) {
            specBuilder.unitId(criteria.getUnitId());
        }
        if (criteria.getVersionNumber() != null) {
            specBuilder.versionNumber(criteria.getVersionNumber());
        }
        if (criteria.getIsActive() != null) {
            specBuilder.isActive(criteria.getIsActive());
        }
        Specification<ContentVersionEntity> spec = specBuilder.build();

        // Create pageable
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), criteria.getSort());

        // Query with pagination
        Page<ContentVersion> page = repository.findAll(spec, pageable);

        return new ContentVersionPageResult(
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
    public List<ContentVersion> findByUnitId(UUID unitId) {
        if (unitId == null) {
            throw new IllegalArgumentException("Unit ID is required");
        }
        return repository.findByUnitId(unitId);
    }

    @Override
    public Optional<ContentVersion> findActiveVersionByUnitId(UUID unitId) {
        if (unitId == null) {
            throw new IllegalArgumentException("Unit ID is required");
        }
        return repository.findActiveVersionByUnitId(unitId);
    }

    @Override
    public Optional<ContentVersion> update(Long versionId, UpdateContentVersionCommand command) {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        if (command == null) {
            throw new IllegalArgumentException("Command is required");
        }

        // Find existing content version
        Optional<ContentVersion> existingOpt = repository.findById(versionId);
        if (existingOpt.isEmpty()) {
            return Optional.empty();
        }

        ContentVersion existing = existingOpt.get();

        // Update fields
        if (command.getVersionNumber() != null) {
            existing.updateVersionNumber(command.getVersionNumber());
        }
        if (command.getContentData() != null) {
            existing.updateContentData(command.getContentData());
        }
        if (command.getIsActive() != null) {
            existing.setActive(command.getIsActive());
            
            // If setting as active, deactivate other versions of the same unit
            if (command.getIsActive()) {
                repository.deactivateAllVersionsByUnitId(existing.getUnitId());
            }
        }

        // Save updated content version
        ContentVersion updated = repository.save(existing);
        return Optional.of(updated);
    }

    @Override
    public Optional<ContentVersion> setActiveVersion(Long versionId, UUID unitId) {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        if (unitId == null) {
            throw new IllegalArgumentException("Unit ID is required");
        }

        // Find the version
        Optional<ContentVersion> versionOpt = repository.findById(versionId);
        if (versionOpt.isEmpty()) {
            return Optional.empty();
        }

        ContentVersion version = versionOpt.get();
        
        // Check if version belongs to the unit
        if (!version.getUnitId().equals(unitId)) {
            throw new IllegalArgumentException("Version does not belong to the specified unit");
        }

        // Deactivate all versions of the unit
        repository.deactivateAllVersionsByUnitId(unitId);
        
        // Activate the specified version
        version.setActive(true);
        ContentVersion updated = repository.save(version);
        
        return Optional.of(updated);
    }

    @Override
    public int deletes(List<Long> versionIds) {
        if (versionIds == null || versionIds.isEmpty()) {
            return 0;
        }

        // Validate all IDs exist
        List<ContentVersion> existingVersions = repository.findAllByIds(versionIds);
        if (existingVersions.size() != versionIds.size()) {
            throw new IllegalArgumentException("Some content versions not found");
        }

        return repository.deleteByIds(versionIds);
    }

    @Override
    public boolean existsById(Long versionId) {
        if (versionId == null) {
            return false;
        }
        return repository.existsById(versionId);
    }
}
