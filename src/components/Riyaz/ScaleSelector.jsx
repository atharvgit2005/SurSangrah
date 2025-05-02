export default function ScaleSelector({ selectedScale, onChange }) {
    const scales = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    return (
      <div className="scale-selector bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl mb-4">Select Scale (Sa)</h3>
        <div className="grid grid-cols-4 gap-2">
          {scales.map(scale => (
            <button
              key={scale}
              className={`py-2 rounded-md transition-all ${
                selectedScale === scale 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => onChange(scale)}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>
    );
  }