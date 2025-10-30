package co3065.ai_coach.adapter.http.response;

import co3065.ai_coach.adapter.http.dto.CreateChapterRequest;
import co3065.ai_coach.adapter.http.dto.CreateContentUnitRequest;
import co3065.ai_coach.adapter.http.dto.CreateContentVersionRequest;
import co3065.ai_coach.adapter.http.dto.CreateCourseRequest;
import co3065.ai_coach.adapter.http.dto.CreateTestRequest;
import co3065.ai_coach.adapter.http.dto.UpdateChapterRequest;
import co3065.ai_coach.adapter.http.dto.UpdateContentUnitRequest;
import co3065.ai_coach.adapter.http.dto.UpdateContentVersionRequest;
import co3065.ai_coach.adapter.http.dto.UpdateCourseRequest;
import co3065.ai_coach.usecase.types.CreateChapterCommand;
import co3065.ai_coach.usecase.types.CreateContentUnitCommand;
import co3065.ai_coach.usecase.types.CreateContentVersionCommand;
import co3065.ai_coach.usecase.types.CreateCourseCommand;
import co3065.ai_coach.usecase.types.CreateTestCommand;
import co3065.ai_coach.usecase.types.UpdateChapterCommand;
import co3065.ai_coach.usecase.types.UpdateContentUnitCommand;
import co3065.ai_coach.usecase.types.UpdateContentVersionCommand;
import co3065.ai_coach.usecase.types.UpdateCourseCommand;

/**
 * Command Builder
 * Chuyển đổi từ Request DTO → Command
 */
public class CommandBuilder {

    /**
     * CreateTestRequest → CreateTestCommand
     */
    public static CreateTestCommand toCreateTestCommand(CreateTestRequest request) {
        return new CreateTestCommand(
                request.getTitle(),
                request.getDescription(),
                request.getDuration(),
                request.getMaxScore());
    }

    /**
     * CreateCourseRequest → CreateCourseCommand
     */
    public static CreateCourseCommand toCreateCourseCommand(CreateCourseRequest request) {
        return new CreateCourseCommand(
                request.getTitle(),
                request.getDescription(),
                request.getInstructorId(),
                request.getStructureType());
    }

    /**
     * UpdateCourseRequest → UpdateCourseCommand
     */
    public static UpdateCourseCommand toUpdateCourseCommand(UpdateCourseRequest request) {
        return new UpdateCourseCommand(
                request.getTitle(),
                request.getDescription(),
                request.getStructureType());
    }

    /**
     * CreateChapterRequest → CreateChapterCommand
     */
    public static CreateChapterCommand toCreateChapterCommand(CreateChapterRequest request) {
        return new CreateChapterCommand(
                request.getCourseId(),
                request.getSequenceNumber());
    }

    /**
     * UpdateChapterRequest → UpdateChapterCommand
     */
    public static UpdateChapterCommand toUpdateChapterCommand(UpdateChapterRequest request) {
        return new UpdateChapterCommand(
                request.getSequenceNumber());
    }

    /**
     * CreateContentUnitRequest → CreateContentUnitCommand
     */
    public static CreateContentUnitCommand toCreateContentUnitCommand(CreateContentUnitRequest request) {
        return new CreateContentUnitCommand(
                request.getChapterId(),
                request.getUnitType(),
                request.getMetadataConfig());
    }

    /**
     * UpdateContentUnitRequest → UpdateContentUnitCommand
     */
    public static UpdateContentUnitCommand toUpdateContentUnitCommand(UpdateContentUnitRequest request) {
        return new UpdateContentUnitCommand(
                request.getUnitType(),
                request.getMetadataConfig());
    }

    /**
     * CreateContentVersionRequest → CreateContentVersionCommand
     */
    public static CreateContentVersionCommand toCreateContentVersionCommand(CreateContentVersionRequest request) {
        return new CreateContentVersionCommand(
                request.getUnitId(),
                request.getVersionNumber(),
                request.getContentData(),
                request.isActive());
    }

    /**
     * UpdateContentVersionRequest → UpdateContentVersionCommand
     */
    public static UpdateContentVersionCommand toUpdateContentVersionCommand(UpdateContentVersionRequest request) {
        return new UpdateContentVersionCommand(
                request.getVersionNumber(),
                request.getContentData(),
                request.getIsActive());
    }
}
