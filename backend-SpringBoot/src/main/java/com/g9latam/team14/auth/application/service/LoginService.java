package com.g9latam.team14.auth.application.service;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.domain.ports.inbound.LoginUseCase;
import com.g9latam.team14.auth.domain.ports.outbound.PasswordEncoderPort;
import com.g9latam.team14.auth.domain.ports.outbound.UserRepositoryPort;
import com.g9latam.team14.shared.infrastructure.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginService implements LoginUseCase {
    private final UserRepositoryPort userRepository;
    private final PasswordEncoderPort passwordEncoder;

    @Override
    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Credenciales inválidas", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new CustomException("Credenciales inválidas", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
}
