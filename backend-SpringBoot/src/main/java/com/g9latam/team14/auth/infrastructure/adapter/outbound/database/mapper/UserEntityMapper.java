/**
 * Traduce la tabla de la base de datos (UserEntity) a nuestro modelo puro de Java (User).
 * Sirve para que el resto del sistema no tenga que lidiar con clases de la base de datos.
 */
package com.g9latam.team14.auth.infrastructure.adapter.outbound.database.mapper;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class UserEntityMapper {
    public User toDomain(UserEntity entity) {
        return User.builder()
                .id(entity.getId())
                .username(entity.getNombreUsuario())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .build();
    }
}
