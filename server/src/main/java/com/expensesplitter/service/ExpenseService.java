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

        if (expense.getSplitType() == Expense.SplitType.EQUAL) {
            handleEqualSplit(expenseDTO, loggedInUserId, savedExpense, totalAmount);
        } else if (expense.getSplitType() == Expense.SplitType.CUSTOM) {
            handleCustomSplit(expenseDTO, loggedInUserId, savedExpense);
        }

        // Validate total amount
        BigDecimal totalPaid = expenseDTO.getSplitDetails().values().stream()
                .map(BigDecimal::new)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(totalAmount) != 0) {
            throw new RuntimeException("The sum of paid amounts (" + totalPaid + ") does not match the total expense amount (" + totalAmount + ")");
        }

        return savedExpense;
    }

    private void handleEqualSplit(ExpenseDTO expenseDTO, Long loggedInUserId, Expense savedExpense, BigDecimal totalAmount) {
        int participantCount = expenseDTO.getSplitDetails().size();
        BigDecimal equalShare = totalAmount.divide(new BigDecimal(participantCount), 2, RoundingMode.DOWN);
        BigDecimal remainder = totalAmount.subtract(equalShare.multiply(new BigDecimal(participantCount)));

        Map<Long, BigDecimal> preciseShares = new HashMap<>();
        for (Long participantId : expenseDTO.getSplitDetails().keySet()) {
            preciseShares.put(participantId, equalShare);
        }

        // Distribute the remainder cents
        for (int i = 0; i < remainder.multiply(new BigDecimal(100)).intValue(); i++) {
            Long participantId = (Long) preciseShares.keySet().toArray()[i % participantCount];
            preciseShares.put(participantId, preciseShares.get(participantId).add(new BigDecimal("0.01")));
        }

        BigDecimal userPaidAmount = new BigDecimal(expenseDTO.getSplitDetails().get(loggedInUserId));
        BigDecimal userShouldPay = preciseShares.get(loggedInUserId);

        boolean isMultiplePayers = expenseDTO.getPaidBy().size() > 1;

        if (isMultiplePayers) {
            handleMultiplePayers(expenseDTO, loggedInUserId, savedExpense, preciseShares, userPaidAmount, userShouldPay);
        } else {
            handleSinglePayer(expenseDTO, loggedInUserId, savedExpense, preciseShares, userPaidAmount, userShouldPay);
        }
    }

    private void handleCustomSplit(ExpenseDTO expenseDTO, Long loggedInUserId, Expense savedExpense) {
        Long payerId = expenseDTO.getPaidBy().get(0);

        if (payerId.equals(loggedInUserId)) {
            // User is the payer
            for (Map.Entry<Long, String> entry : expenseDTO.getSplitDetails().entrySet()) {
                Long participantId = entry.getKey();
                if (!participantId.equals(loggedInUserId)) {
                    BigDecimal participantShare = new BigDecimal(entry.getValue());
                    BigDecimal debt = participantShare.negate(); // User is owed this amount
                    saveExpenseParticipant(savedExpense, participantId, debt);
                }
            }
        } else {
            // Roommate is the payer
            BigDecimal userShare = new BigDecimal(expenseDTO.getSplitDetails().get(loggedInUserId));
            BigDecimal userDebt = userShare; // User owes this amount to the payer
            saveExpenseParticipant(savedExpense, payerId, userDebt);
        }
    }

    private void handleMultiplePayers(ExpenseDTO expenseDTO, Long loggedInUserId, Expense savedExpense,
                                      Map<Long, BigDecimal> preciseShares, BigDecimal userPaidAmount, BigDecimal userShouldPay) {
        for (Map.Entry<Long, String> entry : expenseDTO.getSplitDetails().entrySet()) {
            Long participantId = entry.getKey();
            if (!participantId.equals(loggedInUserId)) {
                BigDecimal participantPaidAmount = new BigDecimal(entry.getValue());
                BigDecimal participantShouldPay = preciseShares.get(participantId);

                BigDecimal userOwesParticipant = BigDecimal.ZERO;

                if (userPaidAmount.compareTo(userShouldPay) < 0) {
                    // User underpaid, might owe the participant
                    BigDecimal userUnderpayment = userShouldPay.subtract(userPaidAmount);
                    BigDecimal participantOverpayment = participantPaidAmount.subtract(participantShouldPay);
                    userOwesParticipant = participantOverpayment.min(userUnderpayment);
                } else if (participantPaidAmount.compareTo(participantShouldPay) < 0) {
                    // Participant underpaid, user might be owed
                    BigDecimal participantUnderpayment = participantShouldPay.subtract(participantPaidAmount);
                    BigDecimal userOverpayment = userPaidAmount.subtract(userShouldPay);
                    userOwesParticipant = participantUnderpayment.negate().max(userOverpayment.negate());
                }

                if (userOwesParticipant.compareTo(BigDecimal.ZERO) != 0) {
                    saveExpenseParticipant(savedExpense, participantId, userOwesParticipant);
                }
            }
        }
    }

    private void handleSinglePayer(ExpenseDTO expenseDTO, Long loggedInUserId, Expense savedExpense,
                                   Map<Long, BigDecimal> preciseShares, BigDecimal userPaidAmount, BigDecimal userShouldPay) {
        Long payerId = expenseDTO.getPaidBy().get(0);
        BigDecimal paidAmount = new BigDecimal(expenseDTO.getSplitDetails().get(payerId));

        if (payerId.equals(loggedInUserId)) {
            // User is the payer
            for (Map.Entry<Long, String> entry : expenseDTO.getSplitDetails().entrySet()) {
                Long participantId = entry.getKey();
                if (!participantId.equals(loggedInUserId)) {
                    BigDecimal participantShare = preciseShares.get(participantId);
                    BigDecimal debt = participantShare.negate(); // User is owed this amount
                    saveExpenseParticipant(savedExpense, participantId, debt);
                }
            }
        } else {
            // Roommate is the payer
            BigDecimal userShare = preciseShares.get(loggedInUserId);
            BigDecimal userDebt = userShare; // User owes this amount to the payer
            saveExpenseParticipant(savedExpense, payerId, userDebt);
        }
    }
    private void saveExpenseParticipant(Expense expense, Long participantId, BigDecimal amount) {
        Optional<Roommate> roommateOptional = roommateRepository.findById(participantId);

        if (roommateOptional.isPresent()) {
            Roommate roommate = roommateOptional.get();
            ExpenseParticipant participant = new ExpenseParticipant();
            participant.setExpense(expense);
            participant.setParticipant(roommate);
            participant.setShareAmount(amount);
            expenseParticipantRepository.save(participant);
        } else {
            // Handle the case where the participantId is not a roommate (might be the user)
            System.out.println("Participant with ID " + participantId + " is not a roommate. This might be the user.");
        }
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<Long, BigDecimal> balances = new HashMap<>();

        // Find the user's roommate representations
        List<Roommate> userRoommates = roommateRepository.findByUser(user);
        if (userRoommates.isEmpty()) {
            throw new RuntimeException("User's roommate representation not found");
        }

        // Get all expenses associated with the user
        List<Expense> userExpenses = expenseRepository.findByUser(user);

        for (Expense expense : userExpenses) {
            List<ExpenseParticipant> participants = expenseParticipantRepository.findByExpense(expense);

            for (ExpenseParticipant participant : participants) {
                Long roommateId = participant.getParticipant().getId();
                BigDecimal shareAmount = participant.getShareAmount();

                // Positive shareAmount means roommate is owed money by the user
                // We add it directly to the balance
                balances.merge(roommateId, shareAmount, BigDecimal::add);
            }
        }

        // Get expenses where the user is a participant (not the creator)
        for (Roommate userRoommate : userRoommates) {
            List<ExpenseParticipant> userParticipations = expenseParticipantRepository.findByParticipant(userRoommate);

            for (ExpenseParticipant participation : userParticipations) {
                Expense expense = participation.getExpense();
                Long payerId = expense.getUser().getId();
                BigDecimal shareAmount = participation.getShareAmount();

                // Negative shareAmount means user owes money to the payer
                // We negate it because from the user's perspective, it's money owed
                balances.merge(payerId, shareAmount.negate(), BigDecimal::add);
            }
        }

        // Adjust balances based on settlements (keeping the original logic)
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