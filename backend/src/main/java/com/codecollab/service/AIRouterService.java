package com.codecollab.service;

import com.codecollab.dto.AIRequest;
import com.codecollab.dto.AIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIRouterService {

    private final GeminiService geminiService;
    private final GroqService groqService;
    private final OpenRouterService openRouterService;

    /**
     * Routes AI request through the waterfall chain:
     * 1. Gemini 2.0 Flash (user key → shared key)
     * 2. Groq llama-3.3-70b (user key → shared key)
     * 3. OpenRouter deepseek-r1:free
     * 4. Return LIMIT_REACHED if all fail
     */
    public AIResponse route(AIRequest request,
            String userGeminiKey,
            String userGroqKey,
            String userOpenrouterKey) {

        long start = System.currentTimeMillis();
        String systemPrompt = buildSystemPrompt(request);
        String userMessage = buildUserMessage(request);

        // 1️⃣ Try Gemini
        try {
            log.debug("Trying Gemini for task: {}", request.getTask());
            AIResponse response = geminiService.call(systemPrompt, userMessage,
                    userGeminiKey != null && !userGeminiKey.isBlank() ? userGeminiKey : null);
            response.setLatencyMs(System.currentTimeMillis() - start);
            log.debug("Gemini succeeded in {}ms", response.getLatencyMs());
            return response;
        } catch (Exception e) {
            log.warn("Gemini failed: {} - Falling back to Groq", e.getMessage());
        }

        // 2️⃣ Try Groq
        try {
            log.debug("Trying Groq for task: {}", request.getTask());
            AIResponse response = groqService.call(systemPrompt, userMessage,
                    userGroqKey != null && !userGroqKey.isBlank() ? userGroqKey : null);
            response.setLatencyMs(System.currentTimeMillis() - start);
            log.debug("Groq succeeded in {}ms", response.getLatencyMs());
            return response;
        } catch (Exception e) {
            log.warn("Groq failed: {} - Falling back to OpenRouter", e.getMessage());
        }

        // 3️⃣ Try OpenRouter (DeepSeek R1 free)
        try {
            log.debug("Trying OpenRouter for task: {}", request.getTask());
            AIResponse response = openRouterService.call(systemPrompt, userMessage,
                    userOpenrouterKey != null && !userOpenrouterKey.isBlank() ? userOpenrouterKey : null);
            response.setLatencyMs(System.currentTimeMillis() - start);
            log.debug("OpenRouter succeeded in {}ms", response.getLatencyMs());
            return response;
        } catch (Exception e) {
            log.error("All AI providers failed. Last error: {}", e.getMessage());
        }

        // 4️⃣ All failed
        AIResponse limitResponse = new AIResponse();
        limitResponse.setSuccess(false);
        limitResponse.setError("LIMIT_REACHED");
        limitResponse.setContent(
                "All AI providers have reached their limits. Please add your own API key in Settings to continue.");
        limitResponse.setLatencyMs(System.currentTimeMillis() - start);
        return limitResponse;
    }

    /**
     * Build a powerful system prompt based on the task type
     */
    private String buildSystemPrompt(AIRequest request) {
        String basePrompt = """
                You are CodeCollab AI, an expert coding assistant integrated into a professional cloud IDE.
                You are brilliant, concise, and always write production-quality code.
                Format code responses in markdown code blocks with the correct language tag.
                Be direct and helpful.
                """;

        return switch (request.getTask()) {
            case "review" -> basePrompt + """
                    Your role: Senior code reviewer. Analyze the provided code for:
                    1. Bugs and logical errors
                    2. Security vulnerabilities
                    3. Performance issues
                    4. Code quality and best practices
                    5. Suggest specific improvements with corrected code snippets.
                    """;
            case "explain" -> basePrompt + """
                    Your role: Expert teacher. Explain the provided code clearly:
                    - What it does (high level)
                    - How it works (step by step)
                    - Key concepts used
                    Keep explanations clear enough for a junior developer.
                    """;
            case "fix" -> basePrompt + """
                    Your role: Expert debugger. Find and fix the bug in the provided code.
                    Show the fixed code with brief explanation of what was wrong.
                    """;
            case "generate" -> basePrompt + """
                    Your role: Expert developer. Generate clean, production-ready code based on the description.
                    Include error handling and comments.
                    """;
            case "translate" -> basePrompt + """
                    Your role: Polyglot developer. Translate the code to the target language while:
                    - Maintaining exact functionality
                    - Using idiomatic patterns of the target language
                    - Preserving comments
                    """;
            case "document" -> basePrompt + """
                    Your role: Technical writer. Generate comprehensive documentation:
                    - Function/method documentation (JSDoc, JavaDoc, etc.)
                    - Parameter descriptions
                    - Return value descriptions
                    - Usage examples
                    """;
            case "test" -> basePrompt + """
                    Your role: QA engineer. Generate comprehensive unit tests:
                    - Happy path tests
                    - Edge cases
                    - Error cases
                    - Use appropriate testing framework for the language
                    """;
            case "refactor" -> basePrompt + """
                    Your role: Principal engineer. Refactor the code to be cleaner, more maintainable:
                    - Follow SOLID principles
                    - Reduce complexity
                    - Improve naming
                    - Keep behavior identical
                    """;
            case "interview" -> basePrompt + """
                    Your role: Technical interviewer. Analyze interview solution for:
                    - Correctness
                    - Time complexity (Big O)
                    - Space complexity
                    - Edge cases handled
                    - Code quality
                    - Score out of 100
                    """;
            case "complexity" -> basePrompt + """
                    Analyze the code and return:
                    - Cyclomatic complexity score
                    - Readability score (1-10)
                    - Maintainability index
                    - Key metrics: LOC, function count, max nesting depth
                    Return as structured analysis.
                    """;
            case "security" -> basePrompt + """
                    Your role: Security auditor (OWASP expert). Scan for:
                    - SQL injection vulnerabilities
                    - XSS vulnerabilities
                    - CSRF issues
                    - Insecure data handling
                    - Authentication flaws
                    - Rate each finding by severity (Critical/High/Medium/Low)
                    """;
            default -> basePrompt; // "chat" and anything else
        };
    }

    /**
     * Build the user message, including code context if provided
     */
    private String buildUserMessage(AIRequest request) {
        StringBuilder sb = new StringBuilder();

        if (request.getCode() != null && !request.getCode().isBlank()) {
            sb.append("```").append(request.getLanguage() != null ? request.getLanguage() : "").append("\n");
            sb.append(request.getCode()).append("\n```\n\n");
        }

        if (request.getProjectContext() != null && !request.getProjectContext().isBlank()) {
            sb.append("**Project context:**\n").append(request.getProjectContext()).append("\n\n");
        }

        if (request.getPrompt() != null && !request.getPrompt().isBlank()) {
            sb.append(request.getPrompt());
        }

        return sb.toString();
    }
}
