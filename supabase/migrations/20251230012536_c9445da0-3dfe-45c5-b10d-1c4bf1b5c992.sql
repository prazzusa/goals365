-- Create planning_progress table to track where users are in their planning flow
CREATE TABLE public.planning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_phase TEXT NOT NULL DEFAULT 'quarterly', -- 'quarterly', 'monthly', 'weekly', 'completed'
  quarterly_step INTEGER DEFAULT 0,
  monthly_step INTEGER DEFAULT 0,
  weekly_step INTEGER DEFAULT 0,
  quarterly_vision TEXT,
  selected_categories TEXT[] DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.planning_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own planning progress" 
ON public.planning_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planning progress" 
ON public.planning_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planning progress" 
ON public.planning_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for auto-updating updated_at
CREATE TRIGGER update_planning_progress_updated_at
BEFORE UPDATE ON public.planning_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add progress column to monthly_goals for tracking completion percentage
ALTER TABLE public.monthly_goals 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add effort and status columns to weekly_goals for task tracking
ALTER TABLE public.weekly_goals 
ADD COLUMN IF NOT EXISTS effort TEXT DEFAULT 'M',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo',
ADD COLUMN IF NOT EXISTS category TEXT;