import { Play, Pause, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useNavigate } from "react-router-dom";

export const MiniPlayer = () => {
  const { currentTrack, isPlaying, togglePlay, nextTrack } = useMusicPlayer();
  const navigate = useNavigate();

  if (!currentTrack) return null;

  return (
    <div 
      className="fixed bottom-20 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40 px-4 py-3 cursor-pointer"
      onClick={() => navigate('/music')}
    >
      <div className="max-w-md mx-auto flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-primary animate-pulse-glow flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {currentTrack.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack.artist}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="rounded-full h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="rounded-full h-10 w-10"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
