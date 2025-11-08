-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mood_entry_id UUID REFERENCES public.mood_entries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for journal_entries
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all journal entries"
  ON public.journal_entries FOR SELECT
  USING (has_role(auth.uid(), 'teacher'::app_role));

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  badge_color TEXT NOT NULL,
  criteria_type TEXT NOT NULL, -- 'mood_streak', 'calm_exercises', 'journal_entries', 'total_moods'
  criteria_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on achievements (readable by all authenticated users)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by authenticated users"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  daily_reminder_enabled BOOLEAN DEFAULT true,
  reminder_time TEXT DEFAULT '09:00',
  weekly_insights_enabled BOOLEAN DEFAULT true,
  push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings"
  ON public.notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON public.notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON public.notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, badge_icon, badge_color, criteria_type, criteria_count) VALUES
  ('First Steps', 'Log your first mood', '🌱', 'hsl(120 60% 50%)', 'total_moods', 1),
  ('Mood Tracker', 'Log moods for 7 days', '📊', 'hsl(200 70% 50%)', 'mood_streak', 7),
  ('Wellness Warrior', 'Log moods for 30 days', '🏆', 'hsl(48 100% 50%)', 'mood_streak', 30),
  ('Mindful Writer', 'Write 10 journal entries', '📝', 'hsl(270 60% 50%)', 'journal_entries', 10),
  ('Calm Master', 'Complete 20 calm exercises', '🧘', 'hsl(160 50% 50%)', 'calm_exercises', 20),
  ('Consistent', 'Log moods for 14 consecutive days', '⭐', 'hsl(30 95% 50%)', 'mood_streak', 14),
  ('Reflection Expert', 'Write 50 journal entries', '📖', 'hsl(240 50% 50%)', 'journal_entries', 50),
  ('Zen Zone', 'Complete 50 calm exercises', '☯️', 'hsl(180 50% 50%)', 'calm_exercises', 50);