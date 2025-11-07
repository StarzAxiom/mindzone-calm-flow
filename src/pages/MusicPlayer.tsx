import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, SkipForward, SkipBack, Plus, Trash2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Song {
  id: string;
  title: string;
  artist?: string;
  url: string;
  thumbnail_url?: string;
  source?: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
}

const MusicPlayer = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);

  // Add song form state
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    url: "",
    source: "youtube" as "youtube" | "spotify" | "soundcloud" | "direct",
  });

  // Add playlist form state
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchPlaylists();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchSongs(selectedPlaylist);
    }
  }, [selectedPlaylist]);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
      if (data && data.length > 0) {
        setSelectedPlaylist(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const fetchSongs = async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("playlist_id", playlistId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSongs(data || []);
      setCurrentSongIndex(0);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  const handleAddPlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("playlists")
        .insert({
          name: newPlaylist.name,
          description: newPlaylist.description,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Playlist created!");
      setPlaylists([data, ...playlists]);
      setSelectedPlaylist(data.id);
      setNewPlaylist({ name: "", description: "" });
      setShowAddPlaylist(false);
    } catch (error: any) {
      toast.error("Failed to create playlist");
      console.error(error);
    }
  };

  const handleAddSong = async () => {
    if (!newSong.title.trim() || !newSong.url.trim() || !selectedPlaylist) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("songs")
        .insert({
          title: newSong.title,
          artist: newSong.artist,
          url: newSong.url,
          source: newSong.source,
          playlist_id: selectedPlaylist,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Song added to playlist!");
      setSongs([...songs, data]);
      setNewSong({ title: "", artist: "", url: "", source: "youtube" });
      setShowAddSong(false);
    } catch (error: any) {
      toast.error("Failed to add song");
      console.error(error);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      const { error } = await supabase.from("songs").delete().eq("id", songId);

      if (error) throw error;

      toast.success("Song removed");
      setSongs(songs.filter((s) => s.id !== songId));
    } catch (error) {
      toast.error("Failed to remove song");
      console.error(error);
    }
  };

  const getEmbedUrl = (song: Song) => {
    if (song.source === "youtube") {
      const videoId = extractYouTubeId(song.url);
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}` : null;
    }
    return song.url;
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const currentSong = songs[currentSongIndex];
  const embedUrl = currentSong ? getEmbedUrl(currentSong) : null;

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Music Player</h1>
            <p className="text-sm text-muted-foreground">Your custom playlists</p>
          </div>
          <Button
            onClick={() => setShowAddPlaylist(true)}
            size="sm"
            className="bg-gradient-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1" />
            Playlist
          </Button>
        </div>

        {/* Playlist Selector */}
        {playlists.length > 0 && (
          <Select value={selectedPlaylist || ""} onValueChange={setSelectedPlaylist}>
            <SelectTrigger className="bg-card/80 backdrop-blur-sm border-border">
              <SelectValue placeholder="Select a playlist" />
            </SelectTrigger>
            <SelectContent>
              {playlists.map((playlist) => (
                <SelectItem key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Player Card */}
        {currentSong && embedUrl ? (
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-soft">
            <div className="space-y-4">
              {/* Video/Audio Player */}
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                {currentSong.source === "youtube" ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title={currentSong.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <audio
                    controls
                    className="w-full"
                    src={embedUrl}
                    autoPlay={isPlaying}
                  />
                )}
              </div>

              {/* Song Info */}
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{currentSong.title}</h3>
                {currentSong.artist && (
                  <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentSongIndex(Math.max(0, currentSongIndex - 1))}
                  disabled={currentSongIndex === 0}
                  className="rounded-full"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  variant="default"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-full h-12 w-12 bg-gradient-primary"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentSongIndex(Math.min(songs.length - 1, currentSongIndex + 1))}
                  disabled={currentSongIndex === songs.length - 1}
                  className="rounded-full"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border text-center">
            <List className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {playlists.length === 0
                ? "Create a playlist to get started"
                : "No songs in this playlist yet"}
            </p>
            {playlists.length > 0 && (
              <Button
                onClick={() => setShowAddSong(true)}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Song
              </Button>
            )}
          </Card>
        )}

        {/* Song List */}
        {songs.length > 0 && (
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Playlist</h3>
              <Button
                onClick={() => setShowAddSong(true)}
                size="sm"
                variant="ghost"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    index === currentSongIndex
                      ? "bg-primary/10"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => setCurrentSongIndex(index)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {song.title}
                    </p>
                    {song.artist && (
                      <p className="text-xs text-muted-foreground truncate">
                        {song.artist}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSong(song.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Add Playlist Dialog */}
      <Dialog open={showAddPlaylist} onOpenChange={setShowAddPlaylist}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playlist-name">Playlist Name *</Label>
              <Input
                id="playlist-name"
                placeholder="My Playlist"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="playlist-desc">Description</Label>
              <Input
                id="playlist-desc"
                placeholder="Optional description"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
              />
            </div>
            <Button
              onClick={handleAddPlaylist}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              Create Playlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Song Dialog */}
      <Dialog open={showAddSong} onOpenChange={setShowAddSong}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="song-title">Song Title *</Label>
              <Input
                id="song-title"
                placeholder="Song name"
                value={newSong.title}
                onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="song-artist">Artist</Label>
              <Input
                id="song-artist"
                placeholder="Artist name"
                value={newSong.artist}
                onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="song-source">Source</Label>
              <Select
                value={newSong.source}
                onValueChange={(value: any) => setNewSong({ ...newSong, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="soundcloud">SoundCloud</SelectItem>
                  <SelectItem value="direct">Direct URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="song-url">URL *</Label>
              <Input
                id="song-url"
                placeholder="https://youtube.com/watch?v=..."
                value={newSong.url}
                onChange={(e) => setNewSong({ ...newSong, url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Paste the full URL from YouTube, Spotify, or any audio file
              </p>
            </div>
            <Button
              onClick={handleAddSong}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              Add Song
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default MusicPlayer;
