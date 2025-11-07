import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, Users, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface StudentMoodData {
  student_name: string;
  student_id: string;
  recent_moods: Array<{
    mood: string;
    created_at: string;
    note?: string;
  }>;
  mood_count: number;
}

const TeacherDashboard = () => {
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [studentData, setStudentData] = useState<StudentMoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkTeacherRole();
  }, []);

  const checkTeacherRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "teacher")
        .single();

      if (error || !roleData) {
        toast.error("Access denied. This area is for teachers only.");
        navigate("/");
        return;
      }

      setIsTeacher(true);
      fetchStudentMoodData();
    } catch (error) {
      console.error("Error checking role:", error);
      navigate("/");
    }
  };

  const fetchStudentMoodData = async () => {
    try {
      const { data: moodEntries, error } = await supabase
        .from("mood_entries")
        .select(`
          id,
          mood,
          note,
          created_at,
          user_id,
          profiles!inner(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by student
      const studentMap = new Map<string, StudentMoodData>();
      
      moodEntries?.forEach((entry: any) => {
        const studentId = entry.user_id;
        const studentName = entry.profiles?.full_name || "Anonymous Student";

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student_id: studentId,
            student_name: studentName,
            recent_moods: [],
            mood_count: 0,
          });
        }

        const student = studentMap.get(studentId)!;
        student.recent_moods.push({
          mood: entry.mood,
          created_at: entry.created_at,
          note: entry.note,
        });
        student.mood_count++;
      });

      setStudentData(Array.from(studentMap.values()));
    } catch (error: any) {
      toast.error("Failed to load student data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      happy: "😊",
      calm: "😌",
      sad: "😔",
      anxious: "😰",
      excited: "⚡",
    };
    return moodMap[mood.toLowerCase()] || "😊";
  };

  const getMoodColor = (mood: string) => {
    const colorMap: Record<string, string> = {
      happy: "hsl(48 100% 70%)",
      calm: "hsl(200 70% 70%)",
      sad: "hsl(240 50% 65%)",
      anxious: "hsl(270 60% 70%)",
      excited: "hsl(30 95% 65%)",
    };
    return colorMap[mood.toLowerCase()] || "hsl(200 70% 70%)";
  };

  if (loading || isTeacher === null) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Teacher Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitor student wellbeing
              </p>
            </div>
          </div>
          <Users className="w-6 h-6 text-primary" />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {studentData.length}
                </p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {studentData.reduce((acc, s) => acc + s.mood_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {new Date().toLocaleDateString("en", { month: "short" })}
                </p>
                <p className="text-sm text-muted-foreground">Current Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Student List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Student Mood Tracking
          </h2>
          
          {studentData.length === 0 ? (
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border text-center">
              <p className="text-muted-foreground">
                No student mood data available yet
              </p>
            </Card>
          ) : (
            studentData.map((student) => (
              <Card
                key={student.student_id}
                className="p-6 bg-card/80 backdrop-blur-sm border-border hover:scale-[1.01] transition-transform"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {student.student_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {student.mood_count} mood entries
                      </p>
                    </div>
                  </div>

                  {/* Recent Moods */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Recent Moods:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {student.recent_moods.slice(0, 7).map((mood, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: getMoodColor(mood.mood) + "33",
                          }}
                        >
                          <span className="text-xl">{getMoodEmoji(mood.mood)}</span>
                          <div>
                            <p className="text-xs font-medium text-foreground capitalize">
                              {mood.mood}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(mood.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TeacherDashboard;
