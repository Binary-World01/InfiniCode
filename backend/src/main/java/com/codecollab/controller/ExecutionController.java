package com.codecollab.controller;

import com.codecollab.dto.ExecuteRequest;
import com.codecollab.service.CodeExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/execute")
@RequiredArgsConstructor
public class ExecutionController {

    private final CodeExecutionService executionService;

    /**
     * Execute code and return output.
     * Terminal history stored in cache per session.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> execute(
            @RequestBody ExecuteRequest request,
            @RequestHeader(value = "X-Session-Id", defaultValue = "default") String sessionId) {

        boolean noCode = (request.getCode() == null || request.getCode().isBlank());
        boolean noFiles = (request.getFiles() == null || request.getFiles().isEmpty());

        if (noCode && noFiles) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "stderr", "No code or files provided",
                    "stdout", ""));
        }

        CodeExecutionService.ExecuteResult result = executionService.execute(request, sessionId);

        return ResponseEntity.ok(Map.of(
                "success", result.isSuccess(),
                "stdout", result.getStdout(),
                "stderr", result.getStderr(),
                "executionTimeMs", result.getExecutionTimeMs(),
                "language", request.getLanguage()));
    }

    /**
     * Get terminal history for a session (from cache)
     */
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<Map<String, Object>> getHistory(@PathVariable String sessionId) {
        List<String> history = executionService.getHistory(sessionId);
        return ResponseEntity.ok(Map.of("history", history, "sessionId", sessionId));
    }

    /**
     * Clear terminal history for a session
     */
    @DeleteMapping("/history/{sessionId}")
    public ResponseEntity<Map<String, String>> clearHistory(@PathVariable String sessionId) {
        executionService.clearHistory(sessionId);
        return ResponseEntity.ok(Map.of("message", "History cleared", "sessionId", sessionId));
    }

    /**
     * Add a command to terminal history without executing
     * (for tracking manually typed terminal commands)
     */
    @PostMapping("/history/{sessionId}")
    public ResponseEntity<Map<String, String>> addHistory(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> body) {
        executionService.addToHistory(sessionId, body.getOrDefault("command", ""));
        return ResponseEntity.ok(Map.of("message", "Added to history"));
    }

    /**
     * Health check + supported languages
     */
    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> languages() {
        return ResponseEntity.ok(Map.of(
                "supported", List.of("java", "python", "javascript", "cpp", "go", "bash", "rust"),
                "dockerReady", false,
                "processExecution", true));
    }
}
