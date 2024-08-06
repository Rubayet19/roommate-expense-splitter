package com.expensesplitter.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "expense_participants")
@Data
public class ExpenseParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Roommate participant;

    @Column(precision = 38, scale = 2)
    private BigDecimal shareAmount;
}