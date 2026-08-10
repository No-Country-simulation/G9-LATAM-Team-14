package com.g9latam.team14.auth.domain.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class User {
    private final Integer id;
    private final String username;
    private final String email;
    private final String password;
    private final Float ingresoMensual;
    private final String frecuenciaAhorro;
    private final LocalDate fechaRegistro;
}
