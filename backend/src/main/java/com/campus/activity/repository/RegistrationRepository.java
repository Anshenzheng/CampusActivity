package com.campus.activity.repository;

import com.campus.activity.entity.Activity;
import com.campus.activity.entity.Registration;
import com.campus.activity.entity.RegistrationStatus;
import com.campus.activity.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long>, JpaSpecificationExecutor<Registration> {
    
    boolean existsByActivityAndUser(Activity activity, User user);
    
    Optional<Registration> findByActivityAndUser(Activity activity, User user);
    
    Page<Registration> findByActivityOrderByCreatedAtDesc(Activity activity, Pageable pageable);
    
    List<Registration> findByActivity(Activity activity);
    
    Page<Registration> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Registration> findByActivityAndStatus(Activity activity, RegistrationStatus status);
    
    long countByActivityAndStatus(Activity activity, RegistrationStatus status);
    
    @Query("SELECT r FROM Registration r JOIN FETCH r.user JOIN FETCH r.activity WHERE r.activity = :activity")
    List<Registration> findByActivityWithDetails(@Param("activity") Activity activity);
}