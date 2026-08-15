package com.g9latam.team14.profile.domain.ports.inbound;
import com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos.ProfileResponse;
public interface GetProfileUseCase {
    ProfileResponse getProfile(Integer userId);
}
