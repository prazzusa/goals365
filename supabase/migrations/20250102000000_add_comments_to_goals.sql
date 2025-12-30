-- Add comments column to weekly_goals table
ALTER TABLE public.weekly_goals
ADD COLUMN IF NOT EXISTS comments TEXT;

-- Add comments column to monthly_goals table
ALTER TABLE public.monthly_goals
ADD COLUMN IF NOT EXISTS comments TEXT;

