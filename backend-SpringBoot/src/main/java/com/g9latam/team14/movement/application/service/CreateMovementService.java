package com.g9latam.team14.movement.application.service;

import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.inbound.CreateMovementUseCase;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateMovementService implements CreateMovementUseCase {
    private final MovementRepositoryPort movementRepository;

    @Override
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public Movement createMovement(Movement movement) {
        String category = movement.getCategory();
        if (category == null || category.isBlank()) {
            category = "INGRESO".equalsIgnoreCase(movement.getType()) ? "OTRO" : "COMPRAS";
        }

        Movement toSave = Movement.builder()
                .id(movement.getId())
                .description(movement.getDescription())
                .amount(movement.getAmount())
                .type(movement.getType())
                .category(category)
                .date(movement.getDate())
                .userId(movement.getUserId())
                .build();

        return movementRepository.save(toSave);
    }

    @Override
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public Movement confirmMovement(Integer id, String category, String regularity, Integer debtId) {
        Movement existing = movementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado con id: " + id));

        Movement updated = Movement.builder()
                .id(existing.getId())
                .description(existing.getDescription())
                .amount(existing.getAmount())
                .type(existing.getType())
                .category(category != null && !category.isBlank() ? category : existing.getCategory())
                .date(existing.getDate())
                .userId(existing.getUserId())
                .build();

        return movementRepository.save(updated);
    }
}