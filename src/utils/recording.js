/**
 * recording.js
 * Recording utility using the Web Audio API's MediaRecorder.
 * Records audio output and allows playback.
 */

class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordings = [];
    this.isRecording = false;
    this.audioContext = null;
    this.destination = null;
    this.recordingStartTime = null;
  }

  /**
   * Initialize the recorder by capturing the audio context destination.
   * Must be called after Tone.js is initialized.
   */
  init() {
    try {
      // Get Tone.js audio context
      this.audioContext = Tone.getContext().rawContext;
      this.destination = this.audioContext.createMediaStreamDestination();

      // Connect Tone.js master output to recorder destination
      Tone.getDestination().connect(this.destination);

      console.log('[AudioRecorder] Initialized');
    } catch (e) {
      console.error('[AudioRecorder] Failed to initialize:', e);
    }
  }

  /**
   * Start recording.
   */
  startRecording() {
    if (this.isRecording) return;

    try {
      if (!this.destination) {
        this.init();
      }

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.destination.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Date.now() - this.recordingStartTime;

        this.recordings.push({
          id: Date.now(),
          blob: audioBlob,
          url: audioUrl,
          duration,
          timestamp: new Date().toLocaleTimeString(),
        });

        console.log('[AudioRecorder] Recording saved, duration:', duration, 'ms');
      };

      this.mediaRecorder.start(100); // collect data every 100ms
      this.recordingStartTime = Date.now();
      this.isRecording = true;

      console.log('[AudioRecorder] Recording started');
    } catch (e) {
      console.error('[AudioRecorder] Failed to start recording:', e);
    }
  }

  /**
   * Stop recording.
   */
  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;

    try {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('[AudioRecorder] Recording stopped');
    } catch (e) {
      console.error('[AudioRecorder] Failed to stop recording:', e);
    }
  }

  /**
   * Play the most recent recording.
   * @returns {HTMLAudioElement | null}
   */
  playLatest() {
    if (this.recordings.length === 0) return null;

    const latest = this.recordings[this.recordings.length - 1];
    const audio = new Audio(latest.url);
    audio.play();
    console.log('[AudioRecorder] Playing latest recording');
    return audio;
  }

  /**
   * Play a specific recording by ID.
   * @param {number} id
   * @returns {HTMLAudioElement | null}
   */
  playById(id) {
    const recording = this.recordings.find((r) => r.id === id);
    if (!recording) return null;

    const audio = new Audio(recording.url);
    audio.play();
    return audio;
  }

  /**
   * Get all recordings.
   * @returns {Array}
   */
  getRecordings() {
    return [...this.recordings];
  }

  /**
   * Get the recording count.
   * @returns {number}
   */
  getCount() {
    return this.recordings.length;
  }

  /**
   * Clear all recordings and free memory.
   */
  clearAll() {
    for (const recording of this.recordings) {
      URL.revokeObjectURL(recording.url);
    }
    this.recordings = [];
    console.log('[AudioRecorder] All recordings cleared');
  }

  /**
   * Dispose the recorder.
   */
  dispose() {
    this.stopRecording();
    this.clearAll();
    this.mediaRecorder = null;
    this.destination = null;
  }
}

// We need Tone imported for init
import * as Tone from 'tone';

// Export singleton
const audioRecorder = new AudioRecorder();
export default audioRecorder;
