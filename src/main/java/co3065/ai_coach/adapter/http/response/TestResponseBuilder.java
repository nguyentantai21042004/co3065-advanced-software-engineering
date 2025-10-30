package co3065.ai_coach.adapter.http.response;

import java.util.List;
import java.util.stream.Collectors;

import co3065.ai_coach.adapter.http.dto.TestResponse;
import co3065.ai_coach.models.Test;

/**
 * Response Builder cho Test
 * Chuyển đổi từ Domain → Response DTO
 */
public class TestResponseBuilder {

    /**
     * Chuyển Domain Test → TestResponse DTO
     */
    public static TestResponse toResponse(Test test) {
        return new TestResponse(
            test.getId(),
            test.getTitle(),
            test.getDescription(),
            test.getDuration(),
            test.getMaxScore(),
            test.getCreatedAt(),
            test.getUpdatedAt()
        );
    }

    /**
     * Chuyển List Domain Test → List TestResponse DTO
     */
    public static List<TestResponse> toResponseList(List<Test> tests) {
        return tests.stream()
            .map(TestResponseBuilder::toResponse)
            .collect(Collectors.toList());
    }
}

