package com.g9latam.team14.recommendation.infrastructure.adapter.inbound;

import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Resuelve el usuario autenticado a partir del contexto de seguridad (email en el JWT).
 * Centraliza el patrón usado por los controllers para obtener el userId.
 */
@Component
@RequiredArgsConstructor
public class AuthenticatedUserProvider {

    private final GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;

    public Integer currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = getAuthenticatedUserUseCase.getUserByEmail(email);
        return user.getId();
    }
}
