package com.codecollab.dto;

import lombok.Data;

@Data
public class AIRequest {
    private String prompt;
    private String task; // chat, review, complete, explain, generate, fix, translate
    private String code;
    private String language;
    private String context; // surrounding file context
    private String projectContext; // multi-file context
    private Long projectId;
}
