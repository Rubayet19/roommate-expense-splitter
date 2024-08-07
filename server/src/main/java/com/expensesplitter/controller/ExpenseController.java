package com.expensesplitter.controller;

import com.expensesplitter.dto.ExpenseDTO;
import com.expensesplitter.entity.Expense;
import com.expensesplitter.entity.User;
import com.expensesplitter.repository.UserRepository;
import com.expensesplitter.service.ExpenseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    public ExpenseController(ExpenseService expenseService, UserRepository userRepository) {
        this.expenseService = expenseService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createExpense(@RequestBody ExpenseDTO expenseDTO) {
        try {
            System.out.println("Received ExpenseDTO: " + expenseDTO);

            Long loggedInUserId = getLoggedInUserId();
            System.out.println("Logged in user ID: " + loggedInUserId);
            System.out.println("PaidBy: " + expenseDTO.getPaidBy());
            System.out.println("SplitDetails: " + expenseDTO.getSplitDetails());

            Expense createdExpense = expenseService.createExpense(expenseDTO, loggedInUserId);
            return new ResponseEntity<>(createdExpense, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error creating expense: " + e.getMessage());
            return new ResponseEntity<>("Error creating expense: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    private String getRequestBody(HttpServletRequest request) {
        try {
            return request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
        } catch (IOException e) {
            return "Could not read request body";
        }
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getUserExpenses() {
        Long loggedInUserId = getLoggedInUserId();
        List<ExpenseDTO> expenses = expenseService.getUserExpenses(loggedInUserId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/balances")
    public ResponseEntity<Map<Long, BigDecimal>> getUserBalances() {
        Long loggedInUserId = getLoggedInUserId();
        Map<Long, BigDecimal> balances = expenseService.calculateBalances(loggedInUserId);
        return ResponseEntity.ok(balances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDTO> getExpense(@PathVariable Long id) {
        ExpenseDTO expense = expenseService.getExpenseById(id);
        return ResponseEntity.ok(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody ExpenseDTO expenseDTO) {
        Expense updatedExpense = expenseService.updateExpense(id, expenseDTO);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
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