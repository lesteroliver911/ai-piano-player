// OpenAI API service for music generation
import { Midi } from '@tonejs/midi';

export interface OpenAIConfig {
  apiKey: string;
}

export interface Note {
  pitch: string;
  duration: number;
  velocity: number;
}

export interface NoteSequence {
  notes: Note[] | string[];
  tempo: number;
}

// For backward compatibility with existing code
export interface SimpleNoteSequence {
  notes: string[];
  tempo: number;
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Default configuration values
const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 1000;

// Store API key in memory (not persisted to localStorage)
let apiKeyInMemory: string | null = null;

export const setApiKey = (key: string): void => {
  apiKeyInMemory = key;
};

export const getApiKey = (): string | null => {
  return apiKeyInMemory;
};

export const clearApiKey = (): void => {
  apiKeyInMemory = null;
};

// Check if API key is set
export const hasApiKey = (): boolean => {
  return !!apiKeyInMemory;
};

// Generate music from a prompt using OpenAI's API
export const generateMusicFromPrompt = async (
  prompt: string,
  options?: GenerateOptions
): Promise<NoteSequence> => {
  if (!apiKeyInMemory) {
    throw new Error("OpenAI API key is not set");
  }

  // Use provided options or defaults
  const model = options?.model || DEFAULT_MODEL;
  const temperature = options?.temperature ?? DEFAULT_TEMPERATURE;
  const maxTokens = options?.maxTokens || DEFAULT_MAX_TOKENS;

  const systemPrompt = `You are a world-class composer and concert pianist with deep expertise in music theory, composition techniques, and emotional expression through piano performance. Your task is to create captivating, emotionally resonant piano compositions that showcase both technical brilliance and artistic sensitivity.

  RESPONSE FORMAT:
  Return ONLY a valid JSON object with the following structure:
  {
    "notes": ["C4", "E4", "G4", ...],
    "tempo": 120
  }

  MUSICAL COMPOSITION GUIDELINES:
  - Incorporate proper musical phrasing with tension and resolution
  - Create clear melodic themes with development and variation
  - Balance repetition and novelty to maintain interest
  - Ensure harmonic coherence with meaningful chord progressions
  - Design dynamic contours that enhance emotional expression
  - Include musical ornaments like trills, grace notes, or arpeggios where appropriate
  - Consider voice leading principles for smooth melodic lines

  TECHNICAL SPECIFICATIONS:
  - Notes must use scientific pitch notation (e.g., C4, F#5, Bb3)
  - Generate 32-128 notes to create a complete musical idea with development and resolution
  - Select an appropriate tempo that enhances the mood:
    * Grave/Very slow: 40-60 BPM (profound, solemn)
    * Adagio/Slow: 60-72 BPM (expressive, contemplative)
    * Andante/Moderate: 73-108 BPM (walking pace, flowing)
    * Allegro/Fast: 109-132 BPM (lively, bright)
    * Vivace/Very fast: 133-168 BPM (vibrant, energetic)
    * Presto/Extremely fast: 169-200 BPM (rapid, urgent)
  
  EXPRESSIVE ELEMENTS:
  - Consider the emotional intent of the request (joyful, melancholic, dramatic, etc.)
  - Use register contrast (high vs. low notes) for expressive effect
  - Incorporate varied note durations to create rhythmic interest
  - Think in terms of musical gestures that convey specific emotions
  - Create a satisfying beginning, middle, and end to the musical phrase

  IMPORTANT: Return only the JSON object with notes as an array of strings in scientific pitch notation (e.g., ["C4", "E4", "G4", ...]) without explanations, comments, or markdown formatting.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKeyInMemory}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from OpenAI response");
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    console.log("Parsed response:", parsedResponse);

    // Validate the response format
    if (
      !Array.isArray(parsedResponse.notes) ||
      typeof parsedResponse.tempo !== "number"
    ) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      notes: parsedResponse.notes,
      tempo: parsedResponse.tempo,
    };
  } catch (error) {
    console.error("Error generating music:", error);
    throw error;
  }
};

/**
 * Convert a note sequence to a MIDI file and trigger download
 * @param noteSequence The note sequence to convert
 * @param fileName Optional file name for the downloaded MIDI file
 */
export const downloadMidiFromNoteSequence = (
  noteSequence: NoteSequence | SimpleNoteSequence,
  fileName: string = 'ai-piano-performer'
): void => {
  try {
    console.log("Starting MIDI file creation with notes:", noteSequence.notes);
    
    // Create a new MIDI file
    const midi = new Midi();
    console.log("MIDI object created");
    
    // Add a track
    const track = midi.addTrack();
    track.instrument.name = "Piano";
    console.log("Track added");
    
    // Set tempo
    midi.header.setTempo(noteSequence.tempo);
    midi.header.timeSignatures = [{
      ticks: 0,
      timeSignature: [4, 4]
    }];
    console.log("Tempo and time signature set");
    
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
    
    let currentTime = 0;
    let notesAdded = 0;
    
    // Check if each note is a string or an object
    const firstNote = noteSequence.notes[0];
    console.log("First note type:", typeof firstNote);
    console.log("First note:", firstNote);
    
    if (typeof firstNote === 'string') {
      // Process string-based notes
      const stringNotes = noteSequence.notes as string[];
      console.log("Processing string-based notes, count:", stringNotes.length);
      
      stringNotes.forEach((noteStr, index) => {
        try {
          console.log(`Processing note ${index + 1}/${stringNotes.length}: ${noteStr}`);
          
          // Parse scientific notation with regex
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
            
            console.log(`Converted ${noteStr} to MIDI note number: ${midiNoteNumber}`);
            
            // Add note using midi note number directly
            track.addNote({
              midi: midiNoteNumber,
              time: currentTime,
              duration: 0.5,
              velocity: 0.8
            });
            
            notesAdded++;
            console.log(`Added note: ${noteStr} (MIDI: ${midiNoteNumber})`);
            
            // Move time forward
            currentTime += 0.5;
          } else {
            console.warn(`Could not parse note: ${noteStr}, skipping`);
          }
        } catch (noteError) {
          console.error(`Error processing note ${noteStr}:`, noteError);
        }
      });
    } else if (typeof firstNote === 'object' && firstNote !== null) {
      // Process object-based notes
      console.log("Processing object-based notes");
      
      // Check if we're dealing with the proper structure
      // @ts-ignore
      if (firstNote.pitch) {
        // Process notes with pitch, duration, velocity
        noteSequence.notes.forEach((note: any, index) => {
          try {
            const pitch = note.pitch;
            const duration = typeof note.duration === 'number' ? note.duration : 0.5;
            const velocity = typeof note.velocity === 'number' ? Math.max(0, Math.min(1, note.velocity)) : 0.8;
            
            console.log(`Processing note ${index + 1}/${noteSequence.notes.length}: ${pitch} (duration: ${duration}, velocity: ${velocity})`);
            
            // Parse scientific notation
            const match = pitch.match(/^([A-G][#b]?)(\d+)$/);
            
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
              
              console.log(`Converted ${pitch} to MIDI note number: ${midiNoteNumber}`);
              
              // Add note with specified duration and velocity
              track.addNote({
                midi: midiNoteNumber,
                time: currentTime,
                duration: duration,
                velocity: velocity
              });
              
              notesAdded++;
              console.log(`Added note: ${pitch} (MIDI: ${midiNoteNumber})`);
              
              // Move time forward by this note's duration
              currentTime += duration;
            } else {
              console.warn(`Could not parse note: ${pitch}, skipping`);
            }
          } catch (noteError) {
            console.error(`Error processing note:`, noteError);
          }
        });
      } else {
        throw new Error("Notes have an unexpected object format");
      }
    } else {
      throw new Error(`Unexpected note format: ${typeof firstNote}`);
    }
    
    console.log(`Total notes added: ${notesAdded} out of ${noteSequence.notes.length}`);
    
    if (notesAdded === 0) {
      throw new Error("No valid notes were generated");
    }
    
    // Convert to array buffer
    console.log("Converting MIDI to array buffer");
    const midiArrayBuffer = midi.toArray();
    
    // Create a blob
    const blob = new Blob([midiArrayBuffer], { type: 'audio/midi' });
    console.log("MIDI blob created");
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.mid`;
    
    console.log("Triggering download");
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    console.log("MIDI download completed");
  } catch (error) {
    console.error('Error creating MIDI file:', error);
    throw error;
  }
};
