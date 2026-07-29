package com.g9latam.team14.auth.domain.ports.inbound;
import com.g9latam.team14.auth.domain.model.User;
public interface RegisterUserUseCase {
    User register(String username, String email, String password, Float ingresoMensual);
}
