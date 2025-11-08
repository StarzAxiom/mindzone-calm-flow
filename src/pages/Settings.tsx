import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";

const backgroundOptions = [
  { name: "Deep Navy", value: "222 28% 12%" },
  { name: "Midnight Purple", value: "260 30% 10%" },
  { name: "Forest Green", value: "150 40% 12%" },
  { name: "Charcoal", value: "0 0% 15%" },
  { name: "Deep Blue", value: "210 50% 12%" },
  { name: "Dark Teal", value: "180 40% 12%" },
];

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme, backgroundColor, updateTheme } = useTheme();
  const navigate = useNavigate();
  const [selectedBg, setSelectedBg] = useState(backgroundColor);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setSelectedBg(backgroundColor);
  }, [backgroundColor]);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    updateTheme(newTheme);
    toast.success(`${newTheme === "dark" ? "Dark" : "Light"} mode enabled`);
  };

  const handleBackgroundChange = (bgValue: string) => {
    setSelectedBg(bgValue);
    updateTheme(theme, bgValue);
    toast.success("Background updated");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <div className="max-w-md mx-auto pt-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="rounded-full bg-card/50 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        {/* Theme Toggle */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={handleThemeToggle} />
          </div>
        </Card>

        {/* Background Color Selector */}
        {theme === "dark" && (
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Background Color
                </h3>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred dark theme color
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {backgroundOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleBackgroundChange(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedBg === option.value
                      ? "border-primary scale-105"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: `hsl(${option.value})` }}
                >
                  <p className="text-xs text-foreground font-medium mt-2">
                    {option.name}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* App Info */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <h3 className="font-semibold text-foreground mb-4">About</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>MindZone - Student Wellness App</p>
            <p>Version 1.0.0</p>
            <p className="text-xs italic text-primary">
              "Your mental wellness journey starts here"
            </p>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
