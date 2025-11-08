import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/BottomNav";
import { MiniPlayer } from "@/components/MiniPlayer";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import lofiPlant from "@/assets/lofi-plant.png";
import calmWaves from "@/assets/calm-waves.png";

const ambientSounds = [
  {
    name: "Rain",
    embed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/4qVGl7C3CDO89iu9Bv4QBx?utm_source=generator" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
    icon: "🌧️",
  },
  {
    name: "Ocean Waves",
    embed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5pDqjvgYBOONfQ6CJBw9vG?utm_source=generator" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
    icon: "🌊",
  },
  {
    name: "Forest",
    embed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/7w52OZm9f9KZy5oLOCPBTn?utm_source=generator" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
    icon: "🌲",
  },
  {
    name: "White Noise",
    embed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5nDdGMaH9LbMU9W4Gxe8C1?utm_source=generator" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
    icon: "⚪",
  },
];

const quotes = [
  { text: "Breathe in peace, breathe out stress", author: "Unknown" },
  { text: "You are exactly where you need to be", author: "Unknown" },
  { text: "This too shall pass", author: "Persian Proverb" },
  { text: "Be gentle with yourself", author: "Unknown" },
  { text: "One step at a time", author: "Unknown" },
];

const guidedExercises = [
  {
    title: "Body Scan Meditation",
    duration: "10 min",
    description: "Relax each part of your body, from head to toe"
  },
  {
    title: "Loving Kindness",
    duration: "8 min",
    description: "Cultivate compassion for yourself and others"
  },
  {
    title: "Mindful Observation",
    duration: "5 min",
    description: "Focus on your surroundings with full awareness"
  },
];

const CalmZone = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentSound, setCurrentSound] = useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const { checkAndAwardAchievements } = useAchievements();
  const { user } = useAuth();

  const trackCalmExercise = async () => {
    if (!user) return;
    
    const { count } = await supabase
      .from("mood_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count !== null) {
      await checkAndAwardAchievements("calm_exercises", count + 1);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathPhase((prev) => {
          if (prev === "inhale") return "hold";
          if (prev === "hold") return "exhale";
          return "inhale";
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getBreathingText = () => {
    if (breathPhase === "inhale") return "Breathe In";
    if (breathPhase === "hold") return "Hold";
    return "Breathe Out";
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 animate-pulse-glow"
        style={{
          backgroundImage: `url(${calmWaves})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="max-w-md mx-auto pt-8 px-4 space-y-6 animate-fade-in relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calm Zone</h1>
            <p className="text-sm text-muted-foreground">Your peaceful sanctuary</p>
          </div>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="ghost"
            size="icon"
            className="rounded-full bg-card/50 backdrop-blur-sm"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex justify-center py-4">
          <img
            src={lofiPlant}
            alt="Calm companion"
            className="w-32 h-32 animate-float drop-shadow-glow"
          />
        </div>

        <Tabs defaultValue="breathing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="meditation">Meditation</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
          </TabsList>

          <TabsContent value="breathing" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-soft">
              <h3 className="font-semibold text-foreground mb-4">Box Breathing</h3>
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center transition-all duration-1000 ${
                    breathingActive
                      ? breathPhase === "inhale"
                        ? "scale-125 bg-primary/30"
                        : breathPhase === "hold"
                        ? "scale-125 bg-primary/40"
                        : "scale-100 bg-primary/20"
                      : ""
                  }`}
                >
                  <div className="w-24 h-24 rounded-full bg-primary/40 flex items-center justify-center">
                    <span className="text-sm text-foreground font-medium">
                      {breathingActive ? getBreathingText() : "Start"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setBreathingActive(!breathingActive);
                    if (breathingActive) trackCalmExercise();
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  {breathingActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Exercise
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Follow the circle: Inhale → Hold → Exhale (4 seconds each)
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="meditation" className="space-y-4">
            {/* Ambient Sounds */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Ambient Sounds
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {ambientSounds.map((sound, index) => (
                  <Button
                    key={index}
                    variant={currentSound === index ? "default" : "outline"}
                    className="h-auto py-3"
                    onClick={() => {
                      setCurrentSound(index);
                      setSoundEnabled(true);
                    }}
                  >
                    <span className="text-xl mr-2">{sound.icon}</span>
                    <span className="text-sm">{sound.name}</span>
                  </Button>
                ))}
              </div>

              {soundEnabled && (
                <div dangerouslySetInnerHTML={{ __html: ambientSounds[currentSound].embed }} />
              )}
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-soft">
              <h3 className="font-semibold text-foreground mb-4">Meditation Timer</h3>
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl font-bold text-primary">{formatTime(timeLeft)}</div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setTimerActive(!timerActive)}
                    variant={timerActive ? "secondary" : "default"}
                  >
                    {timerActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={async () => {
                      if (timeLeft < 300) await trackCalmExercise();
                      setTimerActive(false);
                      setTimeLeft(300);
                    }}
                    variant="outline"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full">
                  {[5, 10, 15].map((mins) => (
                    <Button
                      key={mins}
                      onClick={() => {
                        setTimeLeft(mins * 60);
                        setTimerActive(false);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      {mins} min
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Guided Exercises
              </h3>
              {guidedExercises.map((exercise, index) => (
                <Card
                  key={index}
                  className="p-4 bg-card/60 backdrop-blur-sm border-border hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{exercise.title}</h4>
                      <p className="text-xs text-muted-foreground">{exercise.description}</p>
                    </div>
                    <span className="text-xs text-primary font-medium">{exercise.duration}</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            {quotes.map((quote, index) => (
              <Card
                key={index}
                className="p-6 bg-card/60 backdrop-blur-sm border-border hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <blockquote className="space-y-2">
                  <p className="text-foreground font-medium italic">"{quote.text}"</p>
                  <footer className="text-sm text-muted-foreground">— {quote.author}</footer>
                </blockquote>
              </Card>
            ))}

            <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
              <h3 className="font-semibold mb-2">Today's Affirmation</h3>
              <p className="text-sm opacity-90">
                "I am worthy of peace and happiness. I choose to focus on what I can control and
                let go of what I cannot."
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MiniPlayer />
      <BottomNav />
    </div>
  );
};

export default CalmZone;
