package com.homepal.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "food_items")
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name_en", nullable = false, length = 150)
    private String nameEn;

    @Size(max = 150)
    @Column(name = "name_hi", length = 150)
    private String nameHi;

    @Size(max = 150)
    @Column(name = "name_hinglish", length = 150)
    private String nameHinglish;

    @Size(max = 50)
    @Column(length = 50)
    private String category;

    @Embedded
    @NotNull
    private Macros macros;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "foodItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServingSize> servingSizes = new ArrayList<>();

    public FoodItem() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public String getNameHi() {
        return nameHi;
    }

    public void setNameHi(String nameHi) {
        this.nameHi = nameHi;
    }

    public String getNameHinglish() {
        return nameHinglish;
    }

    public void setNameHinglish(String nameHinglish) {
        this.nameHinglish = nameHinglish;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Macros getMacros() {
        return macros;
    }

    public void setMacros(Macros macros) {
        this.macros = macros;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ServingSize> getServingSizes() {
        return servingSizes;
    }

    public void setServingSizes(List<ServingSize> servingSizes) {
        this.servingSizes = servingSizes;
    }
}
