package com.homepal.controller;

import com.homepal.dto.AuthResponse;
import com.homepal.dto.LoginRequest;
import com.homepal.dto.UserRegistrationRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserRegistrationRequest request) {
        return ResponseEntity.ok(new AuthResponse("demo-access-token", "demo-refresh-token", null, null));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(new AuthResponse("demo-access-token", "demo-refresh-token", null, null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh() {
        return ResponseEntity.ok(new AuthResponse("demo-access-token", "demo-refresh-token", null, null));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
