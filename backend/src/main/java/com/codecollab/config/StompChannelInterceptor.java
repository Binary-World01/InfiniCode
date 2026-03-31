package com.codecollab.config;

import com.codecollab.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final com.codecollab.repository.ProjectRepository projectRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtService.isTokenValid(token)) {
                    String email = jwtService.extractEmail(token);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            email, null, Collections.emptyList()
                    );
                    accessor.setUser(authToken);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null && destination.startsWith("/topic/room/")) {
                // Extract room code
                String roomCode = extractRoomCode(destination);
                if (roomCode != null) {
                    if (!canAccessRoom(accessor.getUser(), roomCode)) {
                        log.warn("Unauthorized subscribe attempt to room: {}", roomCode);
                        return null; // Block subscription
                    }
                }
            }
        }

        return message;
    }

    private String extractRoomCode(String destination) {
        String[] parts = destination.split("/");
        if (parts.length >= 4) {
            return parts[3];
        }
        return null;
    }

    private boolean canAccessRoom(java.security.Principal principal, String roomCode) {
        var projectOpt = projectRepository.findByRoomCode(roomCode);
        if (projectOpt.isEmpty()) return false;
        
        var project = projectOpt.get();
        if (project.isPublic()) return true;
        
        if (principal == null) return false;
        
        // Check if user is owner
        String email = principal.getName();
        return project.getOwner().getEmail().equals(email);
    }
}
