package com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database.entity;

import com.g9latam.team14.recommendation.domain.model.Prioridad;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "recomendaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecomendacionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Prioridad priority;

    @Column(name = "title")
    private String title;

    @Column(name = "description", length = 400)
    private String description;

    @Column(name = "insight", length = 400)
    private String insight;

    @Column(name = "action_label")
    private String actionLabel;

    @Column(name = "impact_points")
    private int impactPoints;

    @Column(name = "completed")
    private boolean completed;

    @Column(name = "date")
    private LocalDate date;
}
