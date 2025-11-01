package com.aicoach.adapter.http;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aicoach.adapter.http.dto.ApiResponse;
import com.aicoach.adapter.http.dto.LoginDto;
import com.aicoach.adapter.http.dto.RegisterDto;
import com.aicoach.models.User;
import com.aicoach.usecase.UserUseCase;

import java.util.HashMap;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for user registration and authentication")
@Slf4j
public class UserController {

    private final UserUseCase userUseCase;

    @Autowired
    public UserController(UserUseCase userUseCase) {
        this.userUseCase = userUseCase;
    }

    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        log.info("Login attempt for user: {}", loginDto.getEmail());
        return userUseCase.login(loginDto);
    }

    @Operation(summary = "Register user", description = "Register a new user account and return JWT token")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto registerDto) {
        log.info("Registration attempt for user: {}", registerDto.getEmail());
        try {
            // Register user and generate JWT token
            String token = userUseCase.registerUserAndGenerateToken(registerDto);
            
            // Create response with token and user info (without password)
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("email", registerDto.getEmail());
            
            return ResponseEntity.ok(ApiResponse.success("User registered successfully", responseData));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("Registration failed for user: {}", registerDto.getEmail(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "Registration failed"));
        }
    }
}
