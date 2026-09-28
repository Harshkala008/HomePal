package com.homepal.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_logs")
public class DailyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serving_size_id", nullable = false)
    private ServingSize servingSize;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal quantity;

    @NotBlank
    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType;

    @NotNull
    @Column(name = "logged_calories", nullable = false, precision = 7, scale = 2)
    private BigDecimal loggedCalories;

    @NotNull
    @Column(name = "logged_protein", nullable = false, precision = 7, scale = 2)
    private BigDecimal loggedProtein;

    @NotNull
    @Column(name = "logged_carbs", nullable = false, precision = 7, scale = 2)
    private BigDecimal loggedCarbs;

    @NotNull
    @Column(name = "logged_fat", nullable = false, precision = 7, scale = 2)
    private BigDecimal loggedFat;

    @CreationTimestamp
    @Column(name = "logged_at", nullable = false)
    private OffsetDateTime loggedAt;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String source = "SEARCH";

    @Version
    private Long version;

    public DailyLog() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public FoodItem getFoodItem() {
        return foodItem;
    }

    public void setFoodItem(FoodItem foodItem) {
        this.foodItem = foodItem;
    }

    public ServingSize getServingSize() {
        return servingSize;
    }

    public void setServingSize(ServingSize servingSize) {
        this.servingSize = servingSize;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public BigDecimal getLoggedCalories() {
        return loggedCalories;
    }

    public void setLoggedCalories(BigDecimal loggedCalories) {
        this.loggedCalories = loggedCalories;
    }

    public BigDecimal getLoggedProtein() {
        return loggedProtein;
    }

    public void setLoggedProtein(BigDecimal loggedProtein) {
        this.loggedProtein = loggedProtein;
    }

    public BigDecimal getLoggedCarbs() {
        return loggedCarbs;
    }

    public void setLoggedCarbs(BigDecimal loggedCarbs) {
        this.loggedCarbs = loggedCarbs;
    }

    public BigDecimal getLoggedFat() {
        return loggedFat;
    }

    public void setLoggedFat(BigDecimal loggedFat) {
        this.loggedFat = loggedFat;
    }

    public OffsetDateTime getLoggedAt() {
        return loggedAt;
    }

    public void setLoggedAt(OffsetDateTime loggedAt) {
        this.loggedAt = loggedAt;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
