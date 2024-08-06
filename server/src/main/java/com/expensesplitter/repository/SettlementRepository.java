package com.expensesplitter.repository;

import com.expensesplitter.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    // Find settlements by payer ID
    List<Settlement> findByPayerId(Long payerId);

    // Find settlements by receiver ID
    List<Settlement> findByReceiverId(Long receiverId);

    // Find settlements where a user is either payer or receiver
    List<Settlement> findByPayerIdOrReceiverId(Long userId, Long sameUserId);

    // Find settlements by date range
    List<Settlement> findByDateBetween(LocalDate startDate, LocalDate endDate);

    // Find settlements by payer ID and date range
    List<Settlement> findByPayerIdAndDateBetween(Long payerId, LocalDate startDate, LocalDate endDate);

    // Find settlements by receiver ID and date range
    List<Settlement> findByReceiverIdAndDateBetween(Long receiverId, LocalDate startDate, LocalDate endDate);

    // Find settlements by payer ID or receiver ID and date range
    List<Settlement> findByPayerIdOrReceiverIdAndDateBetween(Long userId, Long sameUserId, LocalDate startDate, LocalDate endDate);
}