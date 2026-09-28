package com.homepal.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "serving_sizes")
public class ServingSize {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String label;

    @Size(max = 50)
    @Column(name = "label_hi", length = 50)
    private String labelHi;

    @NotNull
    @Positive
    @Column(name = "gram_equivalent", nullable = false, precision = 7, scale = 2)
    private BigDecimal gramEquivalent;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    public ServingSize() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public FoodItem getFoodItem() {
        return foodItem;
    }

    public void setFoodItem(FoodItem foodItem) {
        this.foodItem = foodItem;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getLabelHi() {
        return labelHi;
    }

    public void setLabelHi(String labelHi) {
        this.labelHi = labelHi;
    }

    public BigDecimal getGramEquivalent() {
        return gramEquivalent;
    }

    public void setGramEquivalent(BigDecimal gramEquivalent) {
        this.gramEquivalent = gramEquivalent;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
