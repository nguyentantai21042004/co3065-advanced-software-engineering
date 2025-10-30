package co3065.ai_coach.adapter.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import co3065.ai_coach.adapter.http.dto.ApiResponse;
import co3065.ai_coach.adapter.http.dto.CreateTestRequest;
import co3065.ai_coach.adapter.http.dto.TestResponse;
import co3065.ai_coach.adapter.http.response.CommandBuilder;
import co3065.ai_coach.adapter.http.response.TestResponseBuilder;
import co3065.ai_coach.models.Test;
import co3065.ai_coach.usecase.TestUseCase;

import java.util.List;

/**
 * REST Controller - HTTP Adapter cho Test
 * Trả về chuẩn ApiResponse format
 */
@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestUseCase testUseCase;

    public TestController(TestUseCase testUseCase) {
        this.testUseCase = testUseCase;
    }

    /**
     * POST /api/tests - Tạo test mới
     * Response: { "error_code": 0, "message": "Success", "data": {...} }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TestResponse>> createTest(@RequestBody CreateTestRequest request) {
        Test test = testUseCase.createTest(CommandBuilder.toCreateTestCommand(request));
        TestResponse response = TestResponseBuilder.toResponse(test);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Test created successfully", response));
    }

    /**
     * GET /api/tests/{id} - Lấy test theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TestResponse>> getTestById(@PathVariable Long id) {
        return testUseCase.getTestById(id)
            .map(test -> ResponseEntity.ok(
                ApiResponse.success(TestResponseBuilder.toResponse(test))
            ))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, "Test not found")));
    }

    /**
     * GET /api/tests - Lấy tất cả tests
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TestResponse>>> getAllTests() {
        List<Test> tests = testUseCase.getAllTests();
        List<TestResponse> responses = TestResponseBuilder.toResponseList(tests);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * GET /api/tests/search?title={title} - Tìm test theo title
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TestResponse>>> searchTestsByTitle(@RequestParam String title) {
        List<Test> tests = testUseCase.getTestsByTitle(title);
        List<TestResponse> responses = TestResponseBuilder.toResponseList(tests);
        return ResponseEntity.ok(ApiResponse.success(responses));
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

