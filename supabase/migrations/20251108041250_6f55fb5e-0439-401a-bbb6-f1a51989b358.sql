-- Create function for updating timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create user settings table for theme and customization preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  background_color TEXT NOT NULL DEFAULT '222 28% 12%',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();