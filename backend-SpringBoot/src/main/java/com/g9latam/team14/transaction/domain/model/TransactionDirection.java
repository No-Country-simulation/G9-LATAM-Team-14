package com.g9latam.team14.transaction.domain.model;

public enum TransactionDirection {

    ENTRADA("entrada"),
    SALIDA("salida");

    private final String value;

    TransactionDirection(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}