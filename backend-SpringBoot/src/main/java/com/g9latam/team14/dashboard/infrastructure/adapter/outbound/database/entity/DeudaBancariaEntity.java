package com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "deuda_bancaria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeudaBancariaEntity {
    @Id
    @Column(name = "id_deuda")
    private Integer id;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "monto_mensual")
    private BigDecimal montoMensual;

    @Column(name = "usuario")
    private Integer usuario;
}
