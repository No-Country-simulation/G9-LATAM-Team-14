/**
 * Adaptador de salida para la validación de contraseñas.
 * Implementa la interfaz PasswordEncoderPort de la capa de dominio usando BCrypt de Spring Security.
 * Permite al caso de uso comparar contraseñas sin depender directamente del framework de seguridad.
 */
package com.g9latam.team14.auth.infrastructure.adapter.outbound.security;
import com.g9latam.team14.auth.domain.ports.outbound.PasswordEncoderPort;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BCryptPasswordEncoderAdapter implements PasswordEncoderPort {

    private final PasswordEncoder passwordEncoder;

    @Override
    public boolean matches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
