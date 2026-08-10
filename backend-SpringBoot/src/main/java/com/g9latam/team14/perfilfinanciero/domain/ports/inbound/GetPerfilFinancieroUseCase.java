package com.g9latam.team14.perfilfinanciero.domain.ports.inbound;

import com.g9latam.team14.perfilfinanciero.domain.model.PerfilFinanciero;

public interface GetPerfilFinancieroUseCase {
    PerfilFinanciero getPerfil(Integer userId);
}
