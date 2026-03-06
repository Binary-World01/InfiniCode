package com.codecollab.dto;

import lombok.Data;

@Data
public class ExecuteRequest {
    private String code;
    private String language; // java, python, javascript, cpp, go, rust
    private String input; // stdin for program
    private Long projectId;
}
