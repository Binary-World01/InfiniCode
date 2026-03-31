package com.codecollab.service;

import com.codecollab.dto.ExecuteRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.*;
import java.util.concurrent.*;

/**
 * Code Execution Service
 * 
 * Executes code in isolated processes (or Docker containers in production).
 * Terminal history is cached in memory (Redis in production, ConcurrentHashMap
 * for local dev).
 * 
 * Supports: Java, Python, JavaScript (Node), C++, Go, Rust, Bash
 */
@Slf4j
@Service
public class CodeExecutionService {

    // In-memory terminal history cache: sessionId → command history list
    // In production this would be Redis
    private final Map<String, List<String>> terminalHistory = new ConcurrentHashMap<>();
    private final Map<String, List<String>> terminalOutput = new ConcurrentHashMap<>();

    // Language → Docker image mapping (for production Docker execution)
    private static final Map<String, String> DOCKER_IMAGES = Map.of(
            "java", "openjdk:17-slim",
            "python", "python:3.11-slim",
            "javascript", "node:20-slim",
            "cpp", "gcc:13",
            "go", "golang:1.21-alpine",
            "rust", "rust:1.74-slim",
            "bash", "alpine:latest");

    // Language → file extension mapping
    private static final Map<String, String> EXTENSIONS = Map.of(
            "java", "java",
            "python", "py",
            "javascript", "js",
            "cpp", "cpp",
            "go", "go",
            "rust", "rs",
            "bash", "sh");

    /**
     * Execute code and return result.
     * Uses process execution locally; replace with Docker SDK for production.
     */
    public ExecuteResult execute(ExecuteRequest request, String sessionId) {
        long startTime = System.currentTimeMillis();

        // Store command in history
        addToHistory(sessionId, "run " + request.getLanguage());

        try {
            String language = request.getLanguage().toLowerCase();

            ExecuteResult result = switch (language) {
                case "python" -> runWithProcess(request, "python3", ".py", sessionId);
                case "javascript", "js" -> runWithProcess(request, "node", ".js", sessionId);
                case "java" -> runJava(request, sessionId);
                case "cpp", "c++" -> runCpp(request, sessionId);
                case "go" -> runGo(request, sessionId);
                case "bash", "shell" -> runBash(request, sessionId);
                default -> new ExecuteResult("Language '" + language + "' not supported.", "", false, 0);
            };

            result.setExecutionTimeMs(System.currentTimeMillis() - startTime);

            // Cache output in history
            String output = result.getStdout()
                    + (result.getStderr().isEmpty() ? "" : "\n[stderr]: " + result.getStderr());
            addOutputToHistory(sessionId, output);

            return result;
        } catch (Exception e) {
            log.error("Execution error: {}", e.getMessage());
            return new ExecuteResult("", "Execution error: " + e.getMessage(), false,
                    System.currentTimeMillis() - startTime);
        }
    }

    private String getMainFilePath(ExecuteRequest request, String defaultExt) {
        String path = request.getMainFile();
        if (path == null || path.isEmpty()) return "Main" + defaultExt;
        if (path.startsWith("/")) path = path.substring(1);
        return path;
    }

    private void writeFilesToTempDir(ExecuteRequest request, File tmpDir) throws Exception {
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            for (ExecuteRequest.FileNode fn : request.getFiles()) {
                String path = fn.getPath();
                if (path == null || path.isEmpty()) continue;
                if (path.startsWith("/")) path = path.substring(1);
                File f = new File(tmpDir, path);
                f.getParentFile().mkdirs();
                try (FileWriter fw = new FileWriter(f)) {
                    fw.write(fn.getContent() != null ? fn.getContent() : "");
                }
            }
        } else if (request.getCode() != null) {
            String ext = EXTENSIONS.getOrDefault(request.getLanguage().toLowerCase(), "txt");
            String mainPath = getMainFilePath(request, "." + ext);
            File codeFile = new File(tmpDir, mainPath);
            codeFile.getParentFile().mkdirs();
            try (FileWriter fw = new FileWriter(codeFile)) {
                fw.write(request.getCode());
            }
        }
    }

    private void findFilesWithExtension(File dir, String ext, List<String> result) {
        File[] files = dir.listFiles();
        if (files == null) return;
        for (File f : files) {
            if (f.isDirectory()) {
                findFilesWithExtension(f, ext, result);
            } else if (f.getName().endsWith(ext)) {
                result.add(f.getAbsolutePath());
            }
        }
    }

    private ExecuteResult runWithProcess(ExecuteRequest request, String runner, String ext, String sessionId) throws Exception {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"), "codecollab_" + System.currentTimeMillis());
        tmpDir.mkdirs();
        writeFilesToTempDir(request, tmpDir);

        String mainFile = getMainFilePath(request, ext);
        String[] cmd = new String[] { runner, mainFile };
        return runProcess(cmd, request.getInput(), tmpDir, 30);
    }

    private ExecuteResult runGo(ExecuteRequest request, String sessionId) throws Exception {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"), "codecollab_go_" + System.currentTimeMillis());
        tmpDir.mkdirs();
        writeFilesToTempDir(request, tmpDir);
        String mainFile = getMainFilePath(request, ".go");
        return runProcess(new String[] { "go", "run", mainFile }, request.getInput(), tmpDir, 30);
    }

    private ExecuteResult runJava(ExecuteRequest request, String sessionId) throws Exception {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"), "codecollab_java_" + System.currentTimeMillis());
        tmpDir.mkdirs();
        writeFilesToTempDir(request, tmpDir);

        String mainFile = getMainFilePath(request, ".java");
        List<String> javaFiles = new ArrayList<>();
        findFilesWithExtension(tmpDir, ".java", javaFiles);

        if (javaFiles.isEmpty()) {
            return new ExecuteResult("", "No Java files found.", false, 0);
        }

        List<String> compileCmd = new ArrayList<>();
        compileCmd.add("javac");
        compileCmd.addAll(javaFiles);
        ExecuteResult compileResult = runProcess(compileCmd.toArray(new String[0]), "", tmpDir, 30);
        if (!compileResult.isSuccess()) {
            compileResult.setStderr("[Compilation Error]\n" + compileResult.getStderr());
            return compileResult;
        }

        String className = mainFile.replace("/", ".").replace(".java", "");
        return runProcess(new String[] { "java", "-cp", tmpDir.getAbsolutePath(), className }, request.getInput(), tmpDir, 30);
    }

    private ExecuteResult runCpp(ExecuteRequest request, String sessionId) throws Exception {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"), "codecollab_cpp_" + System.currentTimeMillis());
        tmpDir.mkdirs();
        writeFilesToTempDir(request, tmpDir);

        List<String> cppFiles = new ArrayList<>();
        findFilesWithExtension(tmpDir, ".cpp", cppFiles);
        
        if (cppFiles.isEmpty()) {
            return new ExecuteResult("", "No C++ files found to compile.", false, 0);
        }

        File outFile = new File(tmpDir, "main_exec");

        List<String> compileCmd = new ArrayList<>();
        compileCmd.add("g++");
        compileCmd.add("-o");
        compileCmd.add(outFile.getAbsolutePath());
        compileCmd.addAll(cppFiles);

        ExecuteResult compileResult = runProcess(compileCmd.toArray(new String[0]), "", tmpDir, 30);
        if (!compileResult.isSuccess()) {
            compileResult.setStderr("[Compilation Error]\n" + compileResult.getStderr());
            return compileResult;
        }

        return runProcess(new String[] { outFile.getAbsolutePath() }, request.getInput(), tmpDir, 30);
    }

    private ExecuteResult runBash(ExecuteRequest request, String sessionId) throws Exception {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"), "codecollab_bash_" + System.currentTimeMillis());
        tmpDir.mkdirs();
        writeFilesToTempDir(request, tmpDir);

        String mainFile = getMainFilePath(request, ".sh");
        File scriptFile = new File(tmpDir, mainFile);
        scriptFile.setExecutable(true);

        return runProcess(new String[] { "bash", mainFile }, request.getInput(), tmpDir, 15);
    }

    private ExecuteResult runProcess(String[] cmd, String stdin, File workDir, int timeoutSeconds) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.directory(workDir);
        pb.redirectErrorStream(false);

        Process process = pb.start();

        // Send stdin if provided
        if (stdin != null && !stdin.isEmpty()) {
            try (PrintWriter pw = new PrintWriter(process.getOutputStream())) {
                pw.println(stdin);
            }
        } else {
            process.getOutputStream().close();
        }

        // Read output with timeout
        ExecutorService executor = Executors.newFixedThreadPool(2);
        StringBuffer stdout = new StringBuffer();
        StringBuffer stderr = new StringBuffer();

        Future<?> stdoutFuture = executor.submit(() -> {
            try (BufferedReader rdr = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                int lineCount = 0;
                while ((line = rdr.readLine()) != null && lineCount < 500) {
                    stdout.append(line).append("\n");
                    lineCount++;
                }
            } catch (IOException ignored) {
            }
        });

        Future<?> stderrFuture = executor.submit(() -> {
            try (BufferedReader rdr = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                int lineCount = 0;
                while ((line = rdr.readLine()) != null && lineCount < 100) {
                    stderr.append(line).append("\n");
                    lineCount++;
                }
            } catch (IOException ignored) {
            }
        });

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            executor.shutdownNow();
            return new ExecuteResult("", "⏱ Execution timeout after " + timeoutSeconds + " seconds.", false, 0);
        }

        stdoutFuture.get(5, TimeUnit.SECONDS);
        stderrFuture.get(5, TimeUnit.SECONDS);
        executor.shutdown();

        int exitCode = process.exitValue();
        boolean success = exitCode == 0;

        return new ExecuteResult(stdout.toString(), stderr.toString(), success, 0);
    }

    // =================== Terminal History ===================

    public void addToHistory(String sessionId, String command) {
        terminalHistory.computeIfAbsent(sessionId, k -> new ArrayList<>()).add(command);
    }

    public void addOutputToHistory(String sessionId, String output) {
        terminalOutput.computeIfAbsent(sessionId, k -> new ArrayList<>()).add(output);
    }

    public List<String> getHistory(String sessionId) {
        return terminalHistory.getOrDefault(sessionId, new ArrayList<>());
    }

    public void clearHistory(String sessionId) {
        terminalHistory.remove(sessionId);
        terminalOutput.remove(sessionId);
    }

    // =================== Result DTO ===================

    public static class ExecuteResult {
        private String stdout;
        private String stderr;
        private boolean success;
        private long executionTimeMs;
        private String language;

        public ExecuteResult(String stdout, String stderr, boolean success, long ms) {
            this.stdout = stdout;
            this.stderr = stderr;
            this.success = success;
            this.executionTimeMs = ms;
        }

        // Getters and setters
        public String getStdout() {
            return stdout;
        }

        public String getStderr() {
            return stderr;
        }

        public boolean isSuccess() {
            return success;
        }

        public long getExecutionTimeMs() {
            return executionTimeMs;
        }

        public String getLanguage() {
            return language;
        }

        public void setStdout(String s) {
            this.stdout = s;
        }

        public void setStderr(String s) {
            this.stderr = s;
        }

        public void setSuccess(boolean b) {
            this.success = b;
        }

        public void setExecutionTimeMs(long ms) {
            this.executionTimeMs = ms;
        }

        public void setLanguage(String l) {
            this.language = l;
        }
    }
}
