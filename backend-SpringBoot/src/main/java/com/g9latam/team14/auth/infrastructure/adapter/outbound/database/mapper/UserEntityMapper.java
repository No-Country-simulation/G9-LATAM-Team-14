package com.g9latam.team14.auth.infrastructure.adapter.outbound.database.mapper;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class UserEntityMapper {
    public User toDomain(UserEntity entity) {
        if (entity == null) return null;
        return User.builder()
                .id(entity.getId())
                .username(entity.getNombreUsuario())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .ingresoMensual(entity.getIngresoMensual())
                .frecuenciaAhorro(entity.getFrecuenciaAhorro())
                .actividadPrincipal(entity.getActividadPrincipal())
                .ocupacionCuoc(entity.getOcupacionCuoc())
                .confianzaIaPct(entity.getConfianzaIaPct())
                .resultadoIaJson(entity.getResultadoIaJson())
                .fechaRegistro(entity.getFechaRegistro())
                .onboardingCompleted(entity.getOnboardingCompleted() != null ? entity.getOnboardingCompleted() : false)
                .build();
    }

    public UserEntity toEntity(User domain) {
        if (domain == null) return null;
        return UserEntity.builder()
                .id(domain.getId())
                .nombreUsuario(domain.getUsername())
                .email(domain.getEmail())
                .password(domain.getPassword())
                .ingresoMensual(domain.getIngresoMensual())
                .frecuenciaAhorro(domain.getFrecuenciaAhorro())
                .actividadPrincipal(domain.getActividadPrincipal())
                .ocupacionCuoc(domain.getOcupacionCuoc())
                .confianzaIaPct(domain.getConfianzaIaPct())
                .resultadoIaJson(domain.getResultadoIaJson())
                .fechaRegistro(domain.getFechaRegistro())
                .onboardingCompleted(domain.getOnboardingCompleted() != null ? domain.getOnboardingCompleted() : false)
                .build();
    }
}
