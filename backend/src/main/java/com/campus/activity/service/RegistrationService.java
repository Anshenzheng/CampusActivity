package com.campus.activity.service;

import com.campus.activity.dto.PageResponse;
import com.campus.activity.dto.RegistrationResponse;
import com.campus.activity.dto.RegistrationStatusUpdateRequest;
import com.campus.activity.entity.Activity;
import com.campus.activity.entity.Registration;
import com.campus.activity.entity.RegistrationStatus;
import com.campus.activity.entity.User;
import com.campus.activity.repository.ActivityRepository;
import com.campus.activity.repository.RegistrationRepository;
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
public class RegistrationService {
    
    private final RegistrationRepository registrationRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public RegistrationResponse registerForActivity(Long activityId, String username) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (registrationRepository.existsByActivityAndUser(activity, user)) {
            throw new RuntimeException("您已报名此活动");
        }
        
        long approvedCount = registrationRepository.countByActivityAndStatus(
                activity, RegistrationStatus.APPROVED);
        if (activity.getMaxParticipants() != null && approvedCount >= activity.getMaxParticipants()) {
            throw new RuntimeException("活动人数已满");
        }
        
        var registration = Registration.builder()
                .activity(activity)
                .user(user)
                .status(RegistrationStatus.PENDING)
                .build();
        
        registrationRepository.save(registration);
        return toResponse(registration);
    }
    
    @Transactional
    public RegistrationResponse updateRegistrationStatus(
            Long registrationId, 
            RegistrationStatusUpdateRequest request,
            String username) {
        
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("报名记录不存在"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Activity activity = registration.getActivity();
        if (!activity.getOrganizer().getId().equals(user.getId())) {
            throw new RuntimeException("您没有权限审核此报名");
        }
        
        if (request.getStatus() == RegistrationStatus.APPROVED) {
            long approvedCount = registrationRepository.countByActivityAndStatus(
                    activity, RegistrationStatus.APPROVED);
            if (activity.getMaxParticipants() != null && approvedCount >= activity.getMaxParticipants()) {
                throw new RuntimeException("活动人数已满，无法批准");
            }
        }
        
        registration.setStatus(request.getStatus());
        registration.setReason(request.getReason());
        
        registrationRepository.save(registration);
        return toResponse(registration);
    }
    
    public PageResponse<RegistrationResponse> getMyRegistrations(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Registration> registrationPage = registrationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        
        List<RegistrationResponse> content = registrationPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<RegistrationResponse>builder()
                .content(content)
                .pageNumber(registrationPage.getNumber())
                .pageSize(registrationPage.getSize())
                .totalElements(registrationPage.getTotalElements())
                .totalPages(registrationPage.getTotalPages())
                .first(registrationPage.isFirst())
                .last(registrationPage.isLast())
                .build();
    }
    
    public PageResponse<RegistrationResponse> getRegistrationsByActivity(
            Long activityId, String username, int page, int size) {
        
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (!activity.getOrganizer().getId().equals(user.getId())) {
            throw new RuntimeException("您没有权限查看此活动的报名名单");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Registration> registrationPage = registrationRepository.findByActivityOrderByCreatedAtDesc(activity, pageable);
        
        List<RegistrationResponse> content = registrationPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<RegistrationResponse>builder()
                .content(content)
                .pageNumber(registrationPage.getNumber())
                .pageSize(registrationPage.getSize())
                .totalElements(registrationPage.getTotalElements())
                .totalPages(registrationPage.getTotalPages())
                .first(registrationPage.isFirst())
                .last(registrationPage.isLast())
                .build();
    }
    
    private RegistrationResponse toResponse(Registration registration) {
        return RegistrationResponse.builder()
                .id(registration.getId())
                .activityId(registration.getActivity().getId())
                .activityTitle(registration.getActivity().getTitle())
                .userId(registration.getUser().getId())
                .userRealName(registration.getUser().getRealName())
                .userEmail(registration.getUser().getEmail())
                .userPhone(registration.getUser().getPhone())
                .status(registration.getStatus())
                .reason(registration.getReason())
                .createdAt(registration.getCreatedAt())
                .build();
    }
}