package com.homepal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FoodNutritionService {
    private final List<FoodNutrition> foods;

    public FoodNutritionService(
            @Value("${nutrition.datasets.processed:../Indian_Food_Nutrition_Processed.csv}") String processedPath,
            @Value("${nutrition.datasets.fruits:../Indian Fruits And Nutritious Foods Dataset.csv}") String fruitsPath) {
        List<FoodNutrition> loadedFoods = new ArrayList<>();
        loadProcessedDataset(Path.of(processedPath), loadedFoods);
        loadFruitDataset(Path.of(fruitsPath), loadedFoods);
        foods = List.copyOf(loadedFoods);
    }

    public FoodNutrition findBestMatch(String query) {
        String normalizedQuery = normalize(query);
        return foods.stream()
                .filter(food -> normalize(food.name()).contains(normalizedQuery)
                        || normalizedQuery.contains(normalize(food.name())))
                .min(Comparator.comparingInt(food -> Math.abs(normalize(food.name()).length() - normalizedQuery.length())))
                .orElse(null);
    }

    private void loadProcessedDataset(Path path, List<FoodNutrition> target) {
        readCsv(path, row -> {
            if (row.size() < 5 || row.get(0).equalsIgnoreCase("Dish Name")) return;
            target.add(new FoodNutrition(row.get(0), "Per 100 g from Indian food nutrition dataset",
                    decimal(row.get(1)), decimal(row.get(3)), decimal(row.get(2)), decimal(row.get(4)), "DATASET"));
        });
    }

    private void loadFruitDataset(Path path, List<FoodNutrition> target) {
        readCsv(path, row -> {
            if (row.size() < 6 || row.get(0).equalsIgnoreCase("Sr No.")) return;
            String nutrition = row.get(3);
            target.add(new FoodNutrition(row.get(1), row.get(5) + " from Indian fruits dataset",
                    firstNutritionValue(nutrition, "kcal"), firstNutritionValue(nutrition, "Protein"),
                    firstNutritionValue(nutrition, "Carbs"), firstNutritionValue(nutrition, "Fat"), "DATASET"));
        });
    }

    private void readCsv(Path path, RowConsumer consumer) {
        if (!Files.exists(path)) return;
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.isBlank()) consumer.accept(parseCsvLine(line));
            }
        } catch (IOException ignored) {
            // Optional datasets must not prevent the backend from starting.
        }
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder value = new StringBuilder();
        boolean quoted = false;
        for (int index = 0; index < line.length(); index++) {
            char character = line.charAt(index);
            if (character == '"') {
                if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    value.append('"');
                    index++;
                } else quoted = !quoted;
            } else if (character == ',' && !quoted) {
                values.add(value.toString().trim());
                value.setLength(0);
            } else value.append(character);
        }
        values.add(value.toString().trim());
        return values;
    }

    private double firstNutritionValue(String nutrition, String label) {
        String expression = label.equalsIgnoreCase("kcal")
                ? "([0-9]+(?:\\.[0-9]+)?)\\s*kcal"
                : "([0-9]+(?:\\.[0-9]+)?)\\s*g\\s*" + Pattern.quote(label);
        Matcher matcher = Pattern.compile(expression, Pattern.CASE_INSENSITIVE).matcher(nutrition);
        return matcher.find() ? decimal(matcher.group(1)) : 0;
    }

    private double decimal(String value) {
        try {
            return Double.parseDouble(value.replace("~", "").trim());
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private interface RowConsumer { void accept(List<String> row); }

    public record FoodNutrition(String name, String detail, double calories, double protein,
                                double carbs, double fat, String source) { }
}