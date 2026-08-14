package com.g9latam.team14.movement.infrastructure.adapter.outbound.database;
import java.util.List;
import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.mapper.MovementEntityMapper;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MovementRepositoryAdapter implements MovementRepositoryPort {
    private final MovementJpaRepository movementJpaRepository;
    private final MovementEntityMapper movementEntityMapper;

    @Override
    public Movement save(Movement movement) {
        var savedEntity = movementJpaRepository.save(
            movementEntityMapper.toEntity(movement)
        );
        var savedDomain = movementEntityMapper.toDomain(savedEntity);

        return Movement.builder()
            .id(savedDomain.getId())
            .description(savedDomain.getDescription())
            .amount(savedDomain.getAmount())
            .type(savedDomain.getType())
            .category(savedDomain.getCategory())
            .date(savedDomain.getDate())
            .userId(savedDomain.getUserId())
            .aiClassification(movement.getAiClassification())
            .build();
    }

    @Override
    public Optional<Movement> findById(Integer id) {
        return movementJpaRepository.findById(id)
                .map(movementEntityMapper::toDomain);
    }

    @Override
    public List<Movement> findAll() {
        return movementEntityMapper.toDomainList(
                movementJpaRepository.findAll()
        );
    }

    @Override
    public List<Movement> findByUserId(Integer userId) {
        return movementEntityMapper.toDomainList(
                movementJpaRepository.findByUserIdOrderByDateDesc(userId)
        );
    }
}