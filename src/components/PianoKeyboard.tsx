import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { playNote } from "@/lib/musicUtils";

interface PianoKeyboardProps {
  activeNotes?: string[];
  onKeyPress?: (note: string) => void;
}

const PianoKeyboard = ({
  activeNotes = [],
  onKeyPress,
}: PianoKeyboardProps) => {
  // Piano key definitions
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  // Generate a full piano keyboard (88 keys from A0 to C8)
  const generatePianoKeys = () => {
    const keys = [];
    for (let octave = 0; octave <= 8; octave++) {
      whiteKeys.forEach((note) => {
        // Skip keys outside the 88-key range
        if (
          (octave === 0 && ["A", "B"].indexOf(note) === -1) ||
          (octave === 8 && note !== "C")
        ) {
          return;
        }
        keys.push({ note: `${note}${octave}`, type: "white" });
      });
    }

    for (let octave = 0; octave <= 7; octave++) {
      blackKeys.forEach((note) => {
        // Skip keys outside the 88-key range
        if (octave === 0 && ["A#"].indexOf(note) === -1) {
          return;
        }
        keys.push({ note: `${note}${octave}`, type: "black" });
      });
    }

    // Sort keys by note and octave
    return keys.sort((a, b) => {
      const noteA = a.note.slice(0, -1);
      const noteB = b.note.slice(0, -1);
      const octaveA = parseInt(a.note.slice(-1));
      const octaveB = parseInt(b.note.slice(-1));

      if (octaveA !== octaveB) return octaveA - octaveB;

      const noteOrder = [...whiteKeys, ...blackKeys];
      return noteOrder.indexOf(noteA) - noteOrder.indexOf(noteB);
    });
  };

  // Memoize piano keys to avoid regenerating on every render
  const pianoKeys = useMemo(() => generatePianoKeys(), []);

  // Track previously active notes to play sound only when a note becomes active
  const [prevActiveNotes, setPrevActiveNotes] = useState<string[]>([]);

  // Play sound when a note becomes active
  useEffect(() => {
    // Skip if activeNotes is null or undefined
    if (!activeNotes) return;
    
    // Find notes that weren't active before but are active now
    const newlyActiveNotes = activeNotes.filter(
      (note) => !prevActiveNotes?.includes(note),
    );

    // Play sound for newly active notes
    newlyActiveNotes.forEach((note) => {
      playNote(note, 0.3); // Play for 300ms
    });

    // Update previously active notes
    setPrevActiveNotes(activeNotes);
  }, [activeNotes]);

  const handleKeyClick = (note: string) => {
    // Play the note when clicked
    playNote(note, 0.3);

    if (onKeyPress) {
      onKeyPress(note);
    }
  };

  // Focus visible keys based on active notes
  const visibleOctaveRange = useMemo(() => {
    if (!activeNotes || activeNotes.length === 0) {
      // Default view: show middle octaves (3-5)
      return { min: 3, max: 5 };
    }

    // Extract octaves from active notes
    const octaves = activeNotes.map((note) => parseInt(note.slice(-1)));
    const minOctave = Math.max(0, Math.min(...octaves) - 1);
    const maxOctave = Math.min(8, Math.max(...octaves) + 1);

    return { min: minOctave, max: maxOctave };
  }, [activeNotes]);

  return (
    <div className="w-full overflow-x-auto bg-gray-100 p-4 rounded-lg">
      <div className="relative flex h-48 min-w-[1200px]">
        {/* White keys */}
        <div className="flex relative z-0 w-full">
          {pianoKeys
            .filter((key) => key.type === "white")
            .map((key, index) => {
              const octave = parseInt(key.note.slice(-1));
              const isVisible =
                octave >= visibleOctaveRange.min &&
                octave <= visibleOctaveRange.max;
              const isActive = activeNotes?.includes(key.note);

              return (
                <div
                  key={key.note}
                  onClick={() => handleKeyClick(key.note)}
                  className={cn(
                    "flex-1 border border-gray-300 rounded-b-md bg-white hover:bg-gray-50 cursor-pointer",
                    "flex items-end justify-center pb-2 select-none transition-colors duration-150",
                    isActive && "bg-blue-100 border-blue-300",
                    isVisible ? "opacity-100" : "opacity-50",
                  )}
                >
                  <span className="text-xs text-gray-500">{key.note}</span>
                </div>
              );
            })}
        </div>

        {/* Black keys */}
        <div className="absolute top-0 left-0 flex w-full z-10">
          {pianoKeys
            .filter((key) => key.type === "white")
            .map((key, index) => {
              const note = key.note.slice(0, -1);
              const octave = key.note.slice(-1);
              const hasBlackKey = ["C", "D", "F", "G", "A"].includes(note);

              if (!hasBlackKey)
                return <div key={`spacer-${index}`} className="flex-1"></div>;

              const blackKeyNote = `${note}#${octave}`;
              const isActive = activeNotes?.includes(blackKeyNote);
              const numOctave = parseInt(octave);
              const isVisible =
                numOctave >= visibleOctaveRange.min &&
                numOctave <= visibleOctaveRange.max;

              return (
                <div key={`container-${index}`} className="flex-1 relative">
                  <div
                    onClick={() => handleKeyClick(blackKeyNote)}
                    className={cn(
                      "absolute w-[70%] h-[65%] left-[65%] bg-black hover:bg-gray-800",
                      "rounded-b-md cursor-pointer z-20 transition-colors duration-150",
                      isActive && "bg-blue-800",
                      isVisible ? "opacity-100" : "opacity-50",
                    )}
                  >
                    <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                      {blackKeyNote}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PianoKeyboard;
