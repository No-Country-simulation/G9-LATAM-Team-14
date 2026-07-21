package com.g9latam.team14.auth.application.service;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase;
import com.g9latam.team14.auth.domain.ports.outbound.UserRepositoryPort;
import com.g9latam.team14.shared.infrastructure.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetAuthenticatedUserService implements GetAuthenticatedUserUseCase {

    private final UserRepositoryPort userRepository;

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Usuario no encontrado", HttpStatus.UNAUTHORIZED));
    }
}