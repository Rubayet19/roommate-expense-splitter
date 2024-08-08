package com.expensesplitter.dto;

import java.math.BigDecimal;

public class ExpenseParticipantDTO {
    private Long id;
    private Long expenseId;
    private Long participantId;
    private BigDecimal shareAmount;

    // Existing setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setExpenseId(Long id) {
        this.expenseId = id;
    }

    public void setParticipantId(Long id) {
        this.participantId = id;
    }

    public void setShareAmount(BigDecimal shareAmount) {
        this.shareAmount = shareAmount;
    }

    // Add these getter methods
    public Long getId() {
        return id;
    }

    public Long getExpenseId() {
        return expenseId;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public BigDecimal getShareAmount() {
        return shareAmount;
    }
}