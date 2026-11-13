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
    private final String grokApiKey;
    private final String grokModel;
    private final FoodNutritionService nutritionService;
    private final RestClient grokRestClient;

    public AiFoodController(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${sarvam.api-key:}") String apiKey,
            @Value("${sarvam.model:sarvam-m}") String model,
            @Value("${grok.api-key:}") String grokApiKey,
            @Value("${grok.model:grok-3-mini}") String grokModel,
            FoodNutritionService nutritionService) {
        this.restClient = restClientBuilder.baseUrl("https://api.sarvam.ai").build();
        this.grokRestClient = restClientBuilder.baseUrl("https://api.x.ai").build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.grokApiKey = grokApiKey;
        this.grokModel = grokModel;
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
                    "fats", datasetFood.fat(),
                    "icon", "DB",
                    "category", "Dataset",
                    "source", datasetFood.source()));
        }

        ResponseEntity<?> grokResult = identifyWithProvider(grokRestClient, grokApiKey, grokModel, request.query(), "Grok");
        if (grokResult != null) {
            return grokResult;
        }

        ResponseEntity<?> sarvamResult = identifyWithProvider(restClient, apiKey, model, request.query(), "Sarvam");
        if (sarvamResult != null) {
            return sarvamResult;
        }
        return ResponseEntity.status(503).body(Map.of("error", "Food search is temporarily unavailable."));
    }

    private ResponseEntity<?> identifyWithProvider(RestClient client, String providerKey, String providerModel,
                                                   String query, String providerName) {
        if (providerKey.isBlank()) return null;
        Map<String, Object> payload = Map.of(
                "model", providerModel,
                "temperature", 0.1,
                "max_tokens", 350,
                "messages", new Object[]{
                        Map.of("role", "system", "content", "You are a nutrition assistant for Indian foods. Return only valid JSON with keys name, detail, calories, protein, carbs, fats, category, icon. All nutrition values must be numbers for one normal serving. Never invent certainty; provide a reasonable estimate."),
                        Map.of("role", "user", "content", "Identify this food and estimate nutrition for one normal serving: " + query)
                }
        );
        try {
            String response = client.post()
                    .uri("/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + providerKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").path(0).path("message").path("content").asText();
            JsonNode food = objectMapper.readTree(content.replace("```json", "").replace("```", "").trim());
            return ResponseEntity.ok(Map.of(
                    "id", -1,
                    "name", food.path("name").asText(query),
                    "detail", food.path("detail").asText("Nutrition estimate, one serving"),
                    "calories", food.path("calories").asInt(0),
                    "protein", food.path("protein").asDouble(0),
                    "carbs", food.path("carbs").asDouble(0),
                    "fats", food.path("fats").asDouble(0),
                    "icon", food.path("icon").asText("AI"),
                    "category", food.path("category").asText("Nutrition estimate")
            ));
        } catch (RuntimeException | java.io.IOException exception) {
            return null;
        }
    }

    public record FoodRequest(String query) {
    }
}