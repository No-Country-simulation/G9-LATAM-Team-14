/**
 * Define la operación que necesita el dominio para comparar contraseñas
 * sin depender de ninguna librería de encriptación en específico.
 */
package com.g9latam.team14.auth.domain.ports.outbound;
public interface PasswordEncoderPort {
    String encode(String rawPassword);
    boolean matches(String rawPassword, String encodedPassword);
}
