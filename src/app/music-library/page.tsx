'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  Music2,
  Play,
  Pause,
  Volume2,
  Sparkles,
  Download,
  Filter,
  Check,
  Disc,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MusicLibraryPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Active audio player state
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`/api/music${selectedGenre !== 'all' ? `?genre=${selectedGenre}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedGenre]);

  const togglePlayTrack = (track: any) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const genres = ['all', 'soft', 'upbeat', 'cinematic', 'energetic', 'corporate', 'chill'];

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-20 px-8 pb-16 max-w-7xl mx-auto space-y-8">
          {/* Hidden HTML5 Audio Element for Sound Previews */}
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            onError={() => {
              toast.error('Could not stream audio preview');
              setIsPlaying(false);
            }}
          />

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
                <Music2 className="w-3.5 h-3.5 text-cyan-400" /> Curated Audio Vault
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Royalty-Free Music Library</h1>
              <p className="text-xs text-slate-400 mt-1">
                12 professionally mastered tracks with automated audio ducking presets.
              </p>
            </div>

            {/* Now Playing Mini Player */}
            {currentTrack && (
              <div className="p-3 rounded-2xl glass-panel border border-purple-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center animate-pulse">
                  <Disc className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{currentTrack.title}</p>
                  <p className="text-[10px] text-slate-400">{currentTrack.artist}</p>
                </div>
                <button
                  onClick={() => togglePlayTrack(currentTrack)}
                  className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Mood Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-slate-500 mr-1 flex-shrink-0" />
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  selectedGenre === g
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold shadow-md shadow-purple-900/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Tracks List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-28 rounded-2xl glass-panel border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id && isPlaying;
                return (
                  <div
                    key={track.id}
                    className={`p-5 rounded-3xl glass-panel border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-purple-500/60 bg-purple-950/20 shadow-lg shadow-purple-950/40'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePlayTrack(track)}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-gradient-to-tr from-purple-600 to-cyan-400 text-white shadow-lg'
                              : 'bg-white/[0.06] hover:bg-white/15 text-white'
                          }`}
                        >
                          {isCurrent ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <div>
                          <h4 className="text-xs font-bold text-white">{track.title}</h4>
                          <p className="text-[11px] text-slate-400">{track.artist}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/5 text-purple-300 border border-white/10">
                        {track.genre}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.04] text-[11px] text-slate-400">
                      <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                      <button
                        onClick={() => {
                          toast.success(`Selected "${track.title}" for your next edit!`);
                        }}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        Use in Project
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
