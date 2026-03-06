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
import java.util.Map;
import java.util.List;

@Slf4j
@Service
public class GeminiService {

    @Value("${ai.gemini.api-key}")
    private String sharedApiKey;

    @Value("${ai.gemini.base-url}")
    private String baseUrl;

    @Value("${ai.gemini.model}")
    private String model;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIResponse call(String systemPrompt, String userMessage, String userApiKey) throws Exception {
        String apiKey = (userApiKey != null) ? userApiKey : sharedApiKey;

        if (apiKey.contains("YOUR_") || apiKey.isBlank()) {
            throw new Exception("No valid Gemini API key configured");
        }

        String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;

        // Build Gemini request body
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", systemPrompt + "\n\n" + userMessage)))),
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 8192,
                        "topP", 0.8),
                "safetySettings", List.of(
                        Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_NONE"),
                        Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_NONE"),
                        Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_NONE"),
                        Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_NONE")));

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .timeout(Duration.ofSeconds(60))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            String body = response.body();
            if (response.statusCode() == 429)
                throw new Exception("Gemini rate limit exceeded");
            if (response.statusCode() == 400)
                throw new Exception("Gemini bad request: " + body);
            throw new Exception("Gemini error: " + response.statusCode() + " - " + body);
        }

        // Parse response
        Map<?, ?> responseMap = objectMapper.readValue(response.body(), Map.class);
        List<?> candidates = (List<?>) responseMap.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new Exception("Gemini returned no candidates");
        }

        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
        List<?> parts = (List<?>) content.get("parts");
        Map<?, ?> part = (Map<?, ?>) parts.get(0);
        String text = (String) part.get("text");

        AIResponse aiResponse = new AIResponse();
        aiResponse.setContent(text);
        aiResponse.setProvider("gemini");
        aiResponse.setModel(model);
        aiResponse.setSuccess(true);
        return aiResponse;
    }
}
