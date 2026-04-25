package com.campus.activity.repository;

import com.campus.activity.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long>, JpaSpecificationExecutor<Activity> {
    
    Page<Activity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    List<Activity> findByStartDateAfter(LocalDate date);
}