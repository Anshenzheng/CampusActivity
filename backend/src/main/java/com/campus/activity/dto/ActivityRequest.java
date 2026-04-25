package com.campus.activity.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityRequest {
    
    @NotBlank(message = "活动标题不能为空")
    private String title;
    
    private String description;
    
    @NotNull(message = "开始日期不能为空")
    @Future(message = "开始日期必须是未来日期")
    private LocalDate startDate;
    
    @NotNull(message = "结束日期不能为空")
    private LocalDate endDate;
    
    private String location;
    
    private Integer maxParticipants;
}