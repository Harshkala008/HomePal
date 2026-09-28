package com.homepal.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homepal.service.FoodNutritionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiFoodController {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final FoodNutritionService nutritionService;

    public AiFoodController(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${sarvam.api-key:}") String apiKey,
            @Value("${sarvam.model:sarvam-m}") String model,
            FoodNutritionService nutritionService) {
        this.restClient = restClientBuilder.baseUrl("https://api.sarvam.ai").build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.nutritionService = nutritionService;
    }

    @PostMapping("/food")
    public ResponseEntity<?> identifyFood(@RequestBody FoodRequest request) {
        if (request.query() == null || request.query().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Food query is required."));
        }

        FoodNutritionService.FoodNutrition datasetFood = nutritionService.findBestMatch(request.query());
        if (datasetFood != null) {
            return ResponseEntity.ok(Map.of(
                    "id", -1,
                    "name", datasetFood.name(),
                    "detail", datasetFood.detail(),
                    "calories", datasetFood.calories(),
                    "protein", datasetFood.protein(),
                    "carbs", datasetFood.carbs(),
                    "fat", datasetFood.fat(),
                    "icon", "DB",
                    "category", "Dataset",
                    "source", datasetFood.source()));
        }

        if (apiKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("error", "Sarvam is not configured. Set SARVAM_API_KEY on the backend."));
        }

        Map<String, Object> payload = Map.of(
                "model", model,
                "temperature", 0.1,
                "max_tokens", 350,
                "messages", new Object[]{
                        Map.of("role", "system", "content", "You are a nutrition assistant for Indian foods. Return only valid JSON with keys name, detail, calories, protein, category, icon. calories and protein must be numbers for one normal serving. Never invent certainty; provide a reasonable estimate."),
                        Map.of("role", "user", "content", "Identify this food and estimate nutrition for one normal serving: " + request.query())
                }
        );

        try {
            String response = restClient.post()
                    .uri("/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").path(0).path("message").path("content").asText();
            String json = content.replace("```json", "").replace("```", "").trim();
            JsonNode food = objectMapper.readTree(json);
            return ResponseEntity.ok(Map.of(
                    "id", -1,
                    "name", food.path("name").asText(request.query()),
                    "detail", food.path("detail").asText("AI estimate, one serving"),
                    "calories", food.path("calories").asInt(0),
                    "protein", food.path("protein").asDouble(0),
                    "icon", food.path("icon").asText("AI"),
                    "category", food.path("category").asText("AI estimate")
            ));
        } catch (Exception exception) {
            return ResponseEntity.status(502).body(Map.of("error", "Sarvam could not identify that food right now."));
        }
    }

    public record FoodRequest(String query) {
    }
}