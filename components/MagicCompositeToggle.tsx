import React from 'react';
import { WandIcon } from './Icons';

interface MagicCompositeToggleProps {
    isEnabled: boolean;
    onToggle: (enabled: boolean) => void;
}

const MagicCompositeToggle: React.FC<MagicCompositeToggleProps> = ({ isEnabled, onToggle }) => {
    return (
        <div className="bg-black/20 border border-[var(--border-color)] rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <WandIcon className="w-6 h-6 text-cyan-400" />
                    <h3 className="font-semibold text-gray-100 text-lg">Magic Composite</h3>
                </div>
                <button
                    onClick={() => onToggle(!isEnabled)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                        isEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={isEnabled}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
            <p className="text-sm text-gray-300 mt-2">
                When enabled, the AI analyzes both images and automatically selects the best Design Kit presets for a perfect blend. Toggling off reverts to manual control.
            </p>
        </div>
    );
};

export default MagicCompositeToggle;