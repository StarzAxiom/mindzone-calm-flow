import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, TrendingUp, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface StudentMoodData {
  student_name: string;
  student_id: string;
  recent_moods: Array<{
    mood: string;
    created_at: string;
    note?: string;
  }>;
  journal_entries: Array<{
    content: string;
    created_at: string;
  }>;
  mood_count: number;
}

const TeacherDashboard = () => {
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [studentData, setStudentData] = useState<StudentMoodData[]>([]);
  const [filteredData, setFilteredData] = useState<StudentMoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("30");
  const navigate = useNavigate();

  useEffect(() => {
    checkTeacherRole();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedStudent, timeFilter, studentData]);

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
      const daysAgo = parseInt(timeFilter);
      const dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - daysAgo);

      // Fetch mood entries
      const { data: moodEntries, error: moodError } = await supabase
        .from("mood_entries")
        .select(`
          id,
          mood,
          note,
          created_at,
          user_id,
          profiles!inner(full_name)
        `)
        .gte("created_at", dateFilter.toISOString())
        .order("created_at", { ascending: false });

      if (moodError) throw moodError;

      // Fetch journal entries
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select(`
          content,
          created_at,
          user_id
        `)
        .gte("created_at", dateFilter.toISOString())
        .order("created_at", { ascending: false });

      if (journalError) throw journalError;

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
            journal_entries: [],
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

      // Add journal entries
      journalEntries?.forEach((entry: any) => {
        const student = studentMap.get(entry.user_id);
        if (student) {
          student.journal_entries.push({
            content: entry.content,
            created_at: entry.created_at,
          });
        }
      });

      setStudentData(Array.from(studentMap.values()));
    } catch (error: any) {
      toast.error("Failed to load student data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...studentData];

    if (selectedStudent !== "all") {
      filtered = filtered.filter((s) => s.student_id === selectedStudent);
    }

    setFilteredData(filtered);
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      happy: "😊",
      calm: "😌",
      sad: "😔",
      anxious: "😰",
      energetic: "⚡",
      peaceful: "🕊️",
    };
    return moodMap[mood.toLowerCase()] || "😊";
  };

  const getMoodColor = (mood: string) => {
    const colorMap: Record<string, string> = {
      happy: "hsl(48 100% 70%)",
      calm: "hsl(200 70% 70%)",
      sad: "hsl(240 50% 65%)",
      anxious: "hsl(270 60% 70%)",
      energetic: "hsl(30 95% 65%)",
      peaceful: "hsl(160 50% 70%)",
    };
    return colorMap[mood.toLowerCase()] || "hsl(200 70% 70%)";
  };

  // Prepare chart data
  const getMoodTrendData = () => {
    const allMoods = filteredData.flatMap((s) => s.recent_moods);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map((date) => {
      const dayMoods = allMoods.filter(
        (m) => m.created_at.split("T")[0] === date
      );
      return {
        date: new Date(date).toLocaleDateString("en", { weekday: "short" }),
        count: dayMoods.length,
        positive: dayMoods.filter((m) =>
          ["happy", "calm", "peaceful", "energetic"].includes(m.mood)
        ).length,
        negative: dayMoods.filter((m) =>
          ["sad", "anxious"].includes(m.mood)
        ).length,
      };
    });
  };

  const getMoodDistribution = () => {
    const moodCounts: Record<string, number> = {};
    filteredData.forEach((student) => {
      student.recent_moods.forEach((mood) => {
        moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
      });
    });

    return Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count,
      color: getMoodColor(mood),
    }));
  };

  if (loading || isTeacher === null) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const trendData = getMoodTrendData();
  const distributionData = getMoodDistribution();

  return (
    <div className="min-h-screen bg-gradient-calm pb-24 px-4">
      <div className="max-w-6xl mx-auto pt-8 space-y-6 animate-fade-in">
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

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {studentData.map((student) => (
                <SelectItem key={student.student_id} value={student.student_id}>
                  {student.student_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={(val) => {
            setTimeFilter(val);
            setLoading(true);
            fetchStudentMoodData();
          }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.length}
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
                  {filteredData.reduce((acc, s) => acc + s.mood_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.reduce((acc, s) => acc + s.journal_entries.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Journal Entries</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Mood Trends (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="positive"
                    stroke="hsl(120 60% 50%)"
                    strokeWidth={2}
                    name="Positive Moods"
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    stroke="hsl(270 60% 50%)"
                    strokeWidth={2}
                    name="Negative Moods"
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Total Entries"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Mood Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))">
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <div className="space-y-4">
              {filteredData.length === 0 ? (
                <Card className="p-8 bg-card/80 backdrop-blur-sm border-border text-center">
                  <p className="text-muted-foreground">
                    No student data available for selected filters
                  </p>
                </Card>
              ) : (
                filteredData.map((student) => (
                  <Card
                    key={student.student_id}
                    className="p-6 bg-card/80 backdrop-blur-sm border-border"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {student.student_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {student.mood_count} mood entries · {student.journal_entries.length} journal entries
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

                      {/* Recent Journal Entries */}
                      {student.journal_entries.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Recent Journal Entries:
                          </p>
                          <div className="space-y-2">
                            {student.journal_entries.slice(0, 3).map((entry, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-secondary/50 border border-border"
                              >
                                <p className="text-sm text-foreground line-clamp-2">
                                  {entry.content}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(entry.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default TeacherDashboard;
