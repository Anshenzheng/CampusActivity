package com.campus.activity.dto;

import com.campus.activity.entity.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private Long id;
    private Long activityId;
    private String activityTitle;
    private Long userId;
    private String userRealName;
    private String userEmail;
    private String userPhone;
    private RegistrationStatus status;
    private String reason;
    private LocalDateTime createdAt;
}