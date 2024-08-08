package com.expensesplitter.service;

import com.expensesplitter.dto.ExpenseParticipantDTO;
import com.expensesplitter.entity.Expense;
import com.expensesplitter.entity.ExpenseParticipant;
import com.expensesplitter.repository.ExpenseParticipantRepository;
import com.expensesplitter.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseParticipantService {
    private final ExpenseParticipantRepository expenseParticipantRepository;
    private final ExpenseRepository expenseRepository;

    @Autowired
    public ExpenseParticipantService(ExpenseParticipantRepository expenseParticipantRepository,
                                     ExpenseRepository expenseRepository) {
        this.expenseParticipantRepository = expenseParticipantRepository;
        this.expenseRepository = expenseRepository;
    }

    public List<ExpenseParticipantDTO> getUserExpenseParticipants(Long userId) {
        // Use the new findByUserId method
        List<Expense> userExpenses = expenseRepository.findByUserId(userId);

        List<ExpenseParticipant> participants = new ArrayList<>();
        for (Expense expense : userExpenses) {
            participants.addAll(expenseParticipantRepository.findByExpense(expense));
        }

        return participants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ExpenseParticipantDTO convertToDTO(ExpenseParticipant participant) {
        ExpenseParticipantDTO dto = new ExpenseParticipantDTO();
        dto.setId(participant.getId());
        dto.setExpenseId(participant.getExpense().getId());
        dto.setParticipantId(participant.getParticipant().getId());
        dto.setShareAmount(participant.getShareAmount());
        return dto;
    }
}
