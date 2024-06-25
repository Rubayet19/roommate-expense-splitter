package com.expensesplitter.service;

import com.expensesplitter.entity.Expense;
import com.expensesplitter.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense createExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    // Other methods for CRUD operations
}
