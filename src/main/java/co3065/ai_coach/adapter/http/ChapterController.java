package co3065.ai_coach.adapter.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import co3065.ai_coach.adapter.http.dto.ApiResponse;
import co3065.ai_coach.adapter.http.dto.ChapterResponse;
import co3065.ai_coach.adapter.http.dto.CreateChapterRequest;
import co3065.ai_coach.adapter.http.dto.UpdateChapterRequest;
import co3065.ai_coach.adapter.http.response.ChapterResponseBuilder;
import co3065.ai_coach.adapter.http.response.CommandBuilder;
import co3065.ai_coach.models.Chapter;
import co3065.ai_coach.usecase.ChapterUseCase;
import co3065.ai_coach.usecase.types.ChapterPageResult;
import co3065.ai_coach.usecase.types.ChapterSearchCriteria;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller - HTTP Adapter cho Chapter
 * Trả về chuẩn ApiResponse format với snake_case JSON
 */
@RestController
@RequestMapping("/api/chapters")
public class ChapterController {

    private final ChapterUseCase chapterUseCase;

    public ChapterController(ChapterUseCase chapterUseCase) {
        this.chapterUseCase = chapterUseCase;
    }

    /**
     * POST /api/chapters - Tạo chapter mới
     * Response: { "error_code": 0, "message": "Success", "data": {...} }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChapterResponse>> create(@RequestBody CreateChapterRequest request) {
        Chapter chapter = chapterUseCase.create(CommandBuilder.toCreateChapterCommand(request));
        ChapterResponse response = ChapterResponseBuilder.toResponse(chapter);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Chapter created successfully", response));
    }

    /**
     * GET /api/chapters/{chapterId} - Lấy chapter theo ID (detail)
     */
    @GetMapping("/{chapterId}")
    public ResponseEntity<ApiResponse<ChapterResponse>> detail(@PathVariable UUID chapterId) {
        return chapterUseCase.detail(chapterId)
            .map(chapter -> ResponseEntity.ok(
                ApiResponse.success(ChapterResponseBuilder.toResponse(chapter))
            ))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, "Chapter not found")));
    }

    /**
     * GET /api/chapters - Lấy danh sách chapters với search và pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ChapterPageResult>> list(
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) Integer sequenceNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        ChapterSearchCriteria criteria = new ChapterSearchCriteria(courseId, sequenceNumber, page, size);
        ChapterPageResult result = chapterUseCase.list(criteria);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * PUT /api/chapters/{chapterId} - Cập nhật chapter
     */
    @PutMapping("/{chapterId}")
    public ResponseEntity<ApiResponse<ChapterResponse>> update(@PathVariable UUID chapterId, 
                                                              @RequestBody UpdateChapterRequest request) {
        return chapterUseCase.update(chapterId, CommandBuilder.toUpdateChapterCommand(request))
            .map(chapter -> ResponseEntity.ok(
                ApiResponse.success("Chapter updated successfully", ChapterResponseBuilder.toResponse(chapter))
            ))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, "Chapter not found")));
    }

    /**
     * DELETE /api/chapters - Xóa nhiều chapters
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> deletes(@RequestBody List<UUID> chapterIds) {
        int deletedCount = chapterUseCase.deletes(chapterIds);
        return ResponseEntity.ok(ApiResponse.success(
            "Successfully deleted " + deletedCount + " chapter(s)"
        ));
    }

    /**
     * Exception Handler - Trả về chuẩn ApiResponse
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(400, e.getMessage()));
    }
}
