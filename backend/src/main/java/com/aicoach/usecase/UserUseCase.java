package com.aicoach.usecase;

import com.aicoach.adapter.http.dto.LoginDto;
import org.springframework.http.ResponseEntity;

public interface UserUseCase {
    ResponseEntity<?> login (LoginDto loginDto);
}
