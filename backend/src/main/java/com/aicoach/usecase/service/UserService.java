package com.aicoach.usecase.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.aicoach.models.User;
import com.aicoach.usecase.types.UserTypes.RegisterRequest;
import com.aicoach.usecase.types.UserTypes.LoginRequest;
import com.aicoach.repository.postgresql.UserRepository;

import java.util.Optional;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    public User authenticate(LoginRequest req) {
        log.info("Authenticating user {}", req.getEmail());
        Optional<User> opt = userRepository.findByEmail(req.getEmail());
        if (opt.isEmpty()) return null;

        User user = opt.get();
        if (passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return user;
        }
        return null;
    }
}