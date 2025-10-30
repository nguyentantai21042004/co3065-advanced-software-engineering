package co3065.ai_coach.usecase;

import java.util.List;
import java.util.Optional;

import co3065.ai_coach.models.Test;
import co3065.ai_coach.usecase.types.CreateTestCommand;

/**
 * Test Use Case Interface - Tất cả use cases cho Test domain
 */
public interface TestUseCase {
    // Create
    Test createTest(CreateTestCommand command);
    
    // Query
    Optional<Test> getTestById(Long id);
    List<Test> getAllTests();
    List<Test> getTestsByTitle(String title);
}

