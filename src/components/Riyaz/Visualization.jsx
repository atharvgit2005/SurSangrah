import { useEffect, useRef, useState } from 'react';
import { select, scaleLinear, axisBottom, axisLeft, line, curveBasis } from 'd3';
import { Mic, Activity, Waves, Target } from 'lucide-react';

const Visualization = ({ pitchData, scale, exerciseMode }) => {
  const svgRef = useRef(null);
  const [visualizationMode, setVisualizationMode] = useState('waveform');
  const [history, setHistory] = useState([]);
  const MAX_HISTORY = 100;

  // Update history when new pitch data arrives
  useEffect(() => {
    if (pitchData) {
      setHistory(prev => {
        const newHistory = [...prev, pitchData];
        return newHistory.length > MAX_HISTORY ? newHistory.slice(-MAX_HISTORY) : newHistory;
      });
    }
  }, [pitchData]);

  // Draw visualization based on mode
  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawings

    const width = svgRef.current.clientWidth;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, MAX_HISTORY - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([-50, 50]) // Cents range (-50 to +50)
      .range([height - margin.bottom, margin.top]);

    // Create axes
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', '#4B5563'));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .call(g => g.select('.domain').attr('stroke', '#4B5563'));

    // Draw based on visualization mode
    switch (visualizationMode) {
      case 'waveform':
        drawWaveform(svg, width, height, margin, xScale, yScale);
        break;
      case 'pitchLadder':
        drawPitchLadder(svg, width, height, margin, xScale, yScale);
        break;
      case 'accuracy':
        drawAccuracy(svg, width, height, margin, xScale, yScale);
        break;
      default:
        drawWaveform(svg, width, height, margin, xScale, yScale);
    }

  }, [history, visualizationMode]);

  const drawWaveform = (svg, width, height, margin, xScale, yScale) => {
    // Center line (perfect pitch)
    svg.append('line')
      .attr('x1', margin.left)
      .attr('y1', yScale(0))
      .attr('x2', width - margin.right)
      .attr('y2', yScale(0))
      .attr('stroke', '#7C3AED')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Pitch line
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.cents))
      .curve(d3.curveBasis);

    svg.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 2)
      .attr('d', line);
  };

  const drawPitchLadder = (svg, width, height, margin, xScale, yScale) => {
    // Draw note lanes
    const notes = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
    const notePositions = [-35, -25, -15, 0, 15, 25, 35]; // Approximate cent positions

    notes.forEach((note, i) => {
      svg.append('line')
        .attr('x1', margin.left)
        .attr('y1', yScale(notePositions[i]))
        .attr('x2', width - margin.right)
        .attr('y2', yScale(notePositions[i]))
        .attr('stroke', '#374151')
        .attr('stroke-width', 0.5);

      svg.append('text')
        .attr('x', margin.left - 10)
        .attr('y', yScale(notePositions[i]) + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#9CA3AF')
        .text(note);
    });

    // Draw current pitch indicator
    if (history.length > 0) {
      const current = history[history.length - 1];
      svg.append('circle')
        .attr('cx', xScale(MAX_HISTORY - 10))
        .attr('cy', yScale(current.cents))
        .attr('r', 8)
        .attr('fill', '#EC4899')
        .attr('opacity', 0.8);

      svg.append('text')
        .attr('x', xScale(MAX_HISTORY - 10))
        .attr('y', yScale(current.cents) - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#EC4899')
        .text(`${current.swara} (${current.cents > 0 ? '+' : ''}${Math.round(current.cents)}c`);
    }
  };

  const drawAccuracy = (svg, width, height, margin, xScale, yScale) => {
    // Accuracy bars
    svg.selectAll('.accuracy-bar')
      .data(history)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(i))
      .attr('y', d => yScale(-50 + d.accuracy))
      .attr('width', width / MAX_HISTORY - 1)
      .attr('height', d => height - margin.bottom - yScale(-50 + d.accuracy))
      .attr('fill', d => {
        if (d.accuracy > 80) return '#10B981';
        if (d.accuracy > 50) return '#F59E0B';
        return '#EF4444';
      })
      .attr('opacity', 0.7);

    // Target line
    svg.append('line')
      .attr('x1', margin.left)
      .attr('y1', yScale(30)) // 80% accuracy line
      .attr('x2', width - margin.right)
      .attr('y2', yScale(30))
      .attr('stroke', '#7C3AED')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');
  };

  const getCurrentNoteColor = () => {
    if (!pitchData) return 'text-gray-400';
    const absCents = Math.abs(pitchData.cents);
    if (absCents < 10) return 'text-green-400';
    if (absCents < 25) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="visualization bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl flex items-center gap-2">
          <Activity className="text-purple-300" size={20} />
          Vocal Visualization
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setVisualizationMode('waveform')}
            className={`p-2 rounded-md ${visualizationMode === 'waveform' ? 'bg-purple-600' : 'bg-gray-700'}`}
            title="Waveform"
          >
            <Waves size={18} />
          </button>
          <button
            onClick={() => setVisualizationMode('pitchLadder')}
            className={`p-2 rounded-md ${visualizationMode === 'pitchLadder' ? 'bg-purple-600' : 'bg-gray-700'}`}
            title="Pitch Ladder"
          >
            <Mic size={18} />
          </button>
          <button
            onClick={() => setVisualizationMode('accuracy')}
            className={`p-2 rounded-md ${visualizationMode === 'accuracy' ? 'bg-purple-600' : 'bg-gray-700'}`}
            title="Accuracy"
          >
            <Target size={18} />
          </button>
        </div>
      </div>

      {/* Current Pitch Display */}
      {pitchData && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getCurrentNoteColor()}`}>
              {pitchData.swara}
              <span className="text-lg text-gray-400 ml-1">({pitchData.octave})</span>
            </div>
            <div className="text-gray-300">
              {pitchData.frequency.toFixed(1)} Hz
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg ${getCurrentNoteColor()}`}>
              {pitchData.cents > 0 ? '+' : ''}{Math.round(pitchData.cents)} cents
            </div>
            <div className="text-sm text-gray-400">
              {pitchData.accuracy}% accuracy
            </div>
          </div>
        </div>
      )}

      {/* D3 Visualization Canvas */}
      <div className="bg-gray-900 rounded-lg p-2">
        <svg
          ref={svgRef}
          width="100%"
          height="200"
          className="w-full"
        />
      </div>

      {/* Exercise-Specific Guidance */}
      {exerciseMode && (
        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-800">
          <div className="flex items-center gap-2 text-purple-300">
            <Target size={16} />
            <span className="font-medium">Exercise Target:</span>
            <span className="text-white">{exerciseMode.targetNote}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${pitchData?.accuracy || 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualization;