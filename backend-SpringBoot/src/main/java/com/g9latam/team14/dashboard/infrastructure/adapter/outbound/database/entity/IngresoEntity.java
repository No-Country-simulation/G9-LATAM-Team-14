package com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ingresos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IngresoEntity {
    @Id
    @Column(name = "id_ingresos")
    private Integer id;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "monto")
    private BigDecimal monto;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Column(name = "id_usuario")
    private Integer idUsuario;
}
