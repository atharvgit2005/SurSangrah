export default function PitchMeter({ currentPitch, targetScale }) {
  // Convert Western note to Indian swara
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
    <div className="pitch-meter bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl mb-4">Live Feedback</h3>
      
      {currentPitch ? (
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="w-32">Current Note:</span>
            <span className="text-3xl font-bold text-purple-300">
              {getSwaraName(currentPitch.note)}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="w-32">Accuracy:</span>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full" 
                style={{ width: `${100 - Math.abs(currentPitch.cents)}%` }}
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            {currentPitch.cents > 0 ? 'Sharp' : 'Flat'} by {Math.abs(currentPitch.cents)} cents
          </div>
        </div>
      ) : (
        <p className="text-gray-400">Start singing to see feedback...</p>
      )}
    </div>
  );
}