package com.codecollab.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap.KeySetView;

/**
 * WebSocket controller for real-time collaboration.
 * Handles: code sync, cursor positions, chat, user presence.
 *
 * Clients subscribe to: /topic/room/{roomCode}
 * Clients send to: /app/collab/{roomCode}
 */
@Slf4j
@Controller
public class CollabWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Track active rooms: roomCode → set of userIds
    private final Map<String, Set<String>> activeRooms = new ConcurrentHashMap<>();

    /**
     * Code change broadcast — sends delta to all users in room
     */
    @MessageMapping("/collab/{roomCode}/code")
    public void handleCodeChange(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> change) {

        log.debug("Code change in room {}: {}", roomCode, change.get("type"));
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/code", change);
    }

    /**
     * Cursor position broadcast
     */
    @MessageMapping("/collab/{roomCode}/cursor")
    public void handleCursorChange(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> cursor) {

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/cursor", cursor);
    }

    /**
     * Chat message broadcast
     */
    @MessageMapping("/collab/{roomCode}/chat")
    public void handleChat(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> message) {

        log.debug("Chat in room {}: {}", roomCode, message.get("text"));
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/chat", message);
    }

    /**
     * User join notification
     */
    @MessageMapping("/collab/{roomCode}/join")
    public void handleJoin(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> userData) {

        String userId = (String) userData.get("userId");
        activeRooms.computeIfAbsent(roomCode, k -> ConcurrentHashMap.newKeySet()).add(userId);

        Map<String, Object> notification = Map.of(
                "type", "USER_JOINED",
                "userId", userId,
                "username", userData.getOrDefault("username", "Anonymous"),
                "avatar", userData.getOrDefault("avatar", ""),
                "activeUsers", activeRooms.getOrDefault(roomCode, Set.of()).size());

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/presence", notification);
        log.info("User {} joined room {}", userId, roomCode);
    }

    /**
     * User leave notification
     */
    @MessageMapping("/collab/{roomCode}/leave")
    public void handleLeave(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> userData) {

        String userId = (String) userData.get("userId");
        Set<String> room = activeRooms.get(roomCode);
        if (room != null)
            room.remove(userId);

        Map<String, Object> notification = Map.of(
                "type", "USER_LEFT",
                "userId", userId,
                "username", userData.getOrDefault("username", "Anonymous"),
                "activeUsers", activeRooms.getOrDefault(roomCode, Set.of()).size());

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/presence", notification);
        log.info("User {} left room {}", userId, roomCode);
    }

    /**
     * File selection broadcast (which file is a user viewing)
     */
    @MessageMapping("/collab/{roomCode}/file-select")
    public void handleFileSelect(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> fileData) {
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/file-select", fileData);
    }
}
