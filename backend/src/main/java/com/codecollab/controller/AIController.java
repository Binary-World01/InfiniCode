package com.codecollab.controller;

import com.codecollab.dto.AIRequest;
import com.codecollab.dto.AIResponse;
import com.codecollab.service.AIRouterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIRouterService aiRouterService;

    /**
     * Main AI endpoint — handles ALL tasks:
     * chat, review, explain, fix, generate, translate, document, test, refactor,
     * interview, complexity, security, autocomplete
     */
    @PostMapping("/chat")
    public ResponseEntity<AIResponse> chat(
            @RequestBody AIRequest request,
            @RequestHeader(value = "X-User-Gemini-Key", required = false) String userGeminiKey,
            @RequestHeader(value = "X-User-Groq-Key", required = false) String userGroqKey,
            @RequestHeader(value = "X-User-Openrouter-Key", required = false) String userOpenrouterKey) {

        if (request.getTask() == null)
            request.setTask("chat");

        AIResponse response = aiRouterService.route(request, userGeminiKey, userGroqKey, userOpenrouterKey);
        return ResponseEntity.ok(response);
    }

    // Convenience endpoints (all route internally)
    @PostMapping("/review")
    public ResponseEntity<AIResponse> review(
            @RequestBody AIRequest request,
            @RequestHeader(value = "X-User-Gemini-Key", required = false) String gKey,
            @RequestHeader(value = "X-User-Groq-Key", required = false) String groqKey,
            @RequestHeader(value = "X-User-Openrouter-Key", required = false) String orKey) {
        request.setTask("review");
        return ResponseEntity.ok(aiRouterService.route(request, gKey, groqKey, orKey));
    }

    @PostMapping("/explain")
    public ResponseEntity<AIResponse> explain(
            @RequestBody AIRequest request,
            @RequestHeader(value = "X-User-Gemini-Key", required = false) String gKey,
            @RequestHeader(value = "X-User-Groq-Key", required = false) String groqKey,
            @RequestHeader(value = "X-User-Openrouter-Key", required = false) String orKey) {
        request.setTask("explain");
        return ResponseEntity.ok(aiRouterService.route(request, gKey, groqKey, orKey));
    }

    @PostMapping("/fix")
    public ResponseEntity<AIResponse> fix(
            @RequestBody AIRequest request,
            @RequestHeader(value = "X-User-Gemini-Key", required = false) String gKey,
            @RequestHeader(value = "X-User-Groq-Key", required = false) String groqKey,
            @RequestHeader(value = "X-User-Openrouter-Key", required = false) String orKey) {
        request.setTask("fix");
        return ResponseEntity.ok(aiRouterService.route(request, gKey, groqKey, orKey));
    }

    @PostMapping("/generate")
    public ResponseEntity<AIResponse> generate(
            @RequestBody AIRequest request,
            @RequestHeader(value = "X-User-Gemini-Key", required = false) String gKey,
            @RequestHeader(value = "X-User-Groq-Key", required = false) String groqKey,
            @RequestHeader(value = "X-User-Openrouter-Key", required = false) String orKey) {
        request.setTask("generate");
        return ResponseEntity.ok(aiRouterService.route(request, gKey, groqKey, orKey));
    }

    @PostMapping("/security-scan")
    public ResponseEntity<AIResponse> securityScan(
            @RequestBody AIRequest request,
            @RequestHeader(value = "X-User-Gemini-Key", required = false) String gKey,
            @RequestHeader(value = "X-User-Groq-Key", required = false) String groqKey,
            @RequestHeader(value = "X-User-Openrouter-Key", required = false) String orKey) {
        request.setTask("security");
        return ResponseEntity.ok(aiRouterService.route(request, gKey, groqKey, orKey));
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"ok\",\"service\":\"CodeCollab AI Router\"}");
    }
}
