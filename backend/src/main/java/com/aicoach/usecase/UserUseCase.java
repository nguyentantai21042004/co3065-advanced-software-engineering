package com.aicoach.usecase;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.aicoach.adapter.http.dto.LoginDto;
import com.aicoach.adapter.http.dto.RegisterDto;
import com.aicoach.models.User;
import com.aicoach.usecase.service.UserService;
import com.aicoach.usecase.types.UserTypes.RegisterRequest;
import com.aicoach.usecase.types.UserTypes.LoginRequest;

@Service
public class UserUseCase {

    private final UserService userService;

    @Autowired
    public UserUseCase(UserService userService) {
        this.userService = userService;
    }

    public User registerUser(String email, String password) {
        return userService.register(new RegisterRequest(email, password));
    }

    public User registerUser(RegisterDto registerDto) {
        return userService.register(new RegisterRequest(registerDto.getEmail(), registerDto.getPassword()));
    }

    public String registerUserAndGenerateToken(RegisterDto registerDto) {
        User user = registerUser(registerDto);
        return userService.generateTokenForUser(user);
    }

    public User authenticateUser(String email, String password) {
        return userService.authenticate(new LoginRequest(email, password));
    }

    public ResponseEntity<?> login(LoginDto loginDto) {
        return userService.login(loginDto);
    }
}
