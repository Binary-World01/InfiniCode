package com.codecollab.repository;

import com.codecollab.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId);

    List<Project> findByIsPublicTrueOrderByStarsDesc();

    Optional<Project> findByRoomCode(String roomCode);

    boolean existsByRoomCode(String roomCode);
}
