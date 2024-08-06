package com.expensesplitter.dto;

public class UserDTO {
    private Long id;
    private String username;

    // Default constructor
    public UserDTO() {}

    // Constructor with all fields
    public UserDTO(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // toString method for easy logging/debugging
    @Override
    public String toString() {
        return "UserDTO{" +
                "id=" + id +
                ", username='" + username + '\'' +
                '}';
    }

    // You might want to add equals and hashCode methods if you plan to use this in collections
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        UserDTO userDTO = (UserDTO) o;

        if (id != null ? !id.equals(userDTO.id) : userDTO.id != null) return false;
        return username != null ? username.equals(userDTO.username) : userDTO.username == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (username != null ? username.hashCode() : 0);
        return result;
    }
}