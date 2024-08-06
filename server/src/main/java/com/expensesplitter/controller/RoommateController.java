package com.expensesplitter.controller;

import com.expensesplitter.dto.RoommateDTO;
import com.expensesplitter.dto.AddRoommateDTO;
import com.expensesplitter.entity.User;
import com.expensesplitter.repository.UserRepository;
import com.expensesplitter.service.RoommateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roommates")
public class RoommateController {

    private final RoommateService roommateService;
    private final UserRepository userRepository;

    public RoommateController(RoommateService roommateService, UserRepository userRepository) {
        this.roommateService = roommateService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<RoommateDTO> addRoommate(@RequestBody AddRoommateDTO request) {
        Long userId = getLoggedInUserId();
        RoommateDTO createdRoommate = roommateService.addRoommate(request.getName(), userId);
        return new ResponseEntity<>(createdRoommate, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RoommateDTO>> getRoommates() {
        Long userId = getLoggedInUserId();
        List<RoommateDTO> roommates = roommateService.getRoommates(userId);
        return ResponseEntity.ok(roommates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoommateDTO> getRoommate(@PathVariable Long id) {
        Long userId = getLoggedInUserId();
        RoommateDTO roommate = roommateService.getRoommate(id, userId);
        return ResponseEntity.ok(roommate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoommate(@PathVariable Long id) {
        roommateService.deleteRoommate(id);
        return ResponseEntity.noContent().build();
    }

    private Long getLoggedInUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}