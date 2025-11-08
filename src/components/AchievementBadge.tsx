import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  color: string;
  progress: number;
  target: number;
  earned: boolean;
}

export const AchievementBadge = ({
  icon,
  name,
  description,
  color,
  progress,
  target,
  earned,
}: AchievementBadgeProps) => {
  const progressPercent = Math.min((progress / target) * 100, 100);

  return (
    <Card
      className={`p-4 ${
        earned
          ? "bg-card border-border"
          : "bg-card/50 border-border/50 opacity-70"
      } transition-all hover:scale-105`}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
            earned ? "shadow-glow" : "grayscale"
          }`}
          style={earned ? { backgroundColor: color + "33" } : {}}
        >
          {earned ? icon : <Lock className="w-8 h-8 text-muted-foreground" />}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {!earned && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.floor(progressPercent)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
