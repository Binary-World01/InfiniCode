package com.codecollab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableAsync
public class CodeCollabApplication {
    public static void main(String[] args) {
        SpringApplication.run(CodeCollabApplication.class, args);
        System.out.println("""
            
            ╔═══════════════════════════════════════════╗
            ║     CodeCollab Backend Started! 🚀        ║
            ║     http://localhost:8080                 ║
            ║     H2 Console: /h2-console               ║
            ╚═══════════════════════════════════════════╝
            """);
    }
}
