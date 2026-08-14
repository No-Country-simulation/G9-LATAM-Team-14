package com.g9latam.team14.profile.domain.ports.inbound;
import com.g9latam.team14.profile.domain.model.PerfilFinanciero;
public interface GetPerfilFinancieroUseCase {
    PerfilFinanciero getPerfil(Integer userId);
}
