package com.codecollab.dto;

import lombok.Data;

@Data
public class ExecuteRequest {
    private String code;
    private String language; // java, python, javascript, cpp, go, rust
    private String input; // stdin for program
    private Long projectId;

    // Multi-file execution support
    private String mainFile;
    private java.util.List<FileNode> files;

    @Data
    public static class FileNode {
        private String path;
        private String content;
    }
}
