package com.expensesplitter.repository;

import com.expensesplitter.entity.Expense;
import com.expensesplitter.entity.ExpenseParticipant;
import com.expensesplitter.entity.Roommate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipant, Long> {
    List<ExpenseParticipant> findByExpense(Expense expense);
    List<ExpenseParticipant> findByParticipant(Roommate participant);
    void deleteByExpense(Expense expense);



    // New methods
    List<ExpenseParticipant> findByParticipantId(Long participantId);
    void deleteByParticipantId(Long participantId);
    List<ExpenseParticipant> findByExpenseId(Long expenseId);

    Optional<ExpenseParticipant> findByExpenseAndParticipant(Expense expense, Roommate participant);

    Optional<ExpenseParticipant> findByExpenseAndParticipantId(Expense updatedExpense, Long participantId);
}