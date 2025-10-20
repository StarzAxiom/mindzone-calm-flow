import { Settings, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BottomNav } from "@/components/BottomNav";

const Profile = () => {
  const moodData = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 75 },
    { day: "Wed", value: 60 },
    { day: "Thu", value: 85 },
    { day: "Fri", value: 90 },
    { day: "Sat", value: 70 },
    { day: "Sun", value: 80 },
  ];

  const maxValue = Math.max(...moodData.map((d) => d.value));

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <div className="max-w-md mx-auto pt-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Your wellness insights
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-card/50 backdrop-blur-sm"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border text-center">
            <p className="text-2xl font-bold text-foreground">47</p>
            <p className="text-xs text-muted-foreground mt-1">Days logged</p>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border text-center">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground mt-1">Calm sessions</p>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border text-center">
            <p className="text-2xl font-bold text-foreground">8h</p>
            <p className="text-xs text-muted-foreground mt-1">Music time</p>
          </Card>
        </div>

        {/* Mood Trend Chart */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              This Week's Mood Trend
            </h3>
          </div>
          <div className="flex items-end justify-between h-32 gap-2">
            {moodData.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-primary shadow-glow transition-all hover:opacity-80"
                  style={{
                    height: `${(item.value / maxValue) * 100}%`,
                    minHeight: "20%",
                  }}
                />
                <span className="text-xs text-muted-foreground">{item.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Summary */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <h3 className="font-semibold text-foreground mb-4">Weekly Summary</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-mood-happy mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  You were happiest on Friday
                </p>
                <p className="text-xs text-muted-foreground">
                  Keep up the good vibes!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-mood-calm mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Most calm sessions on weekends
                </p>
                <p className="text-xs text-muted-foreground">
                  Great for self-care
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <h3 className="font-semibold text-foreground mb-4">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Daily Mood Reminder
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get a gentle nudge at 9 PM
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Weekly Insights
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive summary every Sunday
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground italic">
          "One mood at a time."
        </p>
      </div>

      <MiniPlayer />
      <BottomNav />
    </div>
  );
};

export default Profile;
