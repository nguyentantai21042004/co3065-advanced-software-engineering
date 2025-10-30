package co3065.ai_coach.adapter.http;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import co3065.ai_coach.adapter.http.dto.ContentUnitPageResponse;
import co3065.ai_coach.adapter.http.dto.ContentUnitResponse;
import co3065.ai_coach.adapter.http.dto.CreateContentUnitRequest;
import co3065.ai_coach.adapter.http.dto.UpdateContentUnitRequest;
import co3065.ai_coach.adapter.http.response.CommandBuilder;
import co3065.ai_coach.adapter.http.response.ContentUnitResponseBuilder;
import co3065.ai_coach.models.ContentUnit;
import co3065.ai_coach.usecase.ContentUnitUseCase;
import co3065.ai_coach.usecase.types.ContentUnitPageResult;
import co3065.ai_coach.usecase.types.ContentUnitSearchCriteria;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ContentUnit Controller
 */
@RestController
@RequestMapping("/content-units")
@CrossOrigin(origins = "*")
public class ContentUnitController {
    private final ContentUnitUseCase useCase;
    private final ContentUnitResponseBuilder responseBuilder;

    public ContentUnitController(ContentUnitUseCase useCase, ContentUnitResponseBuilder responseBuilder) {
        this.useCase = useCase;
        this.responseBuilder = responseBuilder;
    }

    /**
     * POST /content-units
     * Tạo content unit mới
     */
    @PostMapping
    public ResponseEntity<ContentUnitResponse> create(@RequestBody CreateContentUnitRequest request) {
        try {
            var command = CommandBuilder.toCreateContentUnitCommand(request);
            ContentUnit domain = useCase.create(command);
            ContentUnitResponse response = responseBuilder.toResponse(domain);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /content-units/{unitId}
     * Lấy chi tiết content unit
     */
    @GetMapping("/{unitId}")
    public ResponseEntity<ContentUnitResponse> detail(@PathVariable UUID unitId) {
        try {
            return useCase.detail(unitId)
                    .map(responseBuilder::toResponse)
                    .map(response -> ResponseEntity.ok(response))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /content-units
     * Lấy danh sách content units với search và pagination
     */
    @GetMapping
    public ResponseEntity<ContentUnitPageResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<UUID> unitIds,
            @RequestParam(required = false) UUID chapterId,
            @RequestParam(required = false) ContentUnit.UnitType unitType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        try {
            ContentUnitSearchCriteria criteria = new ContentUnitSearchCriteria();
            criteria.setKeyword(keyword);
            criteria.setUnitIds(unitIds);
            criteria.setChapterId(chapterId);
            criteria.setUnitType(unitType);
            criteria.setPage(page);
            criteria.setSize(size);
            
            // Set sort direction
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
            criteria.setSort(Sort.by(direction, sortBy));
            
            ContentUnitPageResult result = useCase.list(criteria);
            
            ContentUnitPageResponse response = new ContentUnitPageResponse(
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
     * PUT /content-units/{unitId}
     * Cập nhật content unit
     */
    @PutMapping("/{unitId}")
    public ResponseEntity<ContentUnitResponse> update(
            @PathVariable UUID unitId, 
            @RequestBody UpdateContentUnitRequest request) {
        try {
            var command = CommandBuilder.toUpdateContentUnitCommand(request);
            return useCase.update(unitId, command)
                    .map(responseBuilder::toResponse)
                    .map(response -> ResponseEntity.ok(response))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * DELETE /content-units
     * Xóa nhiều content units
     */
    @DeleteMapping
    public ResponseEntity<Void> deletes(@RequestBody List<UUID> unitIds) {
        try {
            int deletedCount = useCase.deletes(unitIds);
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
     * GET /content-units/exists/{unitId}
     * Kiểm tra content unit có tồn tại không
     */
    @GetMapping("/exists/{unitId}")
    public ResponseEntity<Boolean> exists(@PathVariable UUID unitId) {
        try {
            boolean exists = useCase.existsById(unitId);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
