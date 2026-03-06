package com.codecollab.controller;

import com.codecollab.model.Project;
import com.codecollab.model.User;
import com.codecollab.repository.ProjectRepository;
import com.codecollab.repository.UserRepository;
import com.codecollab.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<?> getMyProjects(@RequestHeader("Authorization") String auth) {
        Long userId = extractUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        List<Project> projects = projectRepository.findByOwnerIdOrderByUpdatedAtDesc(userId);
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    public ResponseEntity<?> createProject(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String auth) {

        Long userId = extractUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        User owner = userRepository.findById(userId).orElse(null);
        if (owner == null)
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));

        Project project = new Project();
        project.setName(sanitize(body.getOrDefault("name", "Untitled Project")));
        project.setDescription(sanitize(body.getOrDefault("description", "")));
        project.setLanguage(body.getOrDefault("language", "java"));
        project.setTemplate(body.getOrDefault("template", "blank"));
        project.setOwner(owner);
        project.setRoomCode(generateRoomCode());
        project.setPublic("true".equals(body.get("isPublic")));

        Project saved = projectRepository.save(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "name", saved.getName(),
                "language", saved.getLanguage(),
                "roomCode", saved.getRoomCode(),
                "createdAt", saved.getCreatedAt().toString()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        return projectRepository.findById(id).map(p -> {
            if (!p.isPublic()) {
                Long userId = extractUserId(auth);
                if (userId == null || !p.getOwner().getId().equals(userId))
                    return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            return ResponseEntity.ok(p);
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "Project not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, @RequestHeader("Authorization") String auth) {
        Long userId = extractUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return projectRepository.findById(id).map(p -> {
            if (!p.getOwner().getId().equals(userId))
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            projectRepository.delete(p);
            return ResponseEntity.ok(Map.of("message", "Project deleted"));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "Not found")));
    }

    @GetMapping("/join/{roomCode}")
    public ResponseEntity<?> joinByRoomCode(@PathVariable String roomCode) {
        return projectRepository.findByRoomCode(roomCode.toUpperCase())
                .map(p -> ResponseEntity
                        .ok(Map.of("projectId", p.getId(), "name", p.getName(), "language", p.getLanguage())))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "Room not found")));
    }

    @GetMapping("/public")
    public ResponseEntity<?> publicProjects() {
        return ResponseEntity.ok(projectRepository.findByIsPublicTrueOrderByStarsDesc());
    }

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token))
            return null;
        return jwtService.extractUserId(token);
    }

    private String sanitize(String s) {
        return s == null ? "" : s.replaceAll("<[^>]*>", "").trim();
    }

    private String generateRoomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++)
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            if (i < 2)
                sb.append('-');
        }
        String code = sb.toString();
        return projectRepository.existsByRoomCode(code) ? generateRoomCode() : code;
    }
}
