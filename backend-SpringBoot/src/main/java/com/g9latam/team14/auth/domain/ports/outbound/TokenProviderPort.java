/**
 * Define operaciones que el dominio necesita para crear, validar y leer tokens
 * sin importar la tecnología que se use para implementarlos.
 */
package com.g9latam.team14.auth.domain.ports.outbound;
import com.g9latam.team14.auth.domain.model.User;
public interface TokenProviderPort {
    String generateToken(User user);
    boolean validateToken(String token);
    String extractEmail(String token);
}
