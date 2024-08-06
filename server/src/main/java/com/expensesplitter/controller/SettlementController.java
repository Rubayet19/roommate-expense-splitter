package com.expensesplitter.controller;

import com.expensesplitter.dto.SettlementDTO;
import com.expensesplitter.entity.Settlement;
import com.expensesplitter.entity.User;
import com.expensesplitter.service.SettlementService;
import com.expensesplitter.repository.UserRepository;
import com.expensesplitter.exception.ResourceNotFoundException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    private final SettlementService settlementService;
    private final UserRepository userRepository;

    public SettlementController(SettlementService settlementService, UserRepository userRepository) {
        this.settlementService = settlementService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Settlement> createSettlement(@RequestBody SettlementDTO settlementDTO) {
        Long loggedInUserId = getLoggedInUserId();
        Settlement settlement = settlementService.createSettlement(
                settlementDTO.getPayerId(),
                settlementDTO.getReceiverId(),
                settlementDTO.getAmount(),
                settlementDTO.getDate(),
                loggedInUserId
        );
        return new ResponseEntity<>(settlement, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Settlement> getSettlement(@PathVariable Long id) {
        try {
            Long loggedInUserId = getLoggedInUserId();
            Settlement settlement = settlementService.getSettlement(id, loggedInUserId);
            return ResponseEntity.ok(settlement);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/balance-summary")
    public ResponseEntity<Map<String, BigDecimal>> getBalanceSummary() {
        Long loggedInUserId = getLoggedInUserId();
        Map<String, BigDecimal> summary = settlementService.getUserBalanceSummary(loggedInUserId);
        return ResponseEntity.ok(summary);
    }
    @GetMapping("/balances-with-roommates")
    public ResponseEntity<Map<Long, BigDecimal>> getBalancesWithRoommates() {
        Long loggedInUserId = getLoggedInUserId();
        Map<Long, BigDecimal> balances = settlementService.getUserBalancesWithRoommates(loggedInUserId);
        return ResponseEntity.ok(balances);
    }

    @GetMapping
    public ResponseEntity<List<Settlement>> getUserSettlements() {
        Long loggedInUserId = getLoggedInUserId();
        List<Settlement> settlements = settlementService.getSettlementsByUser(loggedInUserId);
        return ResponseEntity.ok(settlements);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Settlement>> getSettlementsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long loggedInUserId = getLoggedInUserId();
        List<Settlement> settlements = settlementService.getSettlementsByUserAndDateRange(loggedInUserId, startDate, endDate);
        return ResponseEntity.ok(settlements);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Settlement> updateSettlement(@PathVariable Long id, @RequestBody SettlementDTO settlementDTO) {
        Long loggedInUserId = getLoggedInUserId();
        try {
            Settlement settlement = settlementService.updateSettlement(
                    id,
                    settlementDTO.getPayerId(),
                    settlementDTO.getReceiverId(),
                    settlementDTO.getAmount(),
                    settlementDTO.getDate(),
                    loggedInUserId
            );
            return ResponseEntity.ok(settlement);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSettlement(@PathVariable Long id) {
        Long loggedInUserId = getLoggedInUserId();
        try {
            settlementService.deleteSettlement(id, loggedInUserId);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/total-settled-amount")
    public ResponseEntity<BigDecimal> getTotalSettledAmount() {
        Long loggedInUserId = getLoggedInUserId();
        BigDecimal totalSettledAmount = settlementService.calculateTotalSettledAmount(loggedInUserId);
        return ResponseEntity.ok(totalSettledAmount);
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