package com.expensesplitter.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.util.StdConverter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExpenseDTO {
    private Long id;
    private String description;
    private String amount;
    private List<Long> paidBy;
    private List<Long> splitWith;
    private String splitType;
    private String date;

    @JsonDeserialize(converter = SplitDetailsConverter.class)
    private Map<Long, String> splitDetails;



    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public List<Long> getPaidBy() {
        return paidBy;
    }

    public void setPaidBy(List<Long> paidBy) {
        this.paidBy = paidBy;
    }

    public List<Long> getSplitWith() {
        return splitWith;
    }

    public void setSplitWith(List<Long> splitWith) {
        this.splitWith = splitWith;
    }

    public String getSplitType() {
        return splitType;
    }

    public void setSplitType(String splitType) {
        this.splitType = splitType;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Map<Long, String> getSplitDetails() {
        return splitDetails;
    }

    public void setSplitDetails(Map<Long, String> splitDetails) {
        this.splitDetails = splitDetails;
    }

    @Override
    public String toString() {
        return "ExpenseDTO{" +
                "id=" + id +
                ", description='" + description + '\'' +
                ", amount='" + amount + '\'' +
                ", paidBy=" + paidBy +
                ", splitWith=" + splitWith +
                ", splitType='" + splitType + '\'' +
                ", date='" + date + '\'' +
                ", splitDetails=" + splitDetails +
                '}';
    }

    public static class SplitDetailsConverter extends StdConverter<Map<String, String>, Map<Long, String>> {
        @Override
        public Map<Long, String> convert(Map<String, String> value) {
            Map<Long, String> result = new HashMap<>();
            for (Map.Entry<String, String> entry : value.entrySet()) {
                try {
                    Long key = Long.parseLong(entry.getKey());
                    result.put(key, entry.getValue());
                } catch (NumberFormatException e) {
                    // Skip invalid keys
                }
            }
            return result;
        }
    }
}