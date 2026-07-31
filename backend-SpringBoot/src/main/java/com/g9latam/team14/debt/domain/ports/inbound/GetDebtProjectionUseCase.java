package com.g9latam.team14.debt.domain.ports.inbound;
import com.g9latam.team14.debt.domain.model.DebtProjectionPoint;
import java.util.List;
public interface GetDebtProjectionUseCase {
    List<DebtProjectionPoint> getDebtProjectionByUserId(Integer userId);
}
