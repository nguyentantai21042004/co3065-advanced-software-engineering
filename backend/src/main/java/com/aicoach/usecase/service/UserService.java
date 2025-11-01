package com.aicoach.usecase.service;

import com.aicoach.adapter.http.dto.ApiResponse;
import com.aicoach.adapter.http.dto.LoginDto;
import com.aicoach.security.JwtService;
import com.aicoach.usecase.UserUseCase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserUseCase {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    public ResponseEntity<?> login(LoginDto loginDto) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getEmail(),
                        loginDto.getPassword()
                )
        );

        String token = jwtService.generateToken(authentication.getName());

        return ResponseEntity.ok(ApiResponse.success(token));
    }
}
