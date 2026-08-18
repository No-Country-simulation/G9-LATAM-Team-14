package com.g9latam.team14.movement.application.service;

import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.inbound.CreateMovementUseCase;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CreateMovementService implements CreateMovementUseCase {
    private final MovementRepositoryPort movementRepository;
    private final com.g9latam.team14.movement.domain.ports.inbound.ClassifyMovementUseCase classifyMovementUseCase;

    @Override
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public Movement createMovement(Movement movement) {
        String category = movement.getCategory();
        String regularity = normalizeRegularity(movement.getRegularity());
        if (category == null || category.isBlank() || "OTRO".equalsIgnoreCase(category) || "COMPRAS".equalsIgnoreCase(category)) {
            try {
                String direction = "INGRESO".equalsIgnoreCase(movement.getType()) ? "entrada" : "salida";
                var aiClass = classifyMovementUseCase.classifyMovement(
                        movement.getDescription(),
                        movement.getAmount() != null ? movement.getAmount().doubleValue() : 0.0,
                        direction,
                        movement.getNote() != null ? movement.getNote() : ""
                );
                if (aiClass != null && aiClass.getCategory() != null && !aiClass.getCategory().isBlank()) {
                    category = aiClass.getCategory();
                }
                if (regularity == null && aiClass != null) {
                    regularity = normalizeRegularity(aiClass.getRegularity());
                }
            } catch (Exception e) {
                // Fallback to default
            }
        }
        if (category == null || category.isBlank()) {
            category = "INGRESO".equalsIgnoreCase(movement.getType()) ? "OTRO" : "COMPRAS";
        }
        if (regularity == null) {
            regularity = "fijo";
        }

        Movement toSave = Movement.builder()
                .id(movement.getId())
                .description(movement.getDescription())
                .amount(movement.getAmount())
                .type(movement.getType())
                .category(category)
                .regularity(regularity)
                .date(movement.getDate())
                .note(movement.getNote())
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
                .regularity(normalizeRegularity(regularity) != null
                        ? normalizeRegularity(regularity)
                        : existing.getRegularity())
                .date(existing.getDate())
                .note(existing.getNote())
                .userId(existing.getUserId())
                .build();

        return movementRepository.save(updated);
    }

    @Override
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public Movement updateMovement(Integer id, String description) {
        Movement existing = movementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado con id: " + id));

        Movement updated = Movement.builder()
                .id(existing.getId())
                .description(description != null && !description.isBlank() ? description : existing.getDescription())
                .amount(existing.getAmount())
                .type(existing.getType())
                .category(existing.getCategory())
                .regularity(existing.getRegularity())
                .date(existing.getDate())
                .note(existing.getNote())
                .userId(existing.getUserId())
                .build();

        return movementRepository.save(updated);
    }

    @Override
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public Movement updateMovementWithNote(Integer id, String description, String note) {
        Movement existing = movementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado con id: " + id));

        Movement updated = Movement.builder()
                .id(existing.getId())
                .description(description != null && !description.isBlank() ? description : existing.getDescription())
                .amount(existing.getAmount())
                .type(existing.getType())
                .category(existing.getCategory())
                .regularity(existing.getRegularity())
                .date(existing.getDate())
                .note(note != null ? note : existing.getNote())
                .userId(existing.getUserId())
                .build();

        return movementRepository.save(updated);
    }

    @Override
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public void deleteMovement(Integer id) {
        movementRepository.deleteById(id);
    }

    private String normalizeRegularity(String regularity) {
        if ("fijo".equalsIgnoreCase(regularity)) return "fijo";
        if ("variable".equalsIgnoreCase(regularity)) return "variable";
        return null;
    }
}
