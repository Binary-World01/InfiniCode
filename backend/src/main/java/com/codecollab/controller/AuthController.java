package com.codecollab.controller;

import com.codecollab.dto.AuthDTO.*;
import com.codecollab.model.User;
import com.codecollab.repository.UserRepository;
import com.codecollab.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Simple in-memory rate limiter: IP → attempt count
    private final ConcurrentHashMap<String, AtomicInteger> loginAttempts = new ConcurrentHashMap<>();
    private static final int MAX_LOGIN_ATTEMPTS = 5;

    /**
     * Register new user with secure BCrypt password hashing.
     * Validates: unique email, unique username, password strength (via @Size).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest req,
            @RequestHeader(value = "X-Forwarded-For", defaultValue = "unknown") String clientIp) {

        // Check for existing accounts
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Username already taken"));
        }

        // Create user with hashed password
        User user = new User();
        user.setUsername(sanitize(req.getUsername()));
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setDisplayName(req.getDisplayName() != null ? sanitize(req.getDisplayName()) : req.getUsername());
        user.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + req.getUsername());
        user.setLastActive(LocalDateTime.now());
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getEmail(), saved.getId());

        log.info("New user registered: {}", saved.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, saved.getId(), saved.getUsername(),
                        saved.getEmail(), saved.getDisplayName(), saved.getAvatarUrl(),
                        saved.getTotalXp(), saved.getStreak()));
    }

    /**
     * Login with brute-force protection (5 attempts, then locked).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest req,
            @RequestHeader(value = "X-Forwarded-For", defaultValue = "unknown") String clientIp) {

        // Rate limiting check
        AtomicInteger attempts = loginAttempts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
        if (attempts.get() >= MAX_LOGIN_ATTEMPTS) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Too many login attempts. Please wait 15 minutes."));
        }

        var userOpt = userRepository.findByEmail(req.getEmail().toLowerCase().trim());
        if (userOpt.isEmpty() || !passwordEncoder.matches(req.getPassword(), userOpt.get().getPassword())) {
            attempts.incrementAndGet();
            log.warn("Failed login attempt from IP: {}", clientIp);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        // Reset attempts on success
        loginAttempts.remove(clientIp);

        User user = userOpt.get();
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getId());
        log.info("User logged in: {}", user.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getUsername(),
                user.getEmail(), user.getDisplayName(), user.getAvatarUrl(),
                user.getTotalXp(), user.getStreak()));
    }

    /**
     * Validate token and return user info.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No token"));
        }
        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired token"));
        }

        String email = jwtService.extractEmail(token);
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "displayName", user.getDisplayName(),
                        "avatarUrl", user.getAvatarUrl(),
                        "totalXp", user.getTotalXp(),
                        "streak", user.getStreak())))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }

    /**
     * Save user's API keys (stored hashed or plain — user's own keys).
     */
    @PutMapping("/keys")
    public ResponseEntity<?> updateApiKeys(
            @RequestBody Map<String, String> keys,
            @RequestHeader("Authorization") String authHeader) {

        if (!authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token))
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));

        Long userId = jwtService.extractUserId(token);
        return userRepository.findById(userId).map(user -> {
            if (keys.containsKey("geminiKey"))
                user.setGeminiApiKey(keys.get("geminiKey"));
            if (keys.containsKey("groqKey"))
                user.setGroqApiKey(keys.get("groqKey"));
            if (keys.containsKey("openrouterKey"))
                user.setOpenrouterApiKey(keys.get("openrouterKey"));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "API keys updated"));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    // XSS prevention — remove HTML tags from user input
    private String sanitize(String input) {
        return input == null ? "" : input.replaceAll("<[^>]*>", "").trim();
    }
}
