-- Create yearly_goals table
CREATE TABLE public.yearly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('personal', 'professional', 'fitness')),
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly_goals table
CREATE TABLE public.monthly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  yearly_goal_id UUID REFERENCES public.yearly_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly_goals table
CREATE TABLE public.weekly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  monthly_goal_id UUID REFERENCES public.monthly_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  week_start DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_goals table
CREATE TABLE public.daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weekly_goal_id UUID REFERENCES public.weekly_goals(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('personal', 'professional', 'fitness')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.yearly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- Yearly goals policies
CREATE POLICY "Users can view their own yearly goals" ON public.yearly_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own yearly goals" ON public.yearly_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own yearly goals" ON public.yearly_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own yearly goals" ON public.yearly_goals FOR DELETE USING (auth.uid() = user_id);

-- Monthly goals policies
CREATE POLICY "Users can view their own monthly goals" ON public.monthly_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own monthly goals" ON public.monthly_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own monthly goals" ON public.monthly_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own monthly goals" ON public.monthly_goals FOR DELETE USING (auth.uid() = user_id);

-- Weekly goals policies
CREATE POLICY "Users can view their own weekly goals" ON public.weekly_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own weekly goals" ON public.weekly_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weekly goals" ON public.weekly_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weekly goals" ON public.weekly_goals FOR DELETE USING (auth.uid() = user_id);

-- Daily goals policies
CREATE POLICY "Users can view their own daily goals" ON public.daily_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own daily goals" ON public.daily_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily goals" ON public.daily_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily goals" ON public.daily_goals FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_yearly_goals_updated_at BEFORE UPDATE ON public.yearly_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_goals_updated_at BEFORE UPDATE ON public.monthly_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_weekly_goals_updated_at BEFORE UPDATE ON public.weekly_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON public.daily_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();