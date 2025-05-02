import { useState } from 'react';
import AudioAnalyzer from '../components/Riyaz/AudioAnalyzer';
import PitchMeter from '../components/Riyaz/PitchMeter';
import ScaleSelector from '../components/Riyaz/ScaleSelector';
import ExerciseControls from '../components/Riyaz/ExerciseControls';
import Visualization from '../components/Riyaz/Visualization';

export default function Riyaz() {
  const [currentPitch, setCurrentPitch] = useState(null);
  const [selectedScale, setSelectedScale] = useState('C');
  const [exercise, setExercise] = useState('sa_re_ga_ma');

  return (
    <div className="mt-10o
     first-letter:riyaz-container bg-gradient-to-b from-gray-900 to-purple-900 text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-8 text-purple-300">Riyaz - Vocal Coach</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="space-y-6">
          <ScaleSelector 
            selectedScale={selectedScale}
            onChange={setSelectedScale}
          />
          
          <ExerciseControls 
            exercise={exercise}
            onChange={setExercise}
          />
          
          <AudioAnalyzer 
            onPitchDetected={setCurrentPitch}
            scale={selectedScale}
          />
        </div>
        
        {/* Center Panel - Visual Feedback */}
        <div className="lg:col-span-2 space-y-8">
          <PitchMeter 
            currentPitch={currentPitch}
            targetScale={selectedScale}
            exercise={exercise}
          />
          
          <Visualization 
            pitchData={currentPitch}
            scale={selectedScale}
          />
        </div>
      </div>
    </div>
  );
}