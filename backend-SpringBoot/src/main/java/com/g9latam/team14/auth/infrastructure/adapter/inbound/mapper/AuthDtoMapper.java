package com.g9latam.team14.auth.infrastructure.adapter.inbound.mapper;

import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.infrastructure.adapter.inbound.dtos.AuthResponse;
import org.springframework.stereotype.Component;

@Component
public class AuthDtoMapper {
    public AuthResponse toAuthResponse(User user, String token, long expiresInSeconds) {
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getOnboardingCompleted() != null ? user.getOnboardingCompleted() : false
        );
        return new AuthResponse(token, "Bearer", expiresInSeconds, userInfo);
    }
}
