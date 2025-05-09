import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, SkipBack, SkipForward, Music, Volume2 } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onTempoChange: (tempo: number) => void;
  onVolumeChange?: (volume: number) => void;
  onDownloadMidi: () => void;
  tempo: number;
  volume?: number;
  disabled?: boolean;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying = false,
  onPlay = () => {},
  onPause = () => {},
  onStop = () => {},
  onTempoChange = () => {},
  onVolumeChange = () => {},
  onDownloadMidi = () => {},
  tempo = 120,
  volume = 1.0,
  disabled = false,
}) => {
  const [localTempo, setLocalTempo] = useState<number>(tempo);
  const [localVolume, setLocalVolume] = useState<number>(volume);

  // Update local values when props change
  useEffect(() => {
    setLocalTempo(tempo);
  }, [tempo]);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0];
    setLocalTempo(newTempo);
    onTempoChange(newTempo);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  };

  return (
    <div className="bg-background w-full p-4 rounded-lg border shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onStop}
          aria-label="Stop"
          disabled={disabled}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {isPlaying ? (
          <Button
            variant="outline"
            size="icon"
            onClick={onPause}
            aria-label="Pause"
            disabled={disabled}
          >
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onPlay}
            aria-label="Play"
            disabled={disabled}
          >
            <Play className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={onStop}
          aria-label="Stop"
          disabled={disabled}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium min-w-16">
          Tempo: {localTempo} BPM
        </span>
        <Slider
          defaultValue={[tempo]}
          min={40}
          max={240}
          step={1}
          value={[localTempo]}
          onValueChange={handleTempoChange}
          className="flex-1"
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium min-w-16 flex items-center">
          <Volume2 className="h-4 w-4 mr-1" />
          {Math.round(localVolume * 100)}%
        </span>
        <Slider
          defaultValue={[volume]}
          min={0}
          max={1}
          step={0.01}
          value={[localVolume]}
          onValueChange={handleVolumeChange}
          className="flex-1"
          disabled={disabled}
        />
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={disabled}
          onClick={onDownloadMidi}
        >
          <Music className="h-4 w-4" />
          Download MIDI
        </Button>
      </div>
    </div>
  );
};

export default PlaybackControls;
