package com.aicoach.usecase.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.aicoach.adapter.http.dto.ApiResponse;
import com.aicoach.adapter.http.dto.LoginDto;
import com.aicoach.models.User;
import com.aicoach.repository.postgresql.UserRepository;
import com.aicoach.security.JwtService;
import com.aicoach.usecase.types.UserTypes.RegisterRequest;
import com.aicoach.usecase.types.UserTypes.LoginRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Autowired
    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User register(RegisterRequest req) {
        log.info("Registering user {}", req.getEmail());

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        String hashed = passwordEncoder.encode(req.getPassword());
        User user = User.builder()
                .email(req.getEmail())
                .password(hashed)
                .build();

        return userRepository.save(user);
    }

    public String generateTokenForUser(User user) {
        return jwtService.generateToken(user.getEmail());
    }

    public User authenticate(LoginRequest req) {
        log.info("Authenticating user {}", req.getEmail());
        Optional<User> opt = userRepository.findByEmail(req.getEmail());
        if (opt.isEmpty())
            return null;

        User user = opt.get();
        if (passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return user;
        }
        return null;
    }

    public ResponseEntity<?> login(LoginDto loginDto) {
        try {
            // Use the authenticate method to verify credentials
            User user = authenticate(new LoginRequest(loginDto.getEmail(), loginDto.getPassword()));

            if (user == null) {
                log.warn("Login failed: Invalid credentials for user: {}", loginDto.getEmail());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(401, "Invalid email or password"));
            }

            // Generate JWT token using user email
            String token = jwtService.generateToken(user.getEmail());

            // Create response with token in data field
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("email", user.getEmail());

            return ResponseEntity.ok(ApiResponse.success("Login successful", responseData));
        } catch (Exception e) {
            log.error("Login failed for user: {}", loginDto.getEmail(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(401, "Invalid email or password"));
        }
    }
}
