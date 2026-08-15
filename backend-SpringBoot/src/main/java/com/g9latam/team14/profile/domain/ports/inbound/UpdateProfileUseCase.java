package com.g9latam.team14.profile.domain.ports.inbound;
import com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos.ProfileResponse;
import com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos.UpdateProfileRequest;
public interface UpdateProfileUseCase {
    ProfileResponse updateProfile(Integer userId, UpdateProfileRequest request);
}
