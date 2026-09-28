CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    daily_calorie_target INT NOT NULL DEFAULT 2000,
    daily_protein_target_g INT,
    daily_carbs_target_g INT,
    daily_fat_target_g INT,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    device_info VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(150) NOT NULL,
    name_hi VARCHAR(150),
    name_hinglish VARCHAR(150),
    category VARCHAR(50),
    calories_per_100g NUMERIC(6,2) NOT NULL,
    protein_per_100g NUMERIC(6,2) NOT NULL,
    carbs_per_100g NUMERIC(6,2) NOT NULL,
    fat_per_100g NUMERIC(6,2) NOT NULL,
    fiber_per_100g NUMERIC(6,2),
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_food_name_en_trgm ON food_items USING gin (name_en gin_trgm_ops);
CREATE INDEX idx_food_name_hi_trgm ON food_items USING gin (name_hi gin_trgm_ops);
CREATE INDEX idx_food_name_hinglish_trgm ON food_items USING gin (name_hinglish gin_trgm_ops);

CREATE TABLE serving_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    label_hi VARCHAR(50),
    gram_equivalent NUMERIC(7,2) NOT NULL CHECK (gram_equivalent > 0),
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id),
    serving_size_id UUID NOT NULL REFERENCES serving_sizes(id),
    quantity NUMERIC(5,2) NOT NULL CHECK (quantity > 0),
    meal_type VARCHAR(20) NOT NULL,
    logged_calories NUMERIC(7,2) NOT NULL,
    logged_protein NUMERIC(7,2) NOT NULL,
    logged_carbs NUMERIC(7,2) NOT NULL,
    logged_fat NUMERIC(7,2) NOT NULL,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source VARCHAR(20) NOT NULL DEFAULT 'SEARCH',
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_daily_logs_user_date ON daily_logs (user_id, logged_at);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
