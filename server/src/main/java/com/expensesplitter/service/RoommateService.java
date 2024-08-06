package com.expensesplitter.service;

import com.expensesplitter.dto.RoommateDTO;
import com.expensesplitter.entity.Roommate;
import com.expensesplitter.entity.User;
import com.expensesplitter.repository.RoommateRepository;
import com.expensesplitter.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoommateService {

    private final RoommateRepository roommateRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;

    public RoommateService(RoommateRepository roommateRepository, UserRepository userRepository, ExpenseService expenseService) {
        this.roommateRepository = roommateRepository;
        this.userRepository = userRepository;
        this.expenseService = expenseService;
    }

    @Transactional
    public RoommateDTO addRoommate(String name, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Roommate roommate = new Roommate();
        roommate.setName(name);
        roommate.setUser(user);

        Roommate savedRoommate = roommateRepository.save(roommate);
        return convertToDTO(savedRoommate, userId);
    }

    private RoommateDTO convertToDTO(Roommate roommate, Long userId) {
        return new RoommateDTO(roommate.getId(), roommate.getName(), null);
    }

    @Transactional
    public void deleteRoommate(Long roommateId) {
        Roommate roommate = roommateRepository.findById(roommateId)
                .orElseThrow(() -> new RuntimeException("Roommate not found"));

        // Delete all expenses related to this roommate
        expenseService.deleteExpensesForRoommate(roommateId);

        roommateRepository.delete(roommate);
    }

    public List<RoommateDTO> getRoommates(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Roommate> roommates = roommateRepository.findByUser(user);
        return roommates.stream()
                .map(roommate -> convertToDTO(roommate, user.getId()))
                .collect(Collectors.toList());
    }

    public RoommateDTO getRoommate(Long roommateId, Long userId) {
        Roommate roommate = roommateRepository.findById(roommateId)
                .orElseThrow(() -> new RuntimeException("Roommate not found"));
        return convertToDTO(roommate, userId);
    }


}