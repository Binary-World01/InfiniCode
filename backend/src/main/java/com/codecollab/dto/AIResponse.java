package com.codecollab.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIResponse {
    private String content;
    private String provider; // gemini, groq, openrouter
    private String model;
    private boolean success;
    private String error; // null on success, "LIMIT_REACHED" when all fail
    private long latencyMs;
}
