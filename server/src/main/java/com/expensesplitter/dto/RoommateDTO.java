package com.expensesplitter.dto;

import java.math.BigDecimal;

public class RoommateDTO {
    private Long id;
    private String name;
    private BigDecimal totalOwed;

    // Constructors
    public RoommateDTO() {}

    public RoommateDTO(Long id, String name, BigDecimal totalOwed) {
        this.id = id;
        this.name = name;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


}