package com.expensesplitter.service;

import com.expensesplitter.entity.Settlement;
import com.expensesplitter.repository.RoommateRepository;
import com.expensesplitter.repository.SettlementRepository;
import com.expensesplitter.repository.UserRepository;
import com.expensesplitter.exception.ResourceNotFoundException;
import com.expensesplitter.exception.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettlementService {
    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;

    private final RoommateRepository roommateRepository;

    public SettlementService(SettlementRepository settlementRepository, UserRepository userRepository, RoommateRepository roommateRepository) {
        this.settlementRepository = settlementRepository;
        this.userRepository = userRepository;
        this.roommateRepository = roommateRepository;
    }

    @Transactional
    public Settlement createSettlement(Long payerId, Long receiverId, BigDecimal amount, LocalDate date, Long loggedInUserId) {
        // Check if payer and receiver are different
        if (payerId.equals(receiverId)) {
            throw new IllegalArgumentException("Payer and receiver must be different");
        }

        // Check if at least one party is the logged-in user
        if (!payerId.equals(loggedInUserId) && !receiverId.equals(loggedInUserId)) {
            throw new UnauthorizedException("You must be either the payer or the receiver in the settlement");
        }

        // Determine if payer and receiver are users or roommates
        boolean isPayerUser = userRepository.existsById(payerId);
        boolean isReceiverUser = userRepository.existsById(receiverId);

        // Verify that both payer and receiver exist
        if (isPayerUser) {
            userRepository.findById(payerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payer user not found"));
        } else {
            roommateRepository.findById(payerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payer roommate not found"));
        }

        if (isReceiverUser) {
            userRepository.findById(receiverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Receiver user not found"));
        } else {
            roommateRepository.findById(receiverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Receiver roommate not found"));
        }

        // Prevent settlements between two roommates
        if (!isPayerUser && !isReceiverUser) {
            throw new IllegalArgumentException("Settlements between two roommates are not allowed");
        }

        // Create and save the settlement
        Settlement settlement = new Settlement();
        settlement.setPayerId(payerId);
        settlement.setReceiverId(receiverId);
        settlement.setAmount(amount);
        settlement.setDate(date);
        return settlementRepository.save(settlement);
    }

    public Settlement getSettlement(Long id, Long loggedInUserId) {
        Settlement settlement = settlementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found"));

        if (!settlement.getPayerId().equals(loggedInUserId) && !settlement.getReceiverId().equals(loggedInUserId)) {
            throw new UnauthorizedException("You are not authorized to view this settlement");
        }

        return settlement;
    }

    public List<Settlement> getSettlementsByUser(Long userId) {
        return settlementRepository.findByPayerIdOrReceiverId(userId, userId);
    }

    public List<Settlement> getSettlementsByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return settlementRepository.findByPayerIdOrReceiverIdAndDateBetween(userId, userId, startDate, endDate);
    }

    @Transactional
    public Settlement updateSettlement(Long id, Long payerId, Long receiverId, BigDecimal amount, LocalDate date, Long loggedInUserId) {
        Settlement settlement = settlementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found"));

        // Check if the logged-in user is part of this settlement
        if (!settlement.getPayerId().equals(loggedInUserId) && !settlement.getReceiverId().equals(loggedInUserId)) {
            throw new UnauthorizedException("You are not authorized to update this settlement");
        }

        // Check if payer and receiver are different
        if (payerId.equals(receiverId)) {
            throw new IllegalArgumentException("Payer and receiver must be different");
        }

        // Check if at least one party is the logged-in user
        if (!payerId.equals(loggedInUserId) && !receiverId.equals(loggedInUserId)) {
            throw new UnauthorizedException("You must be either the payer or the receiver in the settlement");
        }

        // Determine if payer and receiver are users or roommates
        boolean isPayerUser = userRepository.existsById(payerId);
        boolean isReceiverUser = userRepository.existsById(receiverId);

        // Verify that both payer and receiver exist
        if (isPayerUser) {
            userRepository.findById(payerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payer user not found"));
        } else {
            roommateRepository.findById(payerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payer roommate not found"));
        }

        if (isReceiverUser) {
            userRepository.findById(receiverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Receiver user not found"));
        } else {
            roommateRepository.findById(receiverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Receiver roommate not found"));
        }

        // Prevent settlements between two roommates
        if (!isPayerUser && !isReceiverUser) {
            throw new IllegalArgumentException("Settlements between two roommates are not allowed");
        }

        // Update the settlement
        settlement.setPayerId(payerId);
        settlement.setReceiverId(receiverId);
        settlement.setAmount(amount);
        settlement.setDate(date);
        return settlementRepository.save(settlement);
    }

    @Transactional
    public void deleteSettlement(Long id, Long loggedInUserId) {
        Settlement settlement = settlementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found"));

        // Check if the logged-in user is part of this settlement
        if (!settlement.getPayerId().equals(loggedInUserId) && !settlement.getReceiverId().equals(loggedInUserId)) {
            throw new UnauthorizedException("You are not authorized to delete this settlement");
        }

        settlementRepository.delete(settlement);
    }

    public BigDecimal calculateTotalSettledAmount(Long userId) {
        List<Settlement> payerSettlements = settlementRepository.findByPayerId(userId);
        List<Settlement> receiverSettlements = settlementRepository.findByReceiverId(userId);

        BigDecimal totalPaid = payerSettlements.stream()
                .map(Settlement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalReceived = receiverSettlements.stream()
                .map(Settlement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalReceived.subtract(totalPaid);
    }

    public Map<String, BigDecimal> getUserBalanceSummary(Long userId) {
        List<Settlement> userSettlements = settlementRepository.findByPayerIdOrReceiverId(userId, userId);

        BigDecimal totalOwed = BigDecimal.ZERO;
        BigDecimal totalOwes = BigDecimal.ZERO;

        for (Settlement settlement : userSettlements) {
            if (settlement.getPayerId().equals(userId)) {
                totalOwes = totalOwes.add(settlement.getAmount());
            } else {
                totalOwed = totalOwed.add(settlement.getAmount());
            }
        }

        BigDecimal totalBalance = totalOwed.subtract(totalOwes);

        Map<String, BigDecimal> summary = new HashMap<>();
        summary.put("totalBalance", totalBalance);
        summary.put("totalOwed", totalOwed);
        summary.put("totalOwes", totalOwes);

        return summary;
    }

    public Map<Long, BigDecimal> getUserBalancesWithRoommates(Long userId) {
        List<Settlement> userSettlements = settlementRepository.findByPayerIdOrReceiverId(userId, userId);
        Map<Long, BigDecimal> balances = new HashMap<>();

        for (Settlement settlement : userSettlements) {
            Long otherUserId = settlement.getPayerId().equals(userId) ? settlement.getReceiverId() : settlement.getPayerId();
            BigDecimal amount = settlement.getAmount();

            if (settlement.getPayerId().equals(userId)) {
                amount = amount.negate(); // User paid, so they are owed this amount
            }

            balances.merge(otherUserId, amount, BigDecimal::add);
        }

        return balances;
    }
}