package com.expensesplitter.service;

import com.expensesplitter.dto.ExpenseDTO;
import com.expensesplitter.entity.*;
import com.expensesplitter.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseParticipantRepository expenseParticipantRepository;
    private final UserRepository userRepository;
    private final RoommateRepository roommateRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          ExpenseParticipantRepository expenseParticipantRepository,
                          UserRepository userRepository,
                          RoommateRepository roommateRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseParticipantRepository = expenseParticipantRepository;
        this.userRepository = userRepository;
        this.roommateRepository = roommateRepository;
    }

    @Transactional
    public Expense createExpense(ExpenseDTO expenseDTO, Long loggedInUserId) {
        User loggedInUser = userRepository.findById(loggedInUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense();
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(new BigDecimal(expenseDTO.getAmount()));
        expense.setDate(LocalDate.parse(expenseDTO.getDate()));
        expense.setSplitType(Expense.SplitType.valueOf(expenseDTO.getSplitType().toUpperCase()));

        // Determine payer(s)
        if (expenseDTO.getPaidBy().size() == 1) {
            Long payerId = expenseDTO.getPaidBy().get(0);
            if (payerId.equals(loggedInUserId)) {
                expense.setUser(loggedInUser);
                expense.setIsPayer(true);
            } else {
                Roommate payerRoommate = roommateRepository.findById(payerId)
                        .orElseThrow(() -> new RuntimeException("Roommate not found"));
                expense.setUser(loggedInUser);
                expense.setIsPayer(false);
            }
        } else {
            // If multiple payers, set the logged-in user as the reference user
            expense.setUser(loggedInUser);
            expense.setIsPayer(true);
        }

        Expense savedExpense = expenseRepository.save(expense);

        for (Map.Entry<Long, String> entry : expenseDTO.getSplitDetails().entrySet()) {
            Long participantId = entry.getKey();
            BigDecimal shareAmount = new BigDecimal(entry.getValue());

            Roommate roommate;
            if (participantId.equals(loggedInUserId)) {
                List<Roommate> userRoommates = roommateRepository.findByUser(loggedInUser);
                if (userRoommates.isEmpty()) {
                    Roommate newRoommate = new Roommate();
                    newRoommate.setUser(loggedInUser);
                    newRoommate.setName(loggedInUser.getUsername());
                    roommate = roommateRepository.save(newRoommate);
                } else {
                    roommate = userRoommates.get(0);
                }
            } else {
                roommate = roommateRepository.findById(participantId)
                        .orElseThrow(() -> new RuntimeException("Roommate not found"));
            }

            // Check if an ExpenseParticipant already exists for this expense and roommate
            Optional<ExpenseParticipant> existingParticipant = expenseParticipantRepository
                    .findByExpenseAndParticipant(savedExpense, roommate);

            if (existingParticipant.isPresent()) {
                // Update the existing participant's share amount
                ExpenseParticipant participant = existingParticipant.get();
                participant.setShareAmount(shareAmount);
                expenseParticipantRepository.save(participant);
            } else {
                // Create a new ExpenseParticipant
                ExpenseParticipant participant = new ExpenseParticipant();
                participant.setExpense(savedExpense);
                participant.setParticipant(roommate);
                participant.setShareAmount(shareAmount);
                expenseParticipantRepository.save(participant);
            }
        }

        return savedExpense;
    }

    public List<ExpenseDTO> getUserExpenses(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Expense> expenses = expenseRepository.findByUser(user);
        return expenses.stream().map(this::convertToDTO).toList();
    }

    public ExpenseDTO getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return convertToDTO(expense);
    }

    @Transactional
    public Expense updateExpense(Long id, ExpenseDTO expenseDTO) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(new BigDecimal(expenseDTO.getAmount()));
        expense.setDate(LocalDate.parse(expenseDTO.getDate()));
        expense.setSplitType(Expense.SplitType.valueOf(expenseDTO.getSplitType().toUpperCase()));

        // Update payer information
        if (expenseDTO.getPaidBy().size() == 1) {
            Long payerId = expenseDTO.getPaidBy().get(0);
            if (payerId.equals(expense.getUser().getId())) {
                expense.setIsPayer(true);
            } else {
                Roommate payerRoommate = roommateRepository.findById(payerId)
                        .orElseThrow(() -> new RuntimeException("Roommate not found"));
                expense.setUser(payerRoommate.getUser());
                expense.setIsPayer(false);
            }
        } else {
            // If multiple payers, keep the current user as the reference user
            expense.setIsPayer(true);
        }

        Expense updatedExpense = expenseRepository.save(expense);

        // Update ExpenseParticipant entries
        expenseParticipantRepository.deleteByExpense(updatedExpense);
        List<ExpenseParticipant> participants = new ArrayList<>();
        for (Map.Entry<Long, String> entry : expenseDTO.getSplitDetails().entrySet()) {
            ExpenseParticipant participant = new ExpenseParticipant();
            participant.setExpense(updatedExpense);
            Long participantId = entry.getKey();
            if (participantId.equals(updatedExpense.getUser().getId())) {
                Roommate userAsRoommate = new Roommate();
                userAsRoommate.setUser(updatedExpense.getUser());
                userAsRoommate.setName(updatedExpense.getUser().getUsername());
                participant.setParticipant(userAsRoommate);
            } else {
                participant.setParticipant(roommateRepository.findById(participantId)
                        .orElseThrow(() -> new RuntimeException("Roommate not found")));
            }
            participant.setShareAmount(new BigDecimal(entry.getValue()));
            participants.add(participant);
        }

        expenseParticipantRepository.saveAll(participants);

        return updatedExpense;
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Delete associated ExpenseParticipant entries
        expenseParticipantRepository.deleteByExpense(expense);

        // Delete the expense
        expenseRepository.delete(expense);
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount().toString());
        dto.setDate(expense.getDate().toString());
        dto.setSplitType(expense.getSplitType().toString().toLowerCase());

        List<Long> paidBy = new ArrayList<>();
        paidBy.add(expense.getUser().getId());
        dto.setPaidBy(paidBy);

        List<ExpenseParticipant> participants = expenseParticipantRepository.findByExpense(expense);
        Map<Long, String> splitDetails = new HashMap<>();
        List<Long> splitWith = new ArrayList<>();
        for (ExpenseParticipant participant : participants) {
            Long participantId = participant.getParticipant().getId();
            splitDetails.put(participantId, participant.getShareAmount().toString());
            splitWith.add(participantId);
        }
        dto.setSplitDetails(splitDetails);
        dto.setSplitWith(splitWith);

        return dto;
    }

    @Transactional
    public void deleteExpensesForRoommate(Long roommateId) {
        Roommate roommate = roommateRepository.findById(roommateId)
                .orElseThrow(() -> new RuntimeException("Roommate not found"));

        // Find all ExpenseParticipant entries for this roommate
        List<ExpenseParticipant> participations = expenseParticipantRepository.findByParticipantId(roommateId);

        // Delete all ExpenseParticipant entries for this roommate
        expenseParticipantRepository.deleteByParticipantId(roommateId);

        // Find all expenses where this roommate was the only participant and delete them
        for (ExpenseParticipant participation : participations) {
            Expense expense = participation.getExpense();
            List<ExpenseParticipant> expenseParticipants = expenseParticipantRepository.findByExpenseId(expense.getId());
            if (expenseParticipants.isEmpty()) {
                expenseRepository.delete(expense);
            }
        }
    }
}