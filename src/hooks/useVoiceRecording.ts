'use client';

import { useState, useRef, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

export interface VoiceRecordingHook {
  recordingState: RecordingState;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  clearError: () => void;
}

export function useVoiceRecording(): VoiceRecordingHook {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setRecordingDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setRecordingState('processing');

      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Voice recording is not supported in this browser');
      }

      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;

      // Check supported MIME types (prefer webm, fallback to mp4, then any)
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio format found');
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setRecordingState('error');
        cleanup();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      setRecordingState('recording');

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      
      let errorMessage = 'Failed to start recording';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Microphone permission denied. Please allow microphone access and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Voice recording is not supported in this browser.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setRecordingState('error');
      cleanup();
    }
  }, [cleanup]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        cleanup();
        resolve(null);
        return;
      }

      setRecordingState('processing');

      mediaRecorder.onstop = () => {
        try {
          if (audioChunksRef.current.length === 0) {
            throw new Error('No audio data recorded');
          }

          // Create blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || 'audio/webm'
          });

          cleanup();
          setRecordingState('idle');
          resolve(audioBlob);
        } catch (err) {
          console.error('Failed to process recording:', err);
          setError('Failed to process recording. Please try again.');
          setRecordingState('error');
          cleanup();
          resolve(null);
        }
      };

      // Stop recording
      mediaRecorder.stop();
    });
  }, [cleanup]);

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    cleanup();
    setRecordingState('idle');
    setError(null);
  }, [cleanup]);

  return {
    recordingState,
    isRecording: recordingState === 'recording',
    isProcessing: recordingState === 'processing',
    error,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  };
}
