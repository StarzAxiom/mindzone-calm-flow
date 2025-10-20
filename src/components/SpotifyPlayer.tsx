import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, ExternalLink } from "lucide-react";

export const SpotifyPlayer = () => {
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");

  const handleAddSpotify = () => {
    // Convert Spotify URL to embed URL
    if (spotifyUrl.includes("spotify.com")) {
      const url = spotifyUrl
        .replace("spotify.com/", "spotify.com/embed/")
        .split("?")[0];
      setEmbedUrl(url);
    }
  };

  // Default lofi playlist
  const defaultPlaylist = "https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn";

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border space-y-4">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Spotify Player</h3>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Paste Spotify playlist/track URL..."
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            className="flex-1 bg-secondary/50 border-border"
          />
          <Button
            onClick={handleAddSpotify}
            size="sm"
            className="bg-gradient-primary"
          >
            Add
          </Button>
        </div>

        {(embedUrl || defaultPlaylist) && (
          <div className="rounded-xl overflow-hidden">
            <iframe
              src={embedUrl || defaultPlaylist}
              width="100%"
              height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="border-0"
            />
          </div>
        )}

        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Open in Spotify
        </a>
      </div>
    </Card>
  );
};
