package com.homepal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Embeddable
public class Macros {

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "calories_per_100g", nullable = false, precision = 6, scale = 2)
    private BigDecimal caloriesPer100g;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "protein_per_100g", nullable = false, precision = 6, scale = 2)
    private BigDecimal proteinPer100g;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "carbs_per_100g", nullable = false, precision = 6, scale = 2)
    private BigDecimal carbsPer100g;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "fat_per_100g", nullable = false, precision = 6, scale = 2)
    private BigDecimal fatPer100g;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "fiber_per_100g", precision = 6, scale = 2)
    private BigDecimal fiberPer100g;

    public Macros() {
    }

    public Macros(BigDecimal caloriesPer100g, BigDecimal proteinPer100g, BigDecimal carbsPer100g, BigDecimal fatPer100g, BigDecimal fiberPer100g) {
        this.caloriesPer100g = caloriesPer100g;
        this.proteinPer100g = proteinPer100g;
        this.carbsPer100g = carbsPer100g;
        this.fatPer100g = fatPer100g;
        this.fiberPer100g = fiberPer100g;
    }

    public BigDecimal getCaloriesPer100g() {
        return caloriesPer100g;
    }

    public void setCaloriesPer100g(BigDecimal caloriesPer100g) {
        this.caloriesPer100g = caloriesPer100g;
    }

    public BigDecimal getProteinPer100g() {
        return proteinPer100g;
    }

    public void setProteinPer100g(BigDecimal proteinPer100g) {
        this.proteinPer100g = proteinPer100g;
    }

    public BigDecimal getCarbsPer100g() {
        return carbsPer100g;
    }

    public void setCarbsPer100g(BigDecimal carbsPer100g) {
        this.carbsPer100g = carbsPer100g;
    }

    public BigDecimal getFatPer100g() {
        return fatPer100g;
    }

    public void setFatPer100g(BigDecimal fatPer100g) {
        this.fatPer100g = fatPer100g;
    }

    public BigDecimal getFiberPer100g() {
        return fiberPer100g;
    }

    public void setFiberPer100g(BigDecimal fiberPer100g) {
        this.fiberPer100g = fiberPer100g;
    }
}
