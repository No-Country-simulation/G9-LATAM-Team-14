package com.g9latam.team14.debt.infrastructure.adapter.inbound;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.ports.inbound.CreateBatchDebtsUseCase;
import com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos.CreateBatchDebtsRequest;
import com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos.DebtResponse;
import com.g9latam.team14.debt.infrastructure.adapter.inbound.mapper.DebtDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/v1/onboarding/debts")
@RequiredArgsConstructor
public class OnboardingDebtRestController {
    private final CreateBatchDebtsUseCase createBatchDebtsUseCase;
    private final DebtDtoMapper debtDtoMapper;

    @PostMapping
    public ResponseEntity<List<DebtResponse>> createOnboardingDebts(@Valid @RequestBody CreateBatchDebtsRequest request) {
        List<Debt> domainDebts = debtDtoMapper.toDomainBatchList(request);
        List<Debt> createdDebts = createBatchDebtsUseCase.createBatchDebts(domainDebts, request.userId());
        return ResponseEntity.status(HttpStatus.CREATED).body(debtDtoMapper.toResponseList(createdDebts));
    }
}
