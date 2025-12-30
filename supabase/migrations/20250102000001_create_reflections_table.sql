-- Create reflections table for weekly and monthly reflections
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly')),
  week_start DATE, -- For weekly reflections
  month INTEGER, -- For monthly reflections (1-12)
  year INTEGER, -- For monthly reflections
  achievements TEXT,
  distractions TEXT,
  what_did_not_happen TEXT,
  how_can_i_improve TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, type, week_start, month, year)
);

-- Enable RLS
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reflections" 
ON public.reflections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections" 
ON public.reflections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" 
ON public.reflections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" 
ON public.reflections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for auto-updating updated_at
CREATE TRIGGER update_reflections_updated_at
BEFORE UPDATE ON public.reflections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

