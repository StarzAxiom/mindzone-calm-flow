import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { BottomNav } from "@/components/BottomNav";

const playlists = [
  { name: "Calm Vibes", mood: "Calm", tracks: 24, color: "hsl(200 70% 70%)" },
  { name: "Happy Energy", mood: "Happy", tracks: 18, color: "hsl(48 100% 70%)" },
  { name: "Focus Flow", mood: "Peaceful", tracks: 32, color: "hsl(160 50% 70%)" },
  { name: "Chill Nights", mood: "Calm", tracks: 28, color: "hsl(240 50% 65%)" },
];

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <div className="max-w-md mx-auto pt-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Music</h1>
          <p className="text-sm text-muted-foreground">
            Curated for your mood
          </p>
        </div>

        {/* Now Playing */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-soft space-y-6">
          {/* Circular Visualizer */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full bg-gradient-primary animate-pulse-glow" />
              <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary animate-pulse-glow" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Lofi Dreams
            </h3>
            <p className="text-sm text-muted-foreground">Chill Study Beats</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[35]}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1:24</span>
              <span>3:45</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-secondary"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="icon"
              className="w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-secondary"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Mood-based Playlists */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Suggested for you
          </h2>
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <Card
                key={playlist.name}
                className="p-4 bg-card/60 backdrop-blur-sm border-border hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl shadow-glow flex items-center justify-center"
                    style={{ backgroundColor: playlist.color }}
                  >
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {playlist.tracks} tracks · {playlist.mood}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MusicPlayer;
