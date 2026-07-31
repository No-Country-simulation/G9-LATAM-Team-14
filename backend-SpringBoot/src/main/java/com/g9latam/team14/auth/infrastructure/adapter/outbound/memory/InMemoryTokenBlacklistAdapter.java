package com.g9latam.team14.auth.infrastructure.adapter.outbound.memory;

import com.g9latam.team14.auth.domain.ports.outbound.TokenBlacklistPort;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryTokenBlacklistAdapter implements TokenBlacklistPort {

    private final Map<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

    @Override
    public void blacklistToken(String token, long expirationInSeconds) {
        if (token == null || token.isBlank()) return;
        long timeout = expirationInSeconds > 0 ? expirationInSeconds : 86400;
        blacklistedTokens.put(token, Instant.now().plusSeconds(timeout));
        cleanupExpired();
    }

    @Override
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;
        Instant expiry = blacklistedTokens.get(token);
        if (expiry == null) return false;

        if (Instant.now().isAfter(expiry)) {
            blacklistedTokens.remove(token);
            return false;
        }
        return true;
    }

    private void cleanupExpired() {
        Instant now = Instant.now();
        blacklistedTokens.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
    }
}
