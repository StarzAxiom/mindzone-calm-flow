import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const MoodCalendar = () => {
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const currentDate = new Date();
  const month = currentDate.toLocaleDateString("en", { month: "long" });
  const year = currentDate.getFullYear();

  // Generate calendar days
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Mock mood data (in real app, this would come from state/database)
  const moodData: Record<number, string> = {
    1: "hsl(48 100% 70%)",
    3: "hsl(200 70% 70%)",
    5: "hsl(30 95% 65%)",
    8: "hsl(200 70% 70%)",
    12: "hsl(48 100% 70%)",
    15: "hsl(160 50% 70%)",
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    setShowMoodDialog(true);
  };

  const handleSaveMood = () => {
    if (selectedMood && selectedDate) {
      toast.success(`Mood saved for ${month} ${selectedDate}`);
      setShowMoodDialog(false);
      setSelectedMood(null);
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <div className="max-w-md mx-auto pt-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">{month}</h1>
            <p className="text-sm text-muted-foreground">{year}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Calendar */}
        <Card className="p-4 bg-card/80 backdrop-blur-sm border-border shadow-soft">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Calendar days */}
            {days.map((day) => {
              const hasMood = moodData[day];
              const isToday = day === currentDate.getDate();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all hover:scale-105 bg-secondary/50 hover:bg-secondary"
                >
                  <span
                    className={`text-sm font-medium ${
                      isToday ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>
                  {hasMood && (
                    <div
                      className="absolute bottom-1 w-2 h-2 rounded-full shadow-glow"
                      style={{ backgroundColor: hasMood }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Mood Legend */}
        <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Mood Legend
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {moods.map((mood) => (
              <div key={mood.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: mood.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {mood.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add Mood Dialog */}
      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedDate && `${month} ${selectedDate}`} - How did you feel?
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

export default MoodCalendar;
