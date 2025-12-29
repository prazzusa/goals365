-- Add unique constraint for user_id and week_start to enable upsert
ALTER TABLE public.momentum_scores 
ADD CONSTRAINT momentum_scores_user_week_unique UNIQUE (user_id, week_start);