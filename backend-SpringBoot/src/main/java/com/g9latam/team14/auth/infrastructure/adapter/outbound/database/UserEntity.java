package com.g9latam.team14.auth.infrastructure.adapter.outbound.database;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    private Integer id;

    @Column(name = "nombre_usuario")
    private String nombreUsuario;

    private String password;
    private String email;

    @Column(name = "ingreso_mensual")
    private Float ingresoMensual;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;
}
