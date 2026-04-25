package com.campus.activity.service;

import com.campus.activity.entity.Activity;
import com.campus.activity.entity.RegistrationStatus;
import com.campus.activity.repository.ActivityRepository;
import com.campus.activity.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final ActivityRepository activityRepository;
    private final RegistrationRepository registrationRepository;
    
    public Map<String, Object> getActivityStatistics(Long activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("activityId", activity.getId());
        stats.put("activityTitle", activity.getTitle());
        stats.put("maxParticipants", activity.getMaxParticipants());
        
        long pendingCount = registrationRepository.countByActivityAndStatus(
                activity, RegistrationStatus.PENDING);
        long approvedCount = registrationRepository.countByActivityAndStatus(
                activity, RegistrationStatus.APPROVED);
        long rejectedCount = registrationRepository.countByActivityAndStatus(
                activity, RegistrationStatus.REJECTED);
        
        stats.put("pendingCount", pendingCount);
        stats.put("approvedCount", approvedCount);
        stats.put("rejectedCount", rejectedCount);
        stats.put("totalCount", pendingCount + approvedCount + rejectedCount);
        
        return stats;
    }
}