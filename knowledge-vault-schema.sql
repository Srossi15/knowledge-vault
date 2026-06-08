-- Knowledge Vault Database Schema
-- PostgreSQL (Supabase)

-- 1. Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('economist', 'book')),
  added_date TIMESTAMP DEFAULT NOW(),
  expiration_date TIMESTAMP,
  source_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Quiz questions table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL, -- Array of 4 options
  correct_answer INT NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  principle_based BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, question)
);

-- 3. User progress table (tracks answers)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_answer INT CHECK (user_answer BETWEEN 0 AND 3 OR user_answer IS NULL),
  confidence INT CHECK (confidence BETWEEN 1 AND 5),
  is_correct BOOLEAN,
  answered_at TIMESTAMP DEFAULT NOW(),
  time_to_answer INT -- seconds
);

-- 4. Spaced repetition tracking
CREATE TABLE spaced_rep_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  last_asked TIMESTAMP,
  next_ask TIMESTAMP,
  difficulty_level INT DEFAULT 1,
  times_answered INT DEFAULT 0,
  average_confidence FLOAT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_articles_type ON articles(type);
CREATE INDEX idx_articles_expiration ON articles(expiration_date);
CREATE INDEX idx_quiz_article ON quiz_questions(article_id);
CREATE INDEX idx_progress_question ON user_progress(question_id);
CREATE INDEX idx_progress_timestamp ON user_progress(answered_at);
CREATE INDEX idx_spaced_rep_next_ask ON spaced_rep_schedule(next_ask);

-- Enable Row Level Security (optional, for multi-user future)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_rep_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies (for single-user, allow all for now)
CREATE POLICY "articles_all" ON articles FOR ALL USING (true);
CREATE POLICY "quiz_questions_all" ON quiz_questions FOR ALL USING (true);
CREATE POLICY "user_progress_all" ON user_progress FOR ALL USING (true);
CREATE POLICY "spaced_rep_all" ON spaced_rep_schedule FOR ALL USING (true);
