package com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
public record CreateBatchDebtsRequest(
        @NotNull Integer userId,
        @NotEmpty List<@Valid SingleDebtItemRequest> debts
) {
    public record SingleDebtItemRequest(
            String type,
            String category,
            Double amount
    ) {}
}
