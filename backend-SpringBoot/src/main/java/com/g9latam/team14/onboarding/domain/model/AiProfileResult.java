package com.g9latam.team14.onboarding.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiProfileResult implements Serializable {
    private String ocupacionCuoc;
    private Double confianzaActividadPct;
    private String estadoAlcanceMvp;
    private String actividadPrincipal;
}
