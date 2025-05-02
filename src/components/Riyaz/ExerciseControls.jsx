import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, List } from 'lucide-react';

// Sample exercises data
const exercises = {
  basic: [
    { id: 'sa_re_ga', name: 'Sa Re Ga Ma', pattern: ['C', 'D', 'E', 'F'], duration: 2 },
    { id: 'aaroh_avroh', name: 'Aaroh-Avroh', pattern: ['C', 'D', 'E', 'F', 'E', 'D', 'C'], duration: 1.5 },
    { id: 'alankar1', name: 'Alankar 1', pattern: ['C', 'E', 'D', 'F', 'E', 'G', 'F', 'A'], duration: 1 }
  ],
  intermediate: [
    { id: 'meend', name: 'Meend Exercise', pattern: ['C', 'E', 'G', 'E', 'C'], duration: 3 },
    { id: 'taan', name: 'Fast Taan', pattern: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'], duration: 0.5 }
  ]
};

export default function ExercisePortal({ scale, onExerciseNoteChange }) {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [tempo, setTempo] = useState(60);
  const audioContextRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      clearTimeout(timerRef.current);
    };
  }, []);

  // Play the current exercise
  useEffect(() => {
    if (!isPlaying || !currentExercise) return;

    const playNextNote = () => {
      if (currentNoteIndex >= currentExercise.pattern.length) {
        if (currentExercise.loop) {
          setCurrentNoteIndex(0);
        } else {
          setIsPlaying(false);
          return;
        }
      }

      const note = currentExercise.pattern[currentNoteIndex];
      onExerciseNoteChange({
        note,
        targetFrequency: getFrequencyForNote(note, scale),
        duration: currentExercise.duration
      });

      // Visual timer for note duration
      const noteDuration = (60 / tempo) * currentExercise.duration * 1000;
      timerRef.current = setTimeout(() => {
        setCurrentNoteIndex(prev => prev + 1);
      }, noteDuration);
    };

    playNextNote();

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentNoteIndex, currentExercise, tempo, scale]);

  const getFrequencyForNote = (note, baseScale) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseIndex = notes.indexOf(baseScale);
    const noteIndex = notes.indexOf(note);
    const distance = noteIndex - baseIndex;
    return 440 * Math.pow(2, distance / 12);
  };

  const startExercise = (exercise) => {
    setCurrentExercise({
      ...exercise,
      pattern: exercise.pattern.map(n => transposeNote(n, scale))
    });
    setCurrentNoteIndex(0);
    setIsPlaying(true);
  };

  const transposeNote = (note, baseScale) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseIndex = notes.indexOf(baseScale);
    const noteIndex = notes.indexOf(note);
    return notes[(noteIndex + baseIndex) % 12];
  };

  const togglePlayback = () => {
    if (!currentExercise) return;
    setIsPlaying(!isPlaying);
  };

  const getSwaraName = (note) => {
    const swaraMap = {
      'C': 'Sa',
      'D': 'Re',
      'E': 'Ga',
      'F': 'Ma',
      'G': 'Pa',
      'A': 'Dha',
      'B': 'Ni'
    };
    return swaraMap[note] || note;
  };

  return (
    <div className="exercise-portal bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl mb-4 flex items-center gap-2">
        <Music className="text-purple-300" size={20} />
        Exercise Portal
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exercise Selection */}
        <div className="md:col-span-1">
          <h4 className="font-medium mb-2 flex items-center gap-1">
            <List size={16} /> Choose Exercise
          </h4>
          
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-purple-300 mb-1">Basic Exercises</h5>
              <div className="space-y-2">
                {exercises.basic.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => startExercise(ex)}
                    className={`w-full text-left p-2 rounded-md transition-all ${
                      currentExercise?.id === ex.id
                        ? 'bg-purple-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-purple-300 mb-1">Intermediate</h5>
              <div className="space-y-2">
                {exercises.intermediate.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => startExercise(ex)}
                    className={`w-full text-left p-2 rounded-md transition-all ${
                      currentExercise?.id === ex.id
                        ? 'bg-purple-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Controls */}
        <div className="md:col-span-2 space-y-6">
          {currentExercise ? (
            <>
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium mb-2">Current Exercise: {currentExercise.name}</h4>
                
                <div className="flex items-center justify-center gap-4 my-4">
                  <div className="text-5xl font-bold text-purple-300">
                    {getSwaraName(currentExercise.pattern[currentNoteIndex % currentExercise.pattern.length])}
                  </div>
                </div>

                <div className="flex justify-center gap-8 mb-4">
                  <button 
                    onClick={() => setCurrentNoteIndex(0)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                  >
                    <SkipBack size={20} />
                  </button>
                  
                  <button
                    onClick={togglePlayback}
                    className="p-4 rounded-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  
                  <button 
                    onClick={() => setCurrentNoteIndex(prev => prev + 1)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                    disabled={currentNoteIndex >= currentExercise.pattern.length - 1}
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm">Tempo:</span>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={tempo}
                    onChange={(e) => setTempo(e.target.value)}
                    className="w-full max-w-xs"
                  />
                  <span className="text-sm w-8">{tempo} BPM</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium mb-2">Exercise Pattern</h4>
                <div className="flex flex-wrap gap-2">
                  {currentExercise.pattern.map((note, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md ${
                        index === currentNoteIndex % currentExercise.pattern.length
                          ? 'bg-purple-600'
                          : 'bg-gray-700'
                      }`}
                    >
                      {getSwaraName(note)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">
              Select an exercise to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}