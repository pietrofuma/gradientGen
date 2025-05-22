
import React from 'react';
import { ColorStop } from '../types';

interface ColorStopControlProps {
  stop: ColorStop;
  onUpdate: (id: string, field: keyof Omit<ColorStop, 'id'>, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const ColorStopControl: React.FC<ColorStopControlProps> = ({ stop, onUpdate, onRemove, canRemove }) => {
  const handleInputChange = (field: keyof Omit<ColorStop, 'id'>, value: string | number) => {
    onUpdate(stop.id, field, value);
  };

  return (
    <div className="p-3 border border-gray-300 rounded-lg shadow-sm bg-white space-y-3 transition-all duration-150 ease-in-out hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <input
                type="color"
                value={stop.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-8 h-8 p-0 border-none rounded-md cursor-pointer shadow-sm"
                aria-label={`Color value for stop at ${stop.position}%`}
            />
            <input
                type="text"
                value={stop.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-24 p-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                aria-label={`Hex color value for stop at ${stop.position}%`}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            />
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(stop.id)}
            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-100 transition-colors"
            aria-label={`Remove color stop at ${stop.position}% with color ${stop.color}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 items-end">
        {/* Opacity Slider */}
        <div className="space-y-1">
          <label htmlFor={`opacity-${stop.id}`} className="block text-xs font-medium text-gray-500">
            Opacity: <span className="font-semibold text-indigo-600">{(stop.opacity * 100).toFixed(0)}%</span>
          </label>
          <input
            id={`opacity-${stop.id}`}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={stop.opacity}
            onChange={(e) => handleInputChange('opacity', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            aria-label={`Opacity for stop at ${stop.position}%`}
          />
        </div>

        {/* Position Slider */}
        <div className="space-y-1">
          <label htmlFor={`position-${stop.id}`} className="block text-xs font-medium text-gray-500">
            Position: <span className="font-semibold text-indigo-600">{stop.position}%</span>
          </label>
          <input
            id={`position-${stop.id}`}
            type="range"
            min="0"
            max="100"
            step="1"
            value={stop.position}
            onChange={(e) => handleInputChange('position', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            aria-label={`Position for stop with color ${stop.color}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorStopControl;
