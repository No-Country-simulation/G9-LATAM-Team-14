package com.g9latam.team14.auth.domain.ports.outbound;

public interface TokenBlacklistPort {
    void blacklistToken(String token, long expirationInSeconds);
    boolean isBlacklisted(String token);
}
