import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import lofiPlant from "@/assets/lofi-plant.png";
import calmWaves from "@/assets/calm-waves.png";

const quotes = [
  {
    text: "Breathe in peace, breathe out stress",
    author: "Unknown",
  },
  {
    text: "You are exactly where you need to be",
    author: "Unknown",
  },
  {
    text: "This too shall pass",
    author: "Persian Proverb",
  },
  {
    text: "Be gentle with yourself",
    author: "Unknown",
  },
  {
    text: "One step at a time",
    author: "Unknown",
  },
];

const CalmZone = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 relative overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0 opacity-20 animate-pulse-glow"
        style={{
          backgroundImage: `url(${calmWaves})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="max-w-md mx-auto pt-8 px-4 space-y-6 animate-fade-in relative z-10">
        {/* Header with sound toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calm Zone</h1>
            <p className="text-sm text-muted-foreground">
              Your peaceful sanctuary
            </p>
          </div>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="ghost"
            size="icon"
            className="rounded-full bg-card/50 backdrop-blur-sm"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Lofi Plant Character */}
        <div className="flex justify-center py-8">
          <img
            src={lofiPlant}
            alt="Calm companion"
            className="w-48 h-48 animate-float drop-shadow-glow"
          />
        </div>

        {/* Breathing Exercise */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-soft">
          <h3 className="font-semibold text-foreground mb-4">
            Breathing Exercise
          </h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <div className="w-24 h-24 rounded-full bg-primary/40 flex items-center justify-center">
                <span className="text-sm text-foreground font-medium">
                  Breathe
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Inhale for 4 seconds, hold for 4, exhale for 4
            </p>
          </div>
        </Card>

        {/* Calming Quotes Feed */}
        <div className="space-y-4">
          {quotes.map((quote, index) => (
            <Card
              key={index}
              className="p-6 bg-card/60 backdrop-blur-sm border-border hover:scale-[1.02] transition-transform cursor-pointer"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <blockquote className="space-y-2">
                <p className="text-foreground font-medium italic">
                  "{quote.text}"
                </p>
                <footer className="text-sm text-muted-foreground">
                  — {quote.author}
                </footer>
              </blockquote>
            </Card>
          ))}
        </div>

        {/* Affirmation */}
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <h3 className="font-semibold mb-2">Today's Affirmation</h3>
          <p className="text-sm opacity-90">
            "I am worthy of peace and happiness. I choose to focus on what I can
            control and let go of what I cannot."
          </p>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default CalmZone;
