package com.campus.activity.service;

import com.campus.activity.entity.Activity;
import com.campus.activity.entity.Registration;
import com.campus.activity.repository.ActivityRepository;
import com.campus.activity.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {
    
    private final RegistrationRepository registrationRepository;
    private final ActivityRepository activityRepository;
    
    public byte[] exportRegistrationsToExcel(Long activityId, String username) throws IOException {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        List<Registration> registrations = registrationRepository.findByActivity(activity);
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("报名名单");
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"序号", "姓名", "邮箱", "电话", "状态", "报名时间"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 20 * 256);
            }
            
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setAlignment(HorizontalAlignment.CENTER);
            
            int rowNum = 1;
            for (Registration registration : registrations) {
                Row row = sheet.createRow(rowNum++);
                
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(rowNum - 1);
                cell0.setCellStyle(dataStyle);
                
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(registration.getUser().getRealName());
                cell1.setCellStyle(dataStyle);
                
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(registration.getUser().getEmail());
                cell2.setCellStyle(dataStyle);
                
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(registration.getUser().getPhone() != null ? 
                        registration.getUser().getPhone() : "");
                cell3.setCellStyle(dataStyle);
                
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(getStatusText(registration.getStatus()));
                cell4.setCellStyle(dataStyle);
                
                Cell cell5 = row.createCell(5);
                cell5.setCellValue(registration.getCreatedAt().toString());
                cell5.setCellStyle(dataStyle);
            }
            
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private String getStatusText(Enum<?> status) {
        return switch (status.name()) {
            case "PENDING" -> "待审核";
            case "APPROVED" -> "已通过";
            case "REJECTED" -> "已拒绝";
            default -> status.name();
        };
    }
}