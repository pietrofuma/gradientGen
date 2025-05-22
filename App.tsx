
import React, { useState, useEffect, useCallback } from 'react';
import { ColorStop, GradientType, RadialShape } from './types';
import ColorStopControl from './components/ColorStopControl';

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const generateColorStopCssString = (stops: ColorStop[]): string => {
  if (stops.length === 0) return 'transparent';
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const colorStopStrings = sortedStops.map(stop => {
    const rgb = hexToRgb(stop.color);
    if (!rgb) return `rgba(0,0,0,${stop.opacity}) ${stop.position}%`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${stop.opacity}) ${stop.position}%`;
  });
  return `linear-gradient(to right, ${colorStopStrings.join(', ')})`;
};


const App: React.FC = () => {
  const [gradientType, setGradientType] = useState<GradientType>(GradientType.LINEAR);
  const [angle, setAngle] = useState<number>(90);
  const [radialShape, setRadialShape] = useState<RadialShape>(RadialShape.CIRCLE);
  const [radialPositionX, setRadialPositionX] = useState<number>(50);
  const [radialPositionY, setRadialPositionY] = useState<number>(50);

  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: crypto.randomUUID(), color: '#6a11cb', opacity: 1, position: 0 }, // Deep Purple
    { id: crypto.randomUUID(), color: '#2575fc', opacity: 0.9, position: 50 }, // Bright Blue
    { id: crypto.randomUUID(), color: '#c471ed', opacity: 1, position: 100 }, // Light Purple/Pink
  ]);
  

  const [cssGradientString, setCssGradientString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateCssGradient = useCallback(() => {
    if (colorStops.length === 0) return 'transparent';

    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);

    const colorStopStrings = sortedStops.map(stop => {
      const rgb = hexToRgb(stop.color);
      if (!rgb) return `rgba(0,0,0,${stop.opacity}) ${stop.position}%`; // Fallback for invalid hex
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${stop.opacity}) ${stop.position}%`;
    });

    if (gradientType === GradientType.LINEAR) {
      return `linear-gradient(${angle}deg, ${colorStopStrings.join(', ')})`;
    } else { // RADIAL
      return `radial-gradient(${radialShape} at ${radialPositionX}% ${radialPositionY}%, ${colorStopStrings.join(', ')})`;
    }
  }, [colorStops, gradientType, angle, radialShape, radialPositionX, radialPositionY]);

  useEffect(() => {
    setCssGradientString(generateCssGradient());
  }, [generateCssGradient]);

  const addColorStop = () => {
    let newPosition = 50;
    const numStops = colorStops.length;
    if (numStops > 0) {
        const positions = colorStops.map(s => s.position).sort((a,b) => a - b);
        if (numStops === 1) {
            newPosition = positions[0] < 50 ? (positions[0] + 100) / 2 : positions[0] / 2;
        } else {
            // Find largest gap
            let maxGap = 0;
            let insertPos = 100;
            if (positions[0] > 0) {
                maxGap = positions[0];
                insertPos = positions[0] / 2;
            }
            for (let i = 0; i < numStops - 1; i++) {
                if (positions[i+1] - positions[i] > maxGap) {
                    maxGap = positions[i+1] - positions[i];
                    insertPos = positions[i] + maxGap / 2;
                }
            }
            if (100 - positions[numStops-1] > maxGap) {
                insertPos = positions[numStops-1] + (100 - positions[numStops-1]) / 2;
            }
            newPosition = insertPos;
        }
    }
     newPosition = Math.max(0, Math.min(100, Math.round(newPosition)));

    // Default new color to a contrasting color or based on existing scheme
    const lastColor = colorStops.length > 0 ? colorStops[colorStops.length -1].color : '#cccccc';
    // Simple logic: try to make it different from the last one (e.g. invert or shift hue)
    // This is a placeholder for more sophisticated color generation
    const newColor = lastColor === '#ffffff' ? '#000000' : '#ffffff';


    setColorStops(prevStops => [
      ...prevStops,
      { id: crypto.randomUUID(), color: newColor, opacity: 1, position: Math.round(newPosition) },
    ].sort((a,b) => a.position - b.position));
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length <= 1) return; 
    setColorStops(prevStops => prevStops.filter(stop => stop.id !== id));
  };

  const updateColorStop = (id: string, field: keyof Omit<ColorStop, 'id'>, value: string | number) => {
    setColorStops(prevStops =>
      prevStops.map(stop => {
        if (stop.id === id) {
          const newValue = (field === 'color') ? value : Number(value);
          return { ...stop, [field]: newValue };
        }
        return stop;
      }).sort((a,b) => a.position - b.position)
    );
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`background: ${cssGradientString};`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  
  const controlSectionClass = "p-4 border border-gray-300 rounded-lg shadow-sm bg-white";
  const commonInputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";
  const fieldsetClass = "border border-gray-300 p-4 rounded-lg space-y-3 shadow-sm bg-white";
  const legendClass = "text-sm font-semibold text-indigo-700 px-2";


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-gray-800 p-4 md:p-6 flex flex-col items-center">
      <header className="w-full max-w-6xl mb-6 md:mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-2">
          Interactive Gradient Generator
        </h1>
        <p className="text-gray-400 text-sm md:text-base">Craft and customize CSS gradients with live preview.</p>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-5 bg-slate-100 p-5 rounded-xl shadow-2xl space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          
          {/* Gradient Settings */}
          <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Gradient Type & Options</legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="gradientType" className={labelClass}>Type</label>
                <select
                  id="gradientType"
                  value={gradientType}
                  onChange={(e) => setGradientType(e.target.value as GradientType)}
                  className={commonInputClass}
                >
                  <option value={GradientType.LINEAR}>Linear</option>
                  <option value={GradientType.RADIAL}>Radial</option>
                </select>
              </div>

              {gradientType === GradientType.LINEAR && (
                <div className="space-y-2 p-3 bg-indigo-50 rounded-md border border-indigo-200">
                  <label htmlFor="angle" className={`${labelClass} text-indigo-700`}>
                    Angle: <span className="font-bold text-indigo-600">{angle}°</span>
                  </label>
                  <input
                    id="angle"
                    type="range"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    aria-label="Gradient Angle"
                  />
                </div>
              )}

              {gradientType === GradientType.RADIAL && (
                <div className="space-y-3 p-3 bg-teal-50 rounded-md border border-teal-200">
                  <div>
                    <label htmlFor="radialShape" className={`${labelClass} text-teal-700`}>Shape</label>
                    <select
                      id="radialShape"
                      value={radialShape}
                      onChange={(e) => setRadialShape(e.target.value as RadialShape)}
                      className={commonInputClass}
                      aria-label="Radial Gradient Shape"
                    >
                      <option value={RadialShape.CIRCLE}>Circle</option>
                      <option value={RadialShape.ELLIPSE}>Ellipse</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="radialPositionX" className={`${labelClass} text-teal-700`}>
                        Center X: <span className="font-bold text-teal-600">{radialPositionX}%</span>
                      </label>
                      <input
                        id="radialPositionX"
                        type="range" min="0" max="100" value={radialPositionX}
                        onChange={(e) => setRadialPositionX(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        aria-label="Radial Gradient Center X Position"
                      />
                    </div>
                    <div>
                      <label htmlFor="radialPositionY" className={`${labelClass} text-teal-700`}>
                        Center Y: <span className="font-bold text-teal-600">{radialPositionY}%</span>
                      </label>
                      <input
                        id="radialPositionY"
                        type="range" min="0" max="100" value={radialPositionY}
                        onChange={(e) => setRadialPositionY(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        aria-label="Radial Gradient Center Y Position"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </fieldset>
          
          {/* Color Stops */}
          <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Color Stops</legend>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Adjust colors, opacity, and position</h3>
              <button
                onClick={addColorStop}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-all text-xs"
                aria-label="Add new color stop"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Stop
              </button>
            </div>

            {/* Inline Gradient Preview for Stops */}
            {colorStops.length > 0 && (
              <div className="mb-3">
                <label className={`${labelClass} mb-1`}>Stops Preview:</label>
                <div 
                  className="w-full h-6 rounded border border-gray-300 shadow-inner"
                  style={{ background: generateColorStopCssString(colorStops) }}
                  aria-label="Color stops quick preview"
                ></div>
              </div>
            )}

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
              {colorStops.map((stop) => (
                <ColorStopControl
                  key={stop.id}
                  stop={stop}
                  onUpdate={updateColorStop}
                  onRemove={removeColorStop}
                  canRemove={colorStops.length > 1}
                />
              ))}
            </div>
          </fieldset>
        </div>

        {/* Preview and Output Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gradient Preview */}
          <div className="bg-slate-800/50 p-4 rounded-xl shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-3 text-gray-200">Live Preview</h2>
            <div
              className="w-full h-64 md:h-[22rem] rounded-lg shadow-2xl border-2 border-slate-700"
              style={{ background: cssGradientString }}
              aria-label="Main gradient preview"
              role="img"
            ></div>
          </div>

          {/* CSS Output */}
          <div className="bg-slate-800/50 p-4 rounded-xl shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-3 text-gray-200">Generated CSS</h2>
            <div className="relative">
              <textarea
                readOnly
                value={`background: ${cssGradientString};`}
                className="w-full h-28 p-3 border border-slate-600 bg-slate-900 text-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-inner"
                aria-label="Generated CSS code"
              />
              <button
                onClick={handleCopyToClipboard}
                className={`absolute top-2.5 right-2.5 flex items-center text-white font-semibold py-1.5 px-3 rounded-md text-xs shadow-md hover:shadow-lg transition-all ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                aria-live="polite"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm0 2h6v12H7V4z" />
                  <path d="M9.508 5.5H10.5v6H9.508a2.526 2.526 0 01-.508-.5A2.526 2.526 0 019.508 5.5zM7 5h1.586A1.5 1.5 0 0110 6.5V10a1.5 1.5 0 01-1.414 1.5H7V5zm5 0h1.5v5.5A1.5 1.5 0 0112.086 12H12V5z"/> {/* Simple clipboard icon */}
                </svg>
                {copied ? 'Copied!' : 'Copy CSS'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="mt-10 md:mt-12 text-center text-gray-500 text-xs">
        <p>&copy; ${new Date().getFullYear()} Gradient Generator. Enhanced for intuitive design.</p>
      </footer>
    </div>
  );
};

export default App;
