import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Music, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoodButton } from "@/components/MoodButton";
import { toast } from "sonner";

const moods = [
  { emoji: "😊", label: "Happy", color: "hsl(48 100% 70%)" },
  { emoji: "😌", label: "Calm", color: "hsl(200 70% 70%)" },
  { emoji: "⚡", label: "Energetic", color: "hsl(30 95% 65%)" },
  { emoji: "😔", label: "Sad", color: "hsl(240 50% 65%)" },
  { emoji: "😰", label: "Anxious", color: "hsl(270 60% 70%)" },
  { emoji: "🕊️", label: "Peaceful", color: "hsl(160 50% 70%)" },
];

const Home = () => {
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleSaveMood = () => {
    if (selectedMood) {
      toast.success("Mood saved to your calendar");
      setShowMoodDialog(false);
      setSelectedMood(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <div className="max-w-md mx-auto pt-8 space-y-6 animate-fade-in">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}, Friend
          </h1>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </header>

        {/* Today's Mood Summary */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Vibe</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">😌</span>
                <div>
                  <p className="font-semibold text-foreground">Calm</p>
                  <p className="text-xs text-muted-foreground">
                    Logged at 10:30 AM
                  </p>
                </div>
              </div>
            </div>
            <div className="w-2 h-24 rounded-full bg-mood-calm shadow-glow" />
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowMoodDialog(true)}
            className="w-full h-16 bg-gradient-primary text-primary-foreground rounded-2xl font-semibold text-lg shadow-glow hover:scale-[1.02] transition-transform"
          >
            <Plus className="mr-2 w-6 h-6" />
            Add Mood
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate("/calm")}
              variant="secondary"
              className="h-16 rounded-2xl font-medium bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50 transition-all"
            >
              <Waves className="mr-2 w-5 h-5" />
              Calm Zone
            </Button>

            <Button
              onClick={() => navigate("/music")}
              variant="secondary"
              className="h-16 rounded-2xl font-medium bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50 transition-all"
            >
              <Music className="mr-2 w-5 h-5" />
              Play Music
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <h3 className="font-semibold text-foreground mb-4">This Week</h3>
          <div className="flex justify-between items-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full ${
                      index < 4 ? "bg-mood-calm" : "bg-muted"
                    } ${index < 4 ? "shadow-glow" : ""}`}
                  />
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      {/* Add Mood Dialog */}
      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              How are you feeling?
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {moods.map((mood) => (
              <MoodButton
                key={mood.label}
                emoji={mood.emoji}
                label={mood.label}
                color={mood.color}
                selected={selectedMood === mood.label}
                onClick={() => setSelectedMood(mood.label)}
              />
            ))}
          </div>
          <Button
            onClick={handleSaveMood}
            disabled={!selectedMood}
            className="w-full bg-gradient-primary text-primary-foreground font-semibold rounded-xl hover:scale-[1.02] transition-transform"
          >
            Save Mood
          </Button>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Home;
