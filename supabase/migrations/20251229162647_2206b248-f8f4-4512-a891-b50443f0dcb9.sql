-- Add user preferences table for adaptive onboarding
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  experience_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  daily_time INTEGER DEFAULT 30, -- minutes available per day
  motivation_style TEXT DEFAULT 'gentle', -- gentle, structured, challenging
  gender TEXT, -- optional, for fitness personalization
  archetype TEXT, -- explorer, builder, rebalancer, achiever, harmonizer
  selected_categories TEXT[] DEFAULT '{}', -- personal, professional, fitness
  is_premium BOOLEAN DEFAULT false,
  roadmap_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add momentum score table
CREATE TABLE public.momentum_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score INTEGER DEFAULT 0, -- 0-1000
  level TEXT DEFAULT 'seed', -- seed, build, rise, flow, mastery
  consistency_score INTEGER DEFAULT 0,
  effort_score INTEGER DEFAULT 0,
  recovery_score INTEGER DEFAULT 0,
  balance_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_goals_completed INTEGER DEFAULT 0,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Add daily insights table
CREATE TABLE public.daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  mood TEXT, -- optional mood tracking
  energy_level INTEGER, -- 1-5
  suggestion TEXT,
  message TEXT,
  category TEXT, -- personal, professional, fitness
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momentum_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for momentum_scores
CREATE POLICY "Users can view their own momentum scores"
ON public.momentum_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own momentum scores"
ON public.momentum_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own momentum scores"
ON public.momentum_scores FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for daily_insights
CREATE POLICY "Users can view their own insights"
ON public.daily_insights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
ON public.daily_insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
ON public.daily_insights FOR UPDATE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_momentum_scores_updated_at
BEFORE UPDATE ON public.momentum_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to create user_preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  INSERT INTO public.onboarding_progress (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;