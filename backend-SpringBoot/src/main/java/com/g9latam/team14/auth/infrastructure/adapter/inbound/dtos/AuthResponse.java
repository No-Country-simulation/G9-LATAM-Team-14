/** DTO para la respuesta del login. */
package com.g9latam.team14.auth.infrastructure.adapter.inbound.dtos;
public record AuthResponse(
        String token,
        String tokenType,
        long expiresIn,
        UserInfo user
) {
    public record UserInfo(
            Integer id,
            String email,
            String nombreUsuario
    ) {
    }
}
