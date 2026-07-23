package com.g9latam.team14.movement.infrastructure.adapter.inbound;

import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.inbound.CreateMovementUseCase;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.CreateMovementRequest;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.MovementResponse;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.mapper.MovementDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class MovementRestController {

    private final CreateMovementUseCase createMovementUseCase;
    private final MovementDtoMapper movementDtoMapper;

    @PostMapping
    public ResponseEntity<MovementResponse> createMovement(
            @Valid @RequestBody CreateMovementRequest request
    ) {

        Movement movement = createMovementUseCase.createMovement(
                movementDtoMapper.toDomain(request)
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(movementDtoMapper.toResponse(movement));
    }
}