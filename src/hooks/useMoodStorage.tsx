import { useState, useEffect } from 'react';

interface MoodEntry {
  date: string; // YYYY-MM-DD format
  mood: string;
  color: string;
  emoji: string;
  note?: string;
}

const STORAGE_KEY = 'mindzone_moods';

export const useMoodStorage = () => {
  const [moods, setMoods] = useState<Record<string, MoodEntry>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMoods(JSON.parse(stored));
    }
  }, []);

  const saveMood = (date: string, mood: string, color: string, emoji: string, note?: string) => {
    const newMoods = {
      ...moods,
      [date]: { date, mood, color, emoji, note }
    };
    setMoods(newMoods);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMoods));
  };

  const getMood = (date: string): MoodEntry | undefined => {
    return moods[date];
  };

  const getTodayMood = (): MoodEntry | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return moods[today];
  };

  const getWeekMoods = (): MoodEntry[] => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return Object.values(moods).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekAgo && entryDate <= today;
    });
  };

  return { moods, saveMood, getMood, getTodayMood, getWeekMoods };
};
