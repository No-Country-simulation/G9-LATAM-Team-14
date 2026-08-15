package com.g9latam.team14.evolucion.domain.ports.inbound;
import com.g9latam.team14.evolucion.domain.model.DatosEvolucion;
public interface GenerarEvolucionUseCase {
    DatosEvolucion generar(Integer usuarioId);
}
