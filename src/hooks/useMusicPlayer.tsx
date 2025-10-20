import { create } from 'zustand';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  mood: string;
}

interface MusicStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  audioElement: HTMLAudioElement | null;
  
  setAudioElement: (element: HTMLAudioElement) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
}

const tracks: Track[] = [
  {
    id: '1',
    title: 'Lofi Dreams',
    artist: 'Chill Study Beats',
    url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_1808fbf07a.mp3',
    mood: 'Calm'
  },
  {
    id: '2',
    title: 'Peaceful Mind',
    artist: 'Relaxation Zone',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2c4decb6f0.mp3',
    mood: 'Peaceful'
  },
  {
    id: '3',
    title: 'Focus Flow',
    artist: 'Study Session',
    url: 'https://cdn.pixabay.com/audio/2022/10/26/audio_9d871d27e5.mp3',
    mood: 'Energetic'
  },
];

export const useMusicPlayer = create<MusicStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  audioElement: null,

  setAudioElement: (element) => set({ audioElement: element }),

  playTrack: (track) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.src = track.url;
      audioElement.play();
      set({ currentTrack: track, isPlaying: true });
    }
  },

  togglePlay: () => {
    const { audioElement, isPlaying, currentTrack } = get();
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      set({ isPlaying: false });
    } else {
      if (!currentTrack) {
        // Play first track if none selected
        get().playTrack(tracks[0]);
      } else {
        audioElement.play();
        set({ isPlaying: true });
      }
    }
  },

  setVolume: (volume) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume;
    }
    set({ volume });
  },

  setCurrentTime: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
    }
    set({ currentTime: time });
  },

  setDuration: (duration) => set({ duration }),

  nextTrack: () => {
    const { currentTrack } = get();
    if (!currentTrack) {
      get().playTrack(tracks[0]);
      return;
    }
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    get().playTrack(tracks[nextIndex]);
  },

  previousTrack: () => {
    const { currentTrack } = get();
    if (!currentTrack) {
      get().playTrack(tracks[0]);
      return;
    }
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    get().playTrack(tracks[prevIndex]);
  },
}));

export { tracks };
