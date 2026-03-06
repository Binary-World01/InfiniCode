package com.codecollab.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String displayName;
    private String avatarUrl;
    private String bio;
    private String githubUsername;

    @Column(columnDefinition = "TEXT")
    private String geminiApiKey;

    @Column(columnDefinition = "TEXT")
    private String groqApiKey;

    @Column(columnDefinition = "TEXT")
    private String openrouterApiKey;

    private int challengesSolved = 0;
    private int totalXp = 0;
    private int streak = 0;
    private LocalDateTime lastActive;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<Project> projects;
}
