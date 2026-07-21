package com.g9latam.team14.auth.domain.ports.outbound;
import com.g9latam.team14.auth.domain.model.User;
import java.util.Optional;
public interface UserRepositoryPort {
    Optional<User> findByEmail(String email);
}
