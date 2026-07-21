package com.g9latam.team14.auth.domain.ports.inbound;
import com.g9latam.team14.auth.domain.model.User;
public interface GetAuthenticatedUserUseCase {
    User getUserByEmail(String email);
}