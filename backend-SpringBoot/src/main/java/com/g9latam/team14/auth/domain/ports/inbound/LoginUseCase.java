/**
 * Define la acción principal del flujo de login que debe cumplir el sistema
 * para autenticar a un usuario mediante su correo y contraseña.
 */
package com.g9latam.team14.auth.domain.ports.inbound;
import com.g9latam.team14.auth.domain.model.User;
public interface LoginUseCase {
    User login(String email, String rawPassword);
}
