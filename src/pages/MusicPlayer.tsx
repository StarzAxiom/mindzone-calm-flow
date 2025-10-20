import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/BottomNav";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";
import { useMusicPlayer, tracks } from "@/hooks/useMusicPlayer";

const playlists = {
  forYou: [
    { name: "Your Daily Mix", mood: "Mixed", tracks: 50, color: "hsl(258 30% 65%)" },
    { name: "Recently Played", mood: "Mixed", tracks: 24, color: "hsl(280 35% 55%)" },
  ],
  focus: [
    { name: "Deep Focus", mood: "Peaceful", tracks: 32, color: "hsl(160 50% 70%)" },
    { name: "Study Session", mood: "Calm", tracks: 28, color: "hsl(200 70% 70%)" },
  ],
  relax: [
    { name: "Calm Vibes", mood: "Calm", tracks: 24, color: "hsl(200 70% 70%)" },
    { name: "Chill Nights", mood: "Calm", tracks: 28, color: "hsl(240 50% 65%)" },
  ],
  sleep: [
    { name: "Sleep Sounds", mood: "Peaceful", tracks: 20, color: "hsl(240 50% 65%)" },
    { name: "Dreamy Ambience", mood: "Peaceful", tracks: 15, color: "hsl(270 60% 70%)" },
  ],
};

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    currentTime, 
    duration,
    setAudioElement,
    togglePlay, 
    playTrack,
    setVolume: setPlayerVolume,
    setCurrentTime,
    setDuration,
    nextTrack,
    previousTrack
  } = useMusicPlayer();

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
      
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => nextTrack();
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [setAudioElement, setCurrentTime, setDuration, nextTrack]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (value: number[]) => {
    setPlayerVolume(value[0] / 100);
  };

  const handleProgressChange = (value: number[]) => {
    setCurrentTime((value[0] / 100) * duration);
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <audio ref={audioRef} />
      
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
              {currentTrack?.title || "No track selected"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentTrack?.artist || "Select a track to play"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              max={100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={previousTrack}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-secondary"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              onClick={togglePlay}
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
              onClick={nextTrack}
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
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Spotify Integration */}
        <SpotifyPlayer />

        {/* Available Tracks */}
        <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Built-in Tracks
          </h2>
          <div className="space-y-2">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                  currentTrack?.id === track.id
                    ? "bg-primary/20 border border-primary"
                    : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground text-sm">{track.title}</p>
                  <p className="text-xs text-muted-foreground">{track.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Playlists by Category */}
        <Tabs defaultValue="forYou" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card/80">
            <TabsTrigger value="forYou">For You</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="relax">Relax</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
          </TabsList>

          {Object.entries(playlists).map(([key, list]) => (
            <TabsContent key={key} value={key} className="space-y-3 mt-4">
              {list.map((playlist) => (
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
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default MusicPlayer;
