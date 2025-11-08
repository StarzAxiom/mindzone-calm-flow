import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState({
    daily_reminder_enabled: true,
    reminder_time: "09:00",
    weekly_insights_enabled: true,
  });

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading notification settings:", error);
      return;
    }

    if (data) {
      setSettings({
        daily_reminder_enabled: data.daily_reminder_enabled,
        reminder_time: data.reminder_time,
        weekly_insights_enabled: data.weekly_insights_enabled,
      });
    } else {
      // Create default settings
      await supabase.from("notification_settings").insert({
        user_id: user.id,
      });
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser doesn't support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast.success("Notifications enabled!");
      scheduleDailyReminder();
      return true;
    } else {
      toast.error("Notification permission denied");
      return false;
    }
  };

  const scheduleDailyReminder = () => {
    if (!settings.daily_reminder_enabled || permission !== "granted") return;

    // Calculate time until next reminder
    const now = new Date();
    const [hours, minutes] = settings.reminder_time.split(":");
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      showNotification(
        "MindZone Reminder",
        "How are you feeling today? Take a moment to log your mood 🌟",
        "/",
      );
      scheduleDailyReminder(); // Reschedule for next day
    }, timeUntilReminder);
  };

  const showNotification = (title: string, body: string, url?: string) => {
    if (permission !== "granted") return;

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "mindzone-notification",
      requireInteraction: false,
    });

    if (url) {
      notification.onclick = () => {
        window.focus();
        window.location.href = url;
        notification.close();
      };
    }
  };

  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    if (!user) return;

    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    await supabase
      .from("notification_settings")
      .upsert({
        user_id: user.id,
        ...updated,
      });

    if (updated.daily_reminder_enabled) {
      scheduleDailyReminder();
    }
  };

  const showWeeklyInsight = (moodCount: number, dominantMood: string) => {
    if (!settings.weekly_insights_enabled || permission !== "granted") return;

    showNotification(
      "Weekly Wellness Insight",
      `You logged ${moodCount} moods this week! Your most common mood was ${dominantMood}. Keep it up! 💪`,
      "/calendar",
    );
  };

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    showNotification,
    showWeeklyInsight,
    scheduleDailyReminder,
  };
};
