import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useTheme = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [backgroundColor, setBackgroundColor] = useState("222 28% 12%");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("theme, background_color")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        
        if (data) {
          setTheme(data.theme as "light" | "dark");
          setBackgroundColor(data.background_color);
          applyTheme(data.theme as "light" | "dark", data.background_color);
        } else {
          applyTheme(theme, backgroundColor);
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const applyTheme = (newTheme: "light" | "dark", bgColor: string) => {
    const root = document.documentElement;
    
    if (newTheme === "light") {
      root.style.setProperty("--background", "0 0% 100%");
      root.style.setProperty("--foreground", "222 47% 11%");
      root.style.setProperty("--card", "0 0% 100%");
      root.style.setProperty("--card-foreground", "222 47% 11%");
      root.style.setProperty("--popover", "0 0% 100%");
      root.style.setProperty("--popover-foreground", "222 47% 11%");
      root.style.setProperty("--primary", "258 30% 55%");
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--secondary", "210 40% 96%");
      root.style.setProperty("--secondary-foreground", "222 47% 11%");
      root.style.setProperty("--muted", "210 40% 96%");
      root.style.setProperty("--muted-foreground", "215 16% 47%");
      root.style.setProperty("--accent", "320 55% 60%");
      root.style.setProperty("--accent-foreground", "0 0% 100%");
      root.style.setProperty("--border", "214 32% 91%");
      root.style.setProperty("--input", "214 32% 91%");
    } else {
      root.style.setProperty("--background", bgColor);
      root.style.setProperty("--foreground", "240 10% 90%");
      root.style.setProperty("--card", "222 26% 16%");
      root.style.setProperty("--card-foreground", "240 10% 90%");
      root.style.setProperty("--popover", "222 26% 16%");
      root.style.setProperty("--popover-foreground", "240 10% 90%");
      root.style.setProperty("--primary", "258 30% 65%");
      root.style.setProperty("--primary-foreground", "240 10% 98%");
      root.style.setProperty("--secondary", "222 24% 20%");
      root.style.setProperty("--secondary-foreground", "240 10% 90%");
      root.style.setProperty("--muted", "222 22% 22%");
      root.style.setProperty("--muted-foreground", "240 8% 60%");
      root.style.setProperty("--accent", "320 55% 70%");
      root.style.setProperty("--accent-foreground", "240 10% 98%");
      root.style.setProperty("--border", "222 20% 25%");
      root.style.setProperty("--input", "222 22% 22%");
    }
  };

  const updateTheme = async (newTheme: "light" | "dark", newBgColor?: string) => {
    if (!user) return;

    const bgToUse = newBgColor || backgroundColor;
    setTheme(newTheme);
    if (newBgColor) setBackgroundColor(newBgColor);
    applyTheme(newTheme, bgToUse);

    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          theme: newTheme,
          background_color: bgToUse,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  return { theme, backgroundColor, loading, updateTheme };
};
