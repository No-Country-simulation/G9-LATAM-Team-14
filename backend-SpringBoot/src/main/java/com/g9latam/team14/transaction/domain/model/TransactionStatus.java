package com.g9latam.team14.transaction.domain.model;

public enum TransactionStatus {

    PENDING_CLASSIFICATION("pending_classification"),
    AWAITING_CONFIRMATION("awaiting_confirmation"),
    CONFIRMED("confirmed");

    private final String value;

    TransactionStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}