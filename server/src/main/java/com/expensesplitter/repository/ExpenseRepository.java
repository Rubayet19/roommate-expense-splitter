package com.expensesplitter.repository;

import com.expensesplitter.entity.Expense;
import com.expensesplitter.entity.Roommate;
import com.expensesplitter.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser(User user);
}