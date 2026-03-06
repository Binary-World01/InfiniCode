package com.codecollab.service;

import com.codecollab.dto.AIResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class OpenRouterService {

    @Value("${ai.openrouter.api-key}")
    private String sharedApiKey;

    @Value("${ai.openrouter.base-url}")
    private String baseUrl;

    @Value("${ai.openrouter.model}")
    private String model;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIResponse call(String systemPrompt, String userMessage, String userApiKey) throws Exception {
        String apiKey = (userApiKey != null) ? userApiKey : sharedApiKey;

        if (apiKey.contains("YOUR_") || apiKey.isBlank()) {
            throw new Exception("No valid OpenRouter API key configured");
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)),
                "temperature", 0.7,
                "max_tokens", 8192);

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "https://codecollab.app")
                .header("X-Title", "CodeCollab IDE")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .timeout(Duration.ofSeconds(120))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            if (response.statusCode() == 429)
                throw new Exception("OpenRouter rate limit exceeded");
            throw new Exception("OpenRouter error: " + response.statusCode() + " - " + response.body());
        }

        Map<?, ?> responseMap = objectMapper.readValue(response.body(), Map.class);
        List<?> choices = (List<?>) responseMap.get("choices");
        if (choices == null || choices.isEmpty())
            throw new Exception("OpenRouter returned no choices");

        Map<?, ?> choice = (Map<?, ?>) choices.get(0);
        Map<?, ?> message = (Map<?, ?>) choice.get("message");
        String content = (String) message.get("content");

        AIResponse aiResponse = new AIResponse();
        aiResponse.setContent(content);
        aiResponse.setProvider("openrouter");
        aiResponse.setModel(model);
        aiResponse.setSuccess(true);
        return aiResponse;
    }
}
