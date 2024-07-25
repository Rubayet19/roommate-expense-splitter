package com.expensesplitter.controller;

import com.expensesplitter.entity.User;
import com.expensesplitter.repository.UserRepository;
import com.expensesplitter.security.JwtUtil;
import com.expensesplitter.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth/")
@CrossOrigin(origins = "http://localhost:3000")
public class GoogleAuthController {

    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public GoogleAuthController(RestTemplate restTemplate, JwtUtil jwtUtil, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.restTemplate = restTemplate;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateGoogle(@RequestBody TokenRequest tokenRequest) {
        String googleToken = tokenRequest.getToken();

        // Verify the Google token
        String googleUserInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(googleToken);
        HttpEntity<String> entity = new HttpEntity<>("", headers);

        ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
                googleUserInfoEndpoint, HttpMethod.GET, entity, GoogleUserInfo.class);

        GoogleUserInfo userInfo = response.getBody();

        if (userInfo == null || userInfo.getEmail() == null) {
            return ResponseEntity.badRequest().body("Invalid Google token");
        }

        // Use email as username
        String username = userInfo.getEmail();

        // Check if the user exists in your database, if not, create a new user
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(username);
                    // Generate a random password for Google-authenticated users
                    String randomPassword = UUID.randomUUID().toString();
                    newUser.setPassword(passwordEncoder.encode(randomPassword));
                    return userRepository.save(newUser);
                });

        // Generate your application's JWT token
        String jwtToken = jwtUtil.generateToken(user.getUsername());

        // Return the JWT token
        return ResponseEntity.ok(new AuthResponse(jwtToken));
    }
}

class TokenRequest {
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

class GoogleUserInfo {
    private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}