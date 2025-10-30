package co3065.ai_coach.adapter.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import co3065.ai_coach.adapter.http.dto.ApiResponse;
import co3065.ai_coach.adapter.http.dto.CourseResponse;
import co3065.ai_coach.adapter.http.dto.CreateCourseRequest;
import co3065.ai_coach.adapter.http.dto.UpdateCourseRequest;
import co3065.ai_coach.adapter.http.response.CommandBuilder;
import co3065.ai_coach.adapter.http.response.CourseResponseBuilder;
import co3065.ai_coach.models.Course;
import co3065.ai_coach.usecase.CourseUseCase;
import co3065.ai_coach.usecase.types.CoursePageResult;
import co3065.ai_coach.usecase.types.CourseSearchCriteria;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller - HTTP Adapter cho Course
 * Trả về chuẩn ApiResponse format
 */
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseUseCase courseUseCase;

    public CourseController(CourseUseCase courseUseCase) {
        this.courseUseCase = courseUseCase;
    }

    /**
     * POST /api/courses - Tạo course mới
     * Response: { "error_code": 0, "message": "Success", "data": {...} }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> create(@RequestBody CreateCourseRequest request) {
        Course course = courseUseCase.create(CommandBuilder.toCreateCourseCommand(request));
        CourseResponse response = CourseResponseBuilder.toResponse(course);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course created successfully", response));
    }

    /**
     * GET /api/courses/{courseId} - Lấy course theo ID (detail)
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> detail(@PathVariable UUID courseId) {
        return courseUseCase.detail(courseId)
                .map(course -> ResponseEntity.ok(
                        ApiResponse.success(CourseResponseBuilder.toResponse(course))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "Course not found")));
    }

    /**
     * GET /api/courses - Lấy danh sách courses với search và pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CoursePageResult>> list(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) UUID instructorId,
            @RequestParam(required = false) Course.StructureType structureType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        CourseSearchCriteria criteria = new CourseSearchCriteria(title, instructorId, structureType, page, size);
        CoursePageResult result = courseUseCase.list(criteria);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * PUT /api/courses/{courseId} - Cập nhật course
     */
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> update(@PathVariable UUID courseId,
            @RequestBody UpdateCourseRequest request) {
        return courseUseCase.update(courseId, CommandBuilder.toUpdateCourseCommand(request))
                .map(course -> ResponseEntity.ok(
                        ApiResponse.success("Course updated successfully", CourseResponseBuilder.toResponse(course))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "Course not found")));
    }

    /**
     * DELETE /api/courses - Xóa nhiều courses
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> deletes(@RequestBody List<UUID> courseIds) {
        int deletedCount = courseUseCase.deletes(courseIds);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully deleted " + deletedCount + " course(s)"));
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