package com.expensesplitter.repository;

import com.expensesplitter.entity.Roommate;
import com.expensesplitter.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoommateRepository extends JpaRepository<Roommate, Long> {
    List<Roommate> findByUser(User user);

    List<Roommate> findByUserId(Long userId);

}