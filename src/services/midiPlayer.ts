import MidiPlayer from 'midi-player-js';
import Soundfont from 'soundfont-player';
import { NoteSequence } from './openai';
import { Midi } from '@tonejs/midi';

// For storing the player instance
let midiPlayer: MidiPlayer.Player | null = null;
let audioContext: AudioContext | null = null;
let instrument: Soundfont.Player | null = null;
let isInitialized = false;
let currentTempo = 120;
let globalVolume = 1.0; // Default volume (range: 0.0 to 1.0)
let gainNode: GainNode | null = null;

// Callback for tracking the currently playing note
let noteCallback: ((note: string | null) => void) | null = null;

/**
 * Initialize the MIDI player
 */
export const initMidiPlayer = async (): Promise<void> => {
  try {
    // Create or resume audio context (must be in response to a user gesture)
    if (!audioContext) {
      // @ts-ignore - for Safari compatibility
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a gain node for volume control
      gainNode = audioContext.createGain();
      gainNode.gain.value = globalVolume;
      gainNode.connect(audioContext.destination);
    } else if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Reset the player if it already exists
    if (midiPlayer) {
      midiPlayer.stop();
    }
    
    // Load the piano instrument
    if (!instrument) {
      console.log('Loading piano soundfont...');
      try {
        instrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano', {
          soundfont: 'MusyngKite',
          format: 'mp3',
          // Connect to the gain node instead of directly to destination
          destination: gainNode || undefined
        });
        console.log('Piano soundfont loaded successfully');
      } catch (err) {
        console.error('Failed to load piano soundfont, using fallback', err);
        // Fallback to a simpler instrument if loading fails
        instrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano', {
          destination: gainNode || undefined
        });
      }
    }
    
    // Initialize MIDI player
    midiPlayer = new MidiPlayer.Player((event) => {
      if (event.name === 'Note on' && event.velocity > 0) {
        // Extract the note name
        const noteName = event.noteName;
        
        // Call the note callback if defined
        if (noteCallback && noteName) {
          // Convert to scientific notation (e.g., C4, F#5)
          const scientificNotation = noteName;
          noteCallback(scientificNotation);
        }
        
        // Play the note
        try {
          if (instrument && audioContext) {
            instrument.play(event.noteName, audioContext.currentTime, {
              gain: (event.velocity / 100) * globalVolume, // Apply global volume
              duration: event.duration / 1000,
            });
          }
        } catch (err) {
          console.error('Error playing note:', event.noteName, err);
        }
      } else if (event.name === 'Note off' || (event.name === 'Note on' && event.velocity === 0)) {
        // Note off event - could be used to stop visualization
      }
    });
    
    // Set event listeners
    midiPlayer.on('endOfFile', () => {
      console.log('Playback completed');
      if (noteCallback) {
        noteCallback(null); // Clear the current note
      }
      stopMidi();
    });
    
    isInitialized = true;
    console.log('MIDI player initialized successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error initializing MIDI player:', error);
    return Promise.reject(error);
  }
};

/**
 * Set callback for note tracking
 * @param callback Function to call when a note is played
 */
export const setNoteTrackingCallback = (callback: (note: string | null) => void): void => {
  noteCallback = callback;
};

/**
 * Load a note sequence into the MIDI player
 * @param noteSequence The note sequence to load
 */
export const loadNoteSequence = async (noteSequence: NoteSequence): Promise<void> => {
  try {
    console.log('Loading note sequence:', noteSequence);
    
    // Ensure the player is initialized
    await initMidiPlayer();
    
    // Update tempo
    currentTempo = noteSequence.tempo;
    
    if (!midiPlayer) {
      throw new Error('MIDI player not initialized');
    }
    
    // Convert note sequence to MIDI
    const midi = new Midi();
    const track = midi.addTrack();
    track.instrument.name = "Piano";
    
    // Set tempo and time signature
    midi.header.setTempo(noteSequence.tempo);
    midi.header.timeSignatures = [{
      ticks: 0,
      timeSignature: [4, 4]
    }];
    
    // Convert notes to MIDI format and add to track
    let currentTime = 0;
    let notesAdded = 0;
    
    // Map of note names to MIDI note numbers (for middle C octave)
    const noteToMidiBaseC4: Record<string, number> = {
      'C': 60, 'C#': 61, 'Db': 61,
      'D': 62, 'D#': 63, 'Eb': 63,
      'E': 64,
      'F': 65, 'F#': 66, 'Gb': 66,
      'G': 67, 'G#': 68, 'Ab': 68,
      'A': 69, 'A#': 70, 'Bb': 70,
      'B': 71
    };
    
    // Process each note in the sequence
    for (const noteStr of noteSequence.notes) {
      try {
        // Parse scientific notation (e.g., C4, F#5)
        const match = noteStr.match(/^([A-G][#b]?)(\d+)$/);
        
        if (match) {
          const [, noteName, octaveStr] = match;
          const octave = parseInt(octaveStr, 10);
          
          let midiNoteNumber: number;
          
          // Handle direct mapping for common notes
          if (noteName in noteToMidiBaseC4) {
            midiNoteNumber = noteToMidiBaseC4[noteName];
          } else {
            // For less common formats, normalize the note name
            const noteFirstChar = noteName.charAt(0);
            const accidental = noteName.substring(1);
            
            // Get the base note without accidental
            const baseNote = noteFirstChar;
            
            // Start with the base note MIDI number
            midiNoteNumber = noteToMidiBaseC4[baseNote];
            
            // Apply accidental
            if (accidental === '#') {
              midiNoteNumber += 1;
            } else if (accidental === 'b') {
              midiNoteNumber -= 1;
            }
          }
          
          // Adjust for octave (each octave is 12 semitones)
          midiNoteNumber += (octave - 4) * 12;
          
          // Add note
          track.addNote({
            midi: midiNoteNumber,
            time: currentTime,
            duration: 0.5,
            velocity: 0.8
          });
          
          notesAdded++;
          
          // Move time forward
          currentTime += 0.5;
        }
      } catch (error) {
        console.error(`Error processing note ${noteStr}:`, error);
      }
    }
    
    console.log(`Added ${notesAdded} notes to MIDI track`);
    
    if (notesAdded === 0) {
      throw new Error("No valid notes could be added to the MIDI");
    }
    
    // Convert to base64 string for the MIDI player
    const midiArray = midi.toArray();
    const midiBase64 = arrayBufferToBase64(midiArray);
    
    console.log('MIDI data created, loading into player...');
    
    try {
      // Load the MIDI data
      midiPlayer.loadDataUri(`data:audio/midi;base64,${midiBase64}`);
      
      // Set tempo
      midiPlayer.tempo = noteSequence.tempo;
      
      console.log('Note sequence loaded successfully, tempo:', noteSequence.tempo);
    } catch (loadError) {
      console.error('Error loading MIDI data:', loadError);
      throw loadError;
    }
  } catch (error) {
    console.error('Error in loadNoteSequence:', error);
    throw error;
  }
};

/**
 * Play the loaded MIDI
 */
export const playMidi = async (): Promise<void> => {
  try {
    // Make sure the player is ready
    if (!isInitialized) {
      await initMidiPlayer();
    }
    
    // Resume audio context if needed (browsers require user interaction)
    if (audioContext?.state === 'suspended') {
      await audioContext.resume();
    }
    
    if (!midiPlayer) {
      throw new Error('MIDI player is not initialized');
    }
    
    if (!midiPlayer.isPlaying()) {
      console.log('Starting MIDI playback...');
      midiPlayer.play();
      console.log('MIDI playback started');
    } else {
      console.log('MIDI is already playing');
    }
  } catch (error) {
    console.error('Error playing MIDI:', error);
    throw error;
  }
};

/**
 * Pause the MIDI playback
 */
export const pauseMidi = (): void => {
  if (midiPlayer && midiPlayer.isPlaying()) {
    midiPlayer.pause();
    console.log('MIDI playback paused');
  }
};

/**
 * Stop the MIDI playback and reset to beginning
 */
export const stopMidi = (): void => {
  if (midiPlayer) {
    midiPlayer.stop();
    if (noteCallback) {
      noteCallback(null); // Clear the current note
    }
    console.log('MIDI playback stopped');
  }
};

/**
 * Set the tempo for MIDI playback
 * @param tempo The tempo in BPM
 */
export const setMidiTempo = (tempo: number): void => {
  currentTempo = tempo;
  if (midiPlayer) {
    midiPlayer.tempo = tempo;
    console.log(`MIDI tempo set to ${tempo} BPM`);
  }
};

/**
 * Get the current playback state
 * @returns True if MIDI is currently playing
 */
export const isMidiPlaying = (): boolean => {
  return midiPlayer ? midiPlayer.isPlaying() : false;
};

/**
 * Clean up MIDI player resources
 */
export const cleanupMidiPlayer = (): void => {
  if (midiPlayer) {
    midiPlayer.stop();
    midiPlayer = null;
  }
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  
  instrument = null;
  isInitialized = false;
  noteCallback = null;
  console.log('MIDI player resources cleaned up');
};

/**
 * Helper function to convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
}

/**
 * Set the master volume for MIDI playback
 * @param volume Volume level from 0.0 (silent) to 1.0 (full volume)
 */
export const setVolume = (volume: number): void => {
  // Ensure volume is within valid range
  globalVolume = Math.max(0, Math.min(1, volume));
  
  // Update gain node if it exists
  if (gainNode) {
    gainNode.gain.value = globalVolume;
    console.log(`MIDI volume set to ${globalVolume * 100}%`);
  }
};

/**
 * Get the current volume level
 * @returns Current volume (0.0 to 1.0)
 */
export const getVolume = (): number => {
  return globalVolume;
}; 