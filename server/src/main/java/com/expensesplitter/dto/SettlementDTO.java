package com.expensesplitter.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SettlementDTO {
    private Long payerId;
    private Long receiverId;
    private BigDecimal amount;
    private LocalDate date;

    // Getters and setters
    public Long getPayerId() { return payerId; }
    public void setPayerId(Long payerId) { this.payerId = payerId; }
    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}