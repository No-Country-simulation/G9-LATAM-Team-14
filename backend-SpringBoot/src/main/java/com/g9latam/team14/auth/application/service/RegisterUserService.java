package com.g9latam.team14.auth.application.service;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.domain.ports.inbound.RegisterUserUseCase;
import com.g9latam.team14.auth.domain.ports.outbound.PasswordEncoderPort;
import com.g9latam.team14.auth.domain.ports.outbound.UserRepositoryPort;
import com.g9latam.team14.shared.infrastructure.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class RegisterUserService implements RegisterUserUseCase {
    private final UserRepositoryPort userRepository;
    private final PasswordEncoderPort passwordEncoder;

    @Override
    public User register(String username, String email, String password, Float ingresoMensual) {
        if (userRepository.existsByEmail(email)) {
            throw new CustomException("El correo electrónico ya está registrado", HttpStatus.BAD_REQUEST);
        }
        String encodedPassword = passwordEncoder.encode(password);
        Float monthlyIncome = ingresoMensual != null ? ingresoMensual : 0.0f;
        User newUser = User.builder()
                .username(username)
                .email(email)
                .password(encodedPassword)
                .ingresoMensual(monthlyIncome)
                .fechaRegistro(LocalDate.now())
                .build();
        return userRepository.save(newUser);
    }
}
