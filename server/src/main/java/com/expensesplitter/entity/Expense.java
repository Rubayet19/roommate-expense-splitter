package com.expensesplitter.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Entity
@Table(name = "expenses")
@Data
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("amount")
    @Column(nullable = false)
    private BigDecimal amount;

    @JsonProperty("description")
    private String description;

    @JsonProperty("date")
    private LocalDate date;
}
