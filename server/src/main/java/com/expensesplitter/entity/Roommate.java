package com.expensesplitter.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roommates")
@Data
public class Roommate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "userid")
    private User user;
}