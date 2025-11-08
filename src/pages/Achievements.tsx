import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementBadge } from "@/components/AchievementBadge";

const Achievements = () => {
  const navigate = useNavigate();
  const { achievements, loading, getProgress, isEarned } = useAchievements();

  const earnedCount = achievements.filter((a) => isEarned(a.id)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <p className="text-muted-foreground">Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Achievements
              </h1>
              <p className="text-sm text-muted-foreground">
                {earnedCount} of {achievements.length} unlocked
              </p>
            </div>
          </div>
          <Trophy className="w-6 h-6 text-primary" />
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              icon={achievement.badge_icon}
              name={achievement.name}
              description={achievement.description}
              color={achievement.badge_color}
              progress={getProgress(achievement)}
              target={achievement.criteria_count}
              earned={isEarned(achievement.id)}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Achievements;
