package com.aicoach.adapter.http;

import com.aicoach.adapter.http.dto.LoginDto;
import com.aicoach.usecase.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("sign-in")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        return this.userService.login(loginDto);
    }
}
