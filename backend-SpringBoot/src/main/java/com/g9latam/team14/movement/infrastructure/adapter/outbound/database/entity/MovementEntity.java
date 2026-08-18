package com.g9latam.team14.movement.infrastructure.adapter.outbound.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovementEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "description")
    private String description;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "type")
    private String type;

    @Column(name = "category")
    private String category;

    @Column(name = "regularity")
    private String regularity;

    @Column(name = "movement_date")
    private String date;

    @Column(name = "note")
    private String note;

    @Column(name = "user_id")
    private Integer userId;
}
