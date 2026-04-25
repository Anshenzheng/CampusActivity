package com.campus.activity.service;

import com.campus.activity.dto.ActivityRequest;
import com.campus.activity.dto.ActivityResponse;
import com.campus.activity.dto.PageResponse;
import com.campus.activity.entity.Activity;
import com.campus.activity.entity.User;
import com.campus.activity.repository.ActivityRepository;
import com.campus.activity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {
    
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ActivityResponse createActivity(ActivityRequest request, String organizerUsername) {
        User organizer = userRepository.findByUsername(organizerUsername)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        var activity = Activity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .location(request.getLocation())
                .maxParticipants(request.getMaxParticipants())
                .organizer(organizer)
                .build();
        
        activityRepository.save(activity);
        return toResponse(activity);
    }
    
    @Transactional
    public ActivityResponse updateActivity(Long id, ActivityRequest request, String username) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (!activity.getOrganizer().getId().equals(user.getId())) {
            throw new RuntimeException("您没有权限修改此活动");
        }
        
        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setStartDate(request.getStartDate());
        activity.setEndDate(request.getEndDate());
        activity.setLocation(request.getLocation());
        activity.setMaxParticipants(request.getMaxParticipants());
        
        activityRepository.save(activity);
        return toResponse(activity);
    }
    
    @Transactional
    public void deleteActivity(Long id, String username) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (!activity.getOrganizer().getId().equals(user.getId())) {
            throw new RuntimeException("您没有权限删除此活动");
        }
        
        activityRepository.delete(activity);
    }
    
    public ActivityResponse getActivityById(Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        return toResponse(activity);
    }
    
    public PageResponse<ActivityResponse> getAllActivities(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Activity> activityPage = activityRepository.findAll(pageable);
        
        List<ActivityResponse> content = activityPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<ActivityResponse>builder()
                .content(content)
                .pageNumber(activityPage.getNumber())
                .pageSize(activityPage.getSize())
                .totalElements(activityPage.getTotalElements())
                .totalPages(activityPage.getTotalPages())
                .first(activityPage.isFirst())
                .last(activityPage.isLast())
                .build();
    }
    
    private ActivityResponse toResponse(Activity activity) {
        return ActivityResponse.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .description(activity.getDescription())
                .startDate(activity.getStartDate())
                .endDate(activity.getEndDate())
                .location(activity.getLocation())
                .maxParticipants(activity.getMaxParticipants())
                .organizerId(activity.getOrganizer().getId())
                .organizerName(activity.getOrganizer().getRealName())
                .createdAt(activity.getCreatedAt())
                .updatedAt(activity.getUpdatedAt())
                .build();
    }
}