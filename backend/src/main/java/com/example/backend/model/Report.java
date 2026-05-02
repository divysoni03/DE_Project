package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String citizenId;
    private String description;
    private Double locationLat;
    private Double locationLng;
    private String status;
    private LocalDateTime timestamp;
}
