package com.expensesplitter.service;

import com.expensesplitter.dto.ExpenseDTO;
import com.expensesplitter.entity.*;
import com.expensesplitter.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseParticipantRepository expenseParticipantRepository;
    private final UserRepository userRepository;
    private final RoommateRepository roommateRepository;

    private final SettlementRepository settlementRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          ExpenseParticipantRepository expenseParticipantRepository,
                          UserRepository userRepository,
                          RoommateRepository roommateRepository,
                          SettlementRepository settlementRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseParticipantRepository = expenseParticipantRepository;
        this.userRepository = userRepository;
        this.roommateRepository = roommateRepository;
        this.settlementRepository=settlementRepository;
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
        expense.setUser(loggedInUser);
        expense.setIsPayer(expenseDTO.getPaidBy().contains(loggedInUserId));

        Expense savedExpense = expenseRepository.save(expense);

        BigDecimal totalAmount = new BigDecimal(expenseDTO.getAmount());
        BigDecimal totalShares = BigDecimal.ZERO;

        for (Map.Entry<Long, String> entry : expenseDTO.getSplitDetails().entrySet()) {
            Long participantId = entry.getKey();
            BigDecimal shareAmount = new BigDecimal(entry.getValue());

            if (!participantId.equals(loggedInUserId)) {
                Roommate roommate = roommateRepository.findById(participantId)
                        .orElseThrow(() -> new RuntimeException("Roommate not found"));

                ExpenseParticipant participant = new ExpenseParticipant();
                participant.setExpense(savedExpense);
                participant.setParticipant(roommate);
                participant.setShareAmount(shareAmount);
                expenseParticipantRepository.save(participant);
            }

            totalShares = totalShares.add(shareAmount.abs());
        }

        // Calculate user's share
        BigDecimal userShare = totalAmount.subtract(totalShares);

        // Add user's share to totalShares
        totalShares = totalShares.add(userShare);

        // Validate that the shares add up to the total amount
        if (totalShares.setScale(2, RoundingMode.HALF_UP).compareTo(totalAmount.setScale(2, RoundingMode.HALF_UP)) != 0) {
            throw new RuntimeException("The sum of shares (" + totalShares + ") does not match the total expense amount (" + totalAmount + ")");
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
        expense.setIsPayer(expenseDTO.getPaidBy().contains(expense.getUser().getId()));

        Expense updatedExpense = expenseRepository.save(expense);

        // Update ExpenseParticipant entries
        expenseParticipantRepository.deleteByExpense(updatedExpense);

        for (Map.Entry<Long, String> entry : expenseDTO.getSplitDetails().entrySet()) {
            Long participantId = entry.getKey();
            BigDecimal shareAmount = new BigDecimal(entry.getValue());

            ExpenseParticipant participant = new ExpenseParticipant();
            participant.setExpense(updatedExpense);

            if (participantId.equals(updatedExpense.getUser().getId())) {
                List<Roommate> userRoommates = roommateRepository.findByUser(updatedExpense.getUser());
                if (userRoommates.isEmpty()) {
                    throw new RuntimeException("Roommate not found for expense creator");
                }
                participant.setParticipant(userRoommates.get(0));
            } else {
                participant.setParticipant(roommateRepository.findById(participantId)
                        .orElseThrow(() -> new RuntimeException("Roommate not found")));
            }

            participant.setShareAmount(shareAmount);
            expenseParticipantRepository.save(participant);
        }

        return updatedExpense;
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount().toString());
        dto.setDate(expense.getDate().toString());
        dto.setSplitType(expense.getSplitType().toString().toLowerCase());

        List<Long> paidBy = new ArrayList<>();
        Map<Long, String> splitDetails = new HashMap<>();
        List<Long> splitWith = new ArrayList<>();

        List<ExpenseParticipant> participants = expenseParticipantRepository.findByExpense(expense);
        for (ExpenseParticipant participant : participants) {
            Long participantId = participant.getParticipant().getId();
            BigDecimal shareAmount = participant.getShareAmount();

            splitDetails.put(participantId, shareAmount.toString());
            splitWith.add(participantId);

            if (shareAmount.compareTo(BigDecimal.ZERO) < 0) {
                paidBy.add(participantId);
            }
        }

        dto.setPaidBy(paidBy);
        dto.setSplitDetails(splitDetails);
        dto.setSplitWith(splitWith);

        return dto;
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

    public Map<Long, BigDecimal> calculateBalances(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Map<Long, BigDecimal> balances = new HashMap<>();

        // Calculate balances from expenses
        List<Expense> userExpenses = expenseRepository.findByUser(user);
        for (Expense expense : userExpenses) {
            List<ExpenseParticipant> participants = expenseParticipantRepository.findByExpense(expense);
            for (ExpenseParticipant participant : participants) {
                Long participantId = participant.getParticipant().getId();
                BigDecimal shareAmount = participant.getShareAmount();
                balances.merge(participantId, shareAmount, BigDecimal::add);
            }
        }

        // Adjust balances based on settlements
        List<Settlement> userSettlements = settlementRepository.findByPayerIdOrReceiverId(userId, userId);
        for (Settlement settlement : userSettlements) {
            if (settlement.getPayerId().equals(userId)) {
                // User paid, so reduce the balance
                balances.merge(settlement.getReceiverId(), settlement.getAmount().negate(), BigDecimal::add);
            } else {
                // User received, so increase the balance
                balances.merge(settlement.getPayerId(), settlement.getAmount(), BigDecimal::add);
            }
        }

        return balances;
    }
}