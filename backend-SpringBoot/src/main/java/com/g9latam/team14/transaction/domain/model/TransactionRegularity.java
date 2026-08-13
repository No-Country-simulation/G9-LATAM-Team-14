package com.g9latam.team14.transaction.domain.model;

public enum TransactionRegularity {

    FIJO("fijo"),
    VARIABLE("variable"),
    ESTACIONAL("estacional");

    private final String value;

    TransactionRegularity(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}