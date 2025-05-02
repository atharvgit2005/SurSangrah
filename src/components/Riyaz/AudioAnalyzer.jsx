import { useState, useEffect, useRef } from 'react';
import { AlignJustify, Mic, MicOff, Volume2 } from 'lucide-react';
import { YIN } from 'pitchfinder';

export default function AudioAnalyzer({ onPitchDetected, scale }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const pitchDetector = useRef(null);

  const getSwaraName = (frequency) => {
    if (!frequency) return null;
    
    // Convert frequency to note and Indian swara
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const swaraNames = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
    
    const noteNum = Math.round(12 * Math.log2(frequency / A4)) + 57;
    const noteIndex = noteNum % 12;
    const octave = Math.floor(noteNum / 12);
    
    return {
      note: noteNames[noteIndex],
      swara: swaraNames[noteIndex % 7],
      octave,
      frequency
    };
  };

  const calculateCents = (freq, targetNote) => {
    // Calculate how many cents the pitch is off from the nearest note
    const targetFreq = 440 * Math.pow(2, (targetNote - 69) / 12);
    return 1200 * Math.log2(freq / targetFreq);
  };

  const startListening = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      setPermissionGranted(true);
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      // Initialize pitch detector with actual sample rate
      pitchDetector.current = YIN({ sampleRate: audioContextRef.current.sampleRate });
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      setIsListening(true);
      analyzePitch();
      
    } catch (err) {
      console.error("Audio setup error:", err);
      setError(err.message.includes('permission') ? 
        'Microphone access denied. Please allow microphone permissions.' : 
        'Audio initialization failed. Try refreshing the page.'
      );
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    setIsListening(false);
  };

  const analyzePitch = () => {
    if (!isListening) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);
    
    const frequency = pitchDetector.current(dataArray);
    
    if (frequency && frequency > 50 && frequency < 2000) { // Filter out unrealistic frequencies
      const detectedPitch = getSwaraName(frequency);
      if (detectedPitch) {
        const centsOff = calculateCents(frequency, 69); // Middle A (440Hz)
        onPitchDetected({
          ...detectedPitch,
          cents: Math.round(centsOff),
          accuracy: Math.max(0, 100 - Math.abs(centsOff / 5))
        });
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(analyzePitch);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="audio-analyzer bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl mb-4 flex items-center gap-2">
        <Volume2 className="text-purple-300" size={20} />
        Vocal Analysis
      </h3>
      
      {error ? (
        <div className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">
          {error}
        </div>
      ) : null}
      
      <div className="flex flex-col gap-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition-all ${
            isListening
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isListening ? (
            <>
              <MicOff size={18} /> Stop Listening
            </>
          ) : (
            <>
              <Mic size={18} /> Start Practice
            </>
          )}
        </button>
        
        {permissionGranted && (
          <div className="text-sm text-gray-400">
            {isListening ? (
              <span className="text-green-400">Listening to your voice...</span>
            ) : (
              'Microphone ready. Click above to start.'
            )}
          </div>
        )}
      </div>
    </div>
  );
}