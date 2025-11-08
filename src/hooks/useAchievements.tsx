import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  criteria_type: string;
  criteria_count: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  achievements: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
      loadUserAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("criteria_count", { ascending: true });

    if (error) {
      console.error("Error loading achievements:", error);
      return;
    }

    setAchievements(data || []);
  };

  const loadUserAchievements = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading user achievements:", error);
      setLoading(false);
      return;
    }

    setUserAchievements(data || []);
    setLoading(false);
  };

  const checkAndAwardAchievements = async (
    criteriaType: string,
    currentCount: number
  ) => {
    if (!user) return;

    const eligibleAchievements = achievements.filter(
      (a) => a.criteria_type === criteriaType && a.criteria_count <= currentCount
    );

    for (const achievement of eligibleAchievements) {
      const alreadyEarned = userAchievements.some(
        (ua) => ua.achievement_id === achievement.id
      );

      if (!alreadyEarned) {
        // Award the achievement
        const { error } = await supabase.from("user_achievements").insert({
          user_id: user.id,
          achievement_id: achievement.id,
          progress: currentCount,
        });

        if (!error) {
          toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
            description: achievement.description,
          });
          loadUserAchievements(); // Refresh
        }
      }
    }
  };

  const updateProgress = async (criteriaType: string, count: number) => {
    if (!user) return;

    const relevantAchievements = achievements.filter(
      (a) => a.criteria_type === criteriaType
    );

    for (const achievement of relevantAchievements) {
      const userAch = userAchievements.find(
        (ua) => ua.achievement_id === achievement.id
      );

      if (userAch && userAch.progress < count) {
        await supabase
          .from("user_achievements")
          .update({ progress: count })
          .eq("id", userAch.id);
      }
    }
  };

  const getProgress = (achievement: Achievement): number => {
    const userAch = userAchievements.find(
      (ua) => ua.achievement_id === achievement.id
    );
    return userAch ? userAch.progress : 0;
  };

  const isEarned = (achievementId: string): boolean => {
    return userAchievements.some((ua) => ua.achievement_id === achievementId);
  };

  return {
    achievements,
    userAchievements,
    loading,
    checkAndAwardAchievements,
    updateProgress,
    getProgress,
    isEarned,
  };
};
