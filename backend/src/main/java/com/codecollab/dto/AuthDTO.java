package com.codecollab.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTO {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 20, message = "Username must be 3-20 characters")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        private String displayName;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private Long userId;
        private String username;
        private String email;
        private String displayName;
        private String avatarUrl;
        private int totalXp;
        private int streak;

        public AuthResponse(String token, Long userId, String username,
                String email, String displayName, String avatarUrl,
                int totalXp, int streak) {
            this.token = token;
            this.userId = userId;
            this.username = username;
            this.email = email;
            this.displayName = displayName;
            this.avatarUrl = avatarUrl;
            this.totalXp = totalXp;
            this.streak = streak;
        }
    }
}
