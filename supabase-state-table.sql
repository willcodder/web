-- Simple JSONB state table (one row per user, stores the full app state)
CREATE TABLE public.app_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own state"
  ON public.app_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own state"
  ON public.app_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own state"
  ON public.app_state FOR UPDATE
  USING (auth.uid() = user_id);
