package com.g9latam.team14.transaction.domain.model;

public enum ClassificationSource {

    MODEL_CONFIRMED("model_confirmed"),
    USER_CORRECTION("user_correction");

    private final String value;

    ClassificationSource(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}