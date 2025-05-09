import * as Tone from 'tone';
import { NoteSequence } from './openai';
import { Midi } from '@tonejs/midi';

/**
 * Convert a note sequence to an MP3 file by playing and recording MIDI notes
 * @param noteSequence The note sequence to convert
 * @param fileName Optional file name for the downloaded audio file
 */
export const downloadMp3FromNoteSequence = async (
  noteSequence: NoteSequence,
  fileName: string = 'tempoai-composition'
): Promise<void> => {
  try {
    console.log("Starting MP3 file creation with notes:", noteSequence.notes);
    
    // Display an information message about browser playback
    alert("To create MP3, the piano will play audibly. Please ensure your volume is set appropriately.");

    // Wait for Tone.js to be ready and user interaction
    await Tone.start();
    
    // Create a recorder
    const recorder = new Tone.Recorder();
    
    // Create a better piano sound using sampler if available, otherwise use synth
    let instrument;
    try {
      // Use a piano sampler for better sound (if loading succeeds)
      instrument = new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => console.log("Piano samples loaded successfully")
      }).connect(recorder);
      
      // Wait a moment for samples to load
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.warn("Failed to load piano sampler, falling back to synth", error);
      // Fallback to synth
      instrument = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle"
        },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        }
      }).connect(recorder);
    }
    
    // Calculate note duration based on tempo (in seconds)
    const quarterNoteDuration = 60 / noteSequence.tempo;
    
    // Start recording
    recorder.start();
    console.log("Recording started");
    
    // Schedule all notes to play
    const now = Tone.now() + 0.5; // Add a small delay before starting
    let currentTime = now;
    let notesScheduled = 0;
    
    // Play each note
    for (const note of noteSequence.notes) {
      try {
        instrument.triggerAttackRelease(
          note, 
          quarterNoteDuration * 0.8, // Slightly shorter than full duration for separation
          currentTime
        );
        currentTime += quarterNoteDuration;
        notesScheduled++;
      } catch (error) {
        console.warn(`Could not play note ${note}:`, error);
      }
    }
    
    console.log(`Scheduled ${notesScheduled} notes for playback`);
    
    // Calculate total duration plus some buffer
    const totalDuration = (notesScheduled * quarterNoteDuration) + 2;
    console.log(`Recording for ${totalDuration} seconds`);
    
    // Wait until all notes have been played
    await new Promise(resolve => setTimeout(resolve, totalDuration * 1000));
    
    // Stop recording and get the blob
    const audioBlob = await recorder.stop();
    console.log("Recording stopped, audio blob created");
    
    // Create a download link
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.mp3`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Dispose of audio resources
    instrument.dispose();
    recorder.dispose();
    
    console.log("MP3 download completed");
  } catch (error) {
    console.error('Error creating MP3 file:', error);
    throw error;
  }
}; 