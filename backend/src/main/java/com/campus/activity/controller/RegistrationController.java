package com.campus.activity.controller;

import com.campus.activity.dto.PageResponse;
import com.campus.activity.dto.RegistrationResponse;
import com.campus.activity.dto.RegistrationStatusUpdateRequest;
import com.campus.activity.service.ExportService;
import com.campus.activity.service.RegistrationService;
import com.campus.activity.service.StatisticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class RegistrationController {
    
    private final RegistrationService registrationService;
    private final StatisticsService statisticsService;
    private final ExportService exportService;
    
    @PostMapping("/activity/{activityId}")
    public ResponseEntity<RegistrationResponse> registerForActivity(
            @PathVariable Long activityId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(registrationService.registerForActivity(activityId, userDetails.getUsername()));
    }
    
    @PutMapping("/{registrationId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> updateRegistrationStatus(
            @PathVariable Long registrationId,
            @Valid @RequestBody RegistrationStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(registrationService.updateRegistrationStatus(
                registrationId, request, userDetails.getUsername()));
    }
    
    @GetMapping("/my")
    public ResponseEntity<PageResponse<RegistrationResponse>> getMyRegistrations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(registrationService.getMyRegistrations(userDetails.getUsername(), page, size));
    }
    
    @GetMapping("/activity/{activityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<RegistrationResponse>> getRegistrationsByActivity(
            @PathVariable Long activityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(registrationService.getRegistrationsByActivity(
                activityId, userDetails.getUsername(), page, size));
    }
    
    @GetMapping("/stats/activity/{activityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getActivityStatistics(
            @PathVariable Long activityId) {
        return ResponseEntity.ok(statisticsService.getActivityStatistics(activityId));
    }
    
    @GetMapping("/export/activity/{activityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportRegistrationsToExcel(
            @PathVariable Long activityId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        byte[] data = exportService.exportRegistrationsToExcel(activityId, userDetails.getUsername());
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=registrations.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }
}