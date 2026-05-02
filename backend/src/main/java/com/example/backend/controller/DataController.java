package com.example.backend.controller;

import com.example.backend.model.Report;
import com.example.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "*") // Allows React frontend to connect
public class DataController {

    @Autowired
    private ReportRepository reportRepository;

    @GetMapping("/reports")
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @PostMapping("/reports")
    public ResponseEntity<?> createReport(@RequestBody Report report) {
        report.setTimestamp(LocalDateTime.now());
        if (report.getStatus() == null) {
            report.setStatus("Pending");
        }
        reportRepository.save(report);
        return ResponseEntity.ok(Map.of("message", "Report stored successfully in database", "id", report.getId()));
    }

    @PatchMapping("/reports/{id}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        return reportRepository.findById(id)
            .map(report -> {
                report.setStatus(newStatus);
                reportRepository.save(report);
                return ResponseEntity.ok(Map.of("message", "Status updated", "id", id, "status", newStatus));
            })
            .orElse(ResponseEntity.badRequest().body(Map.of("message", "Report not found")));
    }
}

