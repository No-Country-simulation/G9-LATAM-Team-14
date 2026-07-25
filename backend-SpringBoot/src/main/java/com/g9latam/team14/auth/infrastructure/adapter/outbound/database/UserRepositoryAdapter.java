package com.g9latam.team14.auth.infrastructure.adapter.outbound.database;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.domain.ports.outbound.UserRepositoryPort;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.mapper.UserEntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {
    private final UserJpaRepository userJpaRepository;
    private final UserEntityMapper userEntityMapper;

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmail(email)
                .map(userEntityMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userJpaRepository.existsByEmail(email);
    }

    @Override
    public User save(User user) {
        UserEntity entity = userEntityMapper.toEntity(user);
        UserEntity savedEntity = userJpaRepository.save(entity);
        return userEntityMapper.toDomain(savedEntity);
    }
}
