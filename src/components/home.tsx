import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PianoKeyboard from "./PianoKeyboard";
import PromptInput from "./PromptInput";
import PlaybackControls from "./PlaybackControls";
import ApiKeyModal from "./ApiKeyModal";
import { Music, Sparkles, Github } from "lucide-react";
import { 
  generateMusicFromPrompt, 
  hasApiKey, 
  downloadMidiFromNoteSequence 
} from "@/services/openai";
import {
  loadNoteSequence,
  playMidi,
  pauseMidi,
  stopMidi,
  setMidiTempo,
  isMidiPlaying,
  cleanupMidiPlayer,
  setNoteTrackingCallback,
  setVolume as setMidiVolume,
  getVolume
} from "@/services/midiPlayer";
import {
  validateNotes,
} from "@/lib/musicUtils";

export default function Home() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [tempo, setTempo] = useState(120);
  const [volume, setVolumeState] = useState(getVolume());
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Check if API key is set on component mount
  useEffect(() => {
    if (!hasApiKey()) {
      setApiKeyModalOpen(true);
    }
  }, []);

  // Clean up MIDI player on unmount
  useEffect(() => {
    return () => {
      cleanupMidiPlayer();
    };
  }, []);

  // Set up note tracking for piano visualization
  useEffect(() => {
    // Set the callback function to update the current note
    setNoteTrackingCallback((note) => {
      setCurrentNote(note);
    });

    // Clean up the callback when component unmounts
    return () => {
      setNoteTrackingCallback(() => {});
    };
  }, []);

  // Add an effect to check if MIDI playback has ended
  useEffect(() => {
    const checkPlaybackStatus = () => {
      // If we're marked as playing but MIDI player reports not playing
      if (isPlaying && !isMidiPlaying()) {
        setIsPlaying(false);
        setCurrentNote(null);
      }
    };

    // Check every second
    const intervalId = setInterval(checkPlaybackStatus, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying]);

  const handleGenerate = async (prompt: string) => {
    // Check if API key is set
    if (!hasApiKey()) {
      setApiKeyModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Call OpenAI API to generate music
      const result = await generateMusicFromPrompt(prompt);

      // Validate the notes
      const validNotes = validateNotes(result.notes);

      if (validNotes.length === 0) {
        throw new Error("No valid notes were generated");
      }

      // Update state with generated notes and tempo
      setGeneratedNotes(validNotes);
      setTempo(result.tempo);

      // Load the note sequence into the MIDI player
      await loadNoteSequence({
        notes: validNotes,
        tempo: result.tempo
      });

      toast({
        title: "Music Generated",
        description: `Created ${validNotes.length} notes at ${result.tempo} BPM`,
      });
    } catch (error) {
      console.error("Error generating music:", error);
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Failed to generate music. Please try again.",
      );
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate music from your prompt.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = async () => {
    if (generatedNotes.length === 0) return;

    try {
      // Start MIDI playback
      await playMidi();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing MIDI:", error);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "Could not play the generated music.",
      });
    }
  };

  const handlePause = () => {
    pauseMidi();
    setIsPlaying(false);
  };

  const handleStop = () => {
    stopMidi();
    setIsPlaying(false);
    setCurrentNote(null);
  };

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    setMidiTempo(newTempo);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolumeState(newVolume);
    // Update the global MIDI player volume
    setMidiVolume(newVolume);
  };

  const handleDownloadMidi = () => {
    if (generatedNotes.length === 0) {
      toast({
        variant: "destructive",
        title: "No music to download",
        description: "Please generate music first before downloading.",
      });
      return;
    }
    
    try {
      // Use the MIDI download function
      downloadMidiFromNoteSequence(
        {
          notes: generatedNotes,
          tempo: tempo
        },
        `ai-piano-performer-${Date.now()}`
      );
      
      toast({
        title: "MIDI Download",
        description: "Your MIDI file has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading MIDI:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download MIDI file. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center">
      <header className="w-full max-w-6xl mb-8 text-center relative">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Music size={32} className="text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">The AI Piano Performer</h1>
          <Sparkles size={24} className="text-primary" />
        </div>
        <p className="text-muted-foreground text-lg">
          A cool fun project that combines music passion and AI knowledge
        </p>
        <a 
          href="https://github.com/lesteroliver911/ai-piano-player" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-0 right-0 inline-flex items-center hover:text-primary transition-colors p-2"
          aria-label="GitHub Repository"
        >
          <Github size={24} />
        </a>
      </header>

      <main className="w-full max-w-6xl flex flex-col items-center gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Virtual Piano</CardTitle>
            <CardDescription>
              Keys will highlight as notes are played during playback
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-8">
            <PianoKeyboard activeNotes={currentNote ? [currentNote] : []} />
          </CardContent>
        </Card>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create Music</CardTitle>
              <CardDescription>
                Describe the type of piano music you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromptInput
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
              {generationError && (
                <p className="mt-2 text-sm text-red-500">{generationError}</p>
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Playback Controls</CardTitle>
              <CardDescription>
                Play, adjust, and download your generated music
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlaybackControls
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onStop={handleStop}
                onTempoChange={handleTempoChange}
                onVolumeChange={handleVolumeChange}
                tempo={tempo}
                volume={volume}
                onDownloadMidi={handleDownloadMidi}
                disabled={generatedNotes.length === 0}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          Prompt engineered and developed with ❤️ by <a href="https://lesteroliver.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">lesteroliver</a>
        </p>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        open={apiKeyModalOpen}
        onOpenChange={setApiKeyModalOpen}
        onApiKeySet={() => {
          toast({
            title: "API Key Saved",
            description: "Your OpenAI API key has been saved for this session.",
          });
        }}
      />
    </div>
  );
}
