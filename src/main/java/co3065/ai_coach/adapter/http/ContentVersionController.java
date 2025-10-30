package co3065.ai_coach.adapter.http;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import co3065.ai_coach.adapter.http.dto.ContentVersionPageResponse;
import co3065.ai_coach.adapter.http.dto.ContentVersionResponse;
import co3065.ai_coach.adapter.http.dto.CreateContentVersionRequest;
import co3065.ai_coach.adapter.http.dto.UpdateContentVersionRequest;
import co3065.ai_coach.adapter.http.response.CommandBuilder;
import co3065.ai_coach.adapter.http.response.ContentVersionResponseBuilder;
import co3065.ai_coach.models.ContentVersion;
import co3065.ai_coach.usecase.ContentVersionUseCase;
import co3065.ai_coach.usecase.types.ContentVersionPageResult;
import co3065.ai_coach.usecase.types.ContentVersionSearchCriteria;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ContentVersion Controller
 */
@RestController
@RequestMapping("/content-versions")
@CrossOrigin(origins = "*")
public class ContentVersionController {
    private final ContentVersionUseCase useCase;
    private final ContentVersionResponseBuilder responseBuilder;

    public ContentVersionController(ContentVersionUseCase useCase, ContentVersionResponseBuilder responseBuilder) {
        this.useCase = useCase;
        this.responseBuilder = responseBuilder;
    }

    /**
     * POST /content-versions
     * Tạo content version mới
     */
    @PostMapping
    public ResponseEntity<ContentVersionResponse> create(@RequestBody CreateContentVersionRequest request) {
        try {
            var command = CommandBuilder.toCreateContentVersionCommand(request);
            ContentVersion domain = useCase.create(command);
            ContentVersionResponse response = responseBuilder.toResponse(domain);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /content-versions/{versionId}
     * Lấy chi tiết content version
     */
    @GetMapping("/{versionId}")
    public ResponseEntity<ContentVersionResponse> detail(@PathVariable Long versionId) {
        try {
            return useCase.detail(versionId)
                    .map(responseBuilder::toResponse)
                    .map(response -> ResponseEntity.ok(response))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /content-versions
     * Lấy danh sách content versions với search và pagination
     */
    @GetMapping
    public ResponseEntity<ContentVersionPageResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<Long> versionIds,
            @RequestParam(required = false) UUID unitId,
            @RequestParam(required = false) String versionNumber,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        try {
            ContentVersionSearchCriteria criteria = new ContentVersionSearchCriteria();
            criteria.setKeyword(keyword);
            criteria.setVersionIds(versionIds);
            criteria.setUnitId(unitId);
            criteria.setVersionNumber(versionNumber);
            criteria.setIsActive(isActive);
            criteria.setPage(page);
            criteria.setSize(size);
            
            // Set sort direction
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
            criteria.setSort(Sort.by(direction, sortBy));
            
            ContentVersionPageResult result = useCase.list(criteria);
            
            ContentVersionPageResponse response = new ContentVersionPageResponse(
                result.getItems().stream()
                    .map(responseBuilder::toResponse)
                    .collect(Collectors.toList()),
                result.getTotalElements(),
                result.getTotalPages(),
                result.getCurrentPage(),
                result.getSize(),
                result.isFirst(),
                result.isLast()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /content-versions/unit/{unitId}
     * Lấy tất cả versions của một unit
     */
    @GetMapping("/unit/{unitId}")
    public ResponseEntity<List<ContentVersionResponse>> findByUnitId(@PathVariable UUID unitId) {
        try {
            List<ContentVersion> versions = useCase.findByUnitId(unitId);
            List<ContentVersionResponse> responses = versions.stream()
                    .map(responseBuilder::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /content-versions/unit/{unitId}/active
     * Lấy version đang active của một unit
     */
    @GetMapping("/unit/{unitId}/active")
    public ResponseEntity<ContentVersionResponse> findActiveVersionByUnitId(@PathVariable UUID unitId) {
        try {
            return useCase.findActiveVersionByUnitId(unitId)
                    .map(responseBuilder::toResponse)
                    .map(response -> ResponseEntity.ok(response))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * PUT /content-versions/{versionId}
     * Cập nhật content version
     */
    @PutMapping("/{versionId}")
    public ResponseEntity<ContentVersionResponse> update(
            @PathVariable Long versionId, 
            @RequestBody UpdateContentVersionRequest request) {
        try {
            var command = CommandBuilder.toUpdateContentVersionCommand(request);
            return useCase.update(versionId, command)
                    .map(responseBuilder::toResponse)
                    .map(response -> ResponseEntity.ok(response))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * PUT /content-versions/{versionId}/activate
     * Kích hoạt version và deactivate các version khác của cùng unit
     */
    @PutMapping("/{versionId}/activate")
    public ResponseEntity<ContentVersionResponse> setActiveVersion(
            @PathVariable Long versionId,
            @RequestParam UUID unitId) {
        try {
            return useCase.setActiveVersion(versionId, unitId)
                    .map(responseBuilder::toResponse)
                    .map(response -> ResponseEntity.ok(response))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * DELETE /content-versions
     * Xóa nhiều content versions
     */
    @DeleteMapping
    public ResponseEntity<Void> deletes(@RequestBody List<Long> versionIds) {
        try {
            int deletedCount = useCase.deletes(versionIds);
            if (deletedCount > 0) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /content-versions/exists/{versionId}
     * Kiểm tra content version có tồn tại không
     */
    @GetMapping("/exists/{versionId}")
    public ResponseEntity<Boolean> exists(@PathVariable Long versionId) {
        try {
            boolean exists = useCase.existsById(versionId);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
