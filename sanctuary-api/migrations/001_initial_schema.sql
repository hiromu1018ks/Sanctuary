-- Sanctuary Database Schema (from Supabase design)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    self_introduction TEXT,
    profile_image_url VARCHAR(500),
    gratitude_points INTEGER NOT NULL DEFAULT 0,
    current_tree_stage VARCHAR(50) NOT NULL DEFAULT 'seed',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_gratitude_points ON users(gratitude_points);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Posts Table
CREATE TABLE posts (
    post_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    template_type VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    ai_review_passed BOOLEAN DEFAULT NULL,
    review_reason TEXT DEFAULT NULL,
    approved_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Posts table indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_approved_at ON posts(approved_at);

-- Reactions Table
CREATE TABLE reactions (
    reaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('gratitude', 'support', 'empathy', 'wonderful')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id, reaction_type)
);

-- Reactions table indexes
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_reaction_type ON reactions(reaction_type);

-- Sample Data (for development)
INSERT INTO users (email, password_hash, nickname, self_introduction, status) VALUES
('test@sanctuary.com', '$2a$10$dummy.hash.for.testing', 'TestUser', 'テストユーザーです', 'approved'),
('admin@sanctuary.com', '$2a$10$dummy.hash.for.admin', 'Admin', '管理者アカウントです', 'approved');

INSERT INTO posts (user_id, content, status, approved_at) VALUES
((SELECT user_id FROM users WHERE email = 'test@sanctuary.com'), '今日も一日お疲れ様でした！', 'approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE email = 'admin@sanctuary.com'), 'Sanctuaryへようこそ！心の安全地帯で素敵な交流を楽しみましょう。', 'approved', CURRENT_TIMESTAMP);
