package co3065.ai_coach.adapter.http.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Chuẩn response format cho tất cả API responses
 * Tương tự Resp struct trong Go
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private int errorCode;
    private String message;
    private T data;
    private Object errors;

    // Private constructor - dùng builder pattern
    private ApiResponse(int errorCode, String message, T data, Object errors) {
        this.errorCode = errorCode;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    // Success response với data
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(0, "Success", data, null);
    }

    // Success response với custom message
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(0, message, data, null);
    }

    // Success response không có data
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(0, message, null, null);
    }

    // Error response
    public static <T> ApiResponse<T> error(int errorCode, String message) {
        return new ApiResponse<>(errorCode, message, null, null);
    }

    // Error response với validation errors
    public static <T> ApiResponse<T> error(int errorCode, String message, Object errors) {
        return new ApiResponse<>(errorCode, message, null, errors);
    }

    // Getters
    public int getErrorCode() {
        return errorCode;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public Object getErrors() {
        return errors;
    }
}

