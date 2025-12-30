import React from 'react';
import { Preset } from '../types';

interface PresetSelectorProps<T extends Preset> {
    presets: readonly T[];
    selectedPresets: T[];
    onSelect: (preset: T) => void;
    suggestedIds?: string[];
}

const PresetSelector = <T extends Preset,>({ presets, selectedPresets, onSelect, suggestedIds = [] }: PresetSelectorProps<T>) => {
    return (
        <div>
            <div className="space-y-2">
                {presets.map((preset) => {
                    const isSelected = selectedPresets.some(p => p.id === preset.id);
                    const isSuggested = suggestedIds.includes(preset.id);
                    return (
                        <button
                            key={preset.id}
                            onClick={() => onSelect(preset)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 transform hover:scale-[1.03] active:scale-[0.99] ${
                                isSelected
                                    ? 'bg-cyan-500/20 border-cyan-500 shadow-md shadow-cyan-500/10'
                                    : 'bg-white/5 border-transparent hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-cyan-400/10'
                            }`}
                        >
                            <div className="flex-shrink-0 text-cyan-400">{preset.icon}</div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-100 flex items-center gap-2">
                                    {preset.name}
                                    {isSuggested && (
                                        <span className="text-xs font-bold text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-full border border-cyan-700">AI Pick</span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-300 leading-tight">{preset.description}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default PresetSelector;