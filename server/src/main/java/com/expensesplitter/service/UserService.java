package com.expensesplitter.service;

import com.expensesplitter.dto.UserDTO;
import com.expensesplitter.entity.User;
import com.expensesplitter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return convertToDTO(user);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        user.setUsername(userDTO.getUsername());
        // Note: We're not updating the password here. Password updates should be handled separately with proper encryption.

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UsernameNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        return dto;
    }

    // You might want to add more methods based on your application's needs, such as:

    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    @Transactional
    public UserDTO createUser(UserDTO userDTO, String password) {
        if (usernameExists(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(password); // Note: In a real application, you should encrypt this password

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }
}