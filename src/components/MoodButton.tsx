import { cn } from "@/lib/utils";

interface MoodButtonProps {
  emoji: string;
  label: string;
  color: string;
  selected?: boolean;
  onClick?: () => void;
}

export const MoodButton = ({
  emoji,
  label,
  color,
  selected,
  onClick,
}: MoodButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105",
        "border-2 bg-card/50 backdrop-blur-sm",
        selected
          ? "border-primary shadow-glow scale-105"
          : "border-border hover:border-primary/50"
      )}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${color}15, ${color}05)`
          : undefined,
      }}
    >
      <span className="text-4xl">{emoji}</span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
};
