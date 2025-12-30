-- Add status column to monthly_goals table
ALTER TABLE public.monthly_goals 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done'));

