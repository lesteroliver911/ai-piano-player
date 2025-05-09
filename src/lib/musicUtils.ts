// Utility functions for music generation and playback

// Validate if a note is in the correct format (e.g., C4, F#5, Bb3)
export const isValidNote = (note: string): boolean => {
  // Scientific pitch notation regex: note name (A-G), optional accidental (#, b), octave number
  const regex = /^[A-G](#|b)?[0-8]$/;
  return regex.test(note);
};

// Filter and validate notes
export const validateNotes = (notes: string[]): string[] => {
  return notes.filter((note) => isValidNote(note));
};

// Convert tempo (BPM) to milliseconds per beat
export const tempoToMs = (tempo: number, beatDivision: number = 1): number => {
  // 60000 ms in a minute / tempo (beats per minute) / beat division
  return 60000 / tempo / beatDivision;
};

// Simple note to frequency mapping for audio playback
export const noteToFrequency = (note: string): number => {
  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // Parse the note
  const noteName = note.replace(/[0-8]$/, "");
  const octave = parseInt(note.slice(-1));

  // Handle flats by converting to equivalent sharps
  const normalizedNoteName = noteName
    .replace("Bb", "A#")
    .replace("Db", "C#")
    .replace("Eb", "D#")
    .replace("Gb", "F#")
    .replace("Ab", "G#");

  // Find the note index
  const noteIndex = notes.indexOf(normalizedNoteName);

  if (noteIndex === -1) return 0; // Invalid note

  // Calculate frequency using the formula: f = 440 * 2^((n-49)/12)
  // where n is the number of semitones from A4 (which is 49)
  const semitonesFromA4 = (octave - 4) * 12 + noteIndex - 9;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
};

// Create a simple audio context and play a note
let audioContext: AudioContext | null = null;

export const playNote = (note: string, duration: number = 0.5): void => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }

  const frequency = noteToFrequency(note);
  if (frequency === 0) return; // Invalid note

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // Apply envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};

// Stop all audio
export const stopAllAudio = (): void => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};
