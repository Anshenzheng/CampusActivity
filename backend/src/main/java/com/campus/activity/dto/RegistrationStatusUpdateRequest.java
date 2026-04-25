package com.campus.activity.dto;

import com.campus.activity.entity.RegistrationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationStatusUpdateRequest {
    
    @NotNull(message = "状态不能为空")
    private RegistrationStatus status;
    
    private String reason;
}