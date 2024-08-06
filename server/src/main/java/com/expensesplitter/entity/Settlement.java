package com.expensesplitter.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "settlements")
@Data
public class Settlement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payer_id")
    private Long payerId;

    @Column(name = "receiver_id")
    private Long receiverId;

    @Column(precision = 38, scale = 2)
    private BigDecimal amount;

    private LocalDate date;
}