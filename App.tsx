
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    AppMode, 
    CreativeMode, 
    ImageFile, 
    CameraPreset, 
    LightingPreset, 
    MockupPreset, 
    ManipulationPreset, 
    PeopleRetouchPreset, 
    RetouchPreset, 
    ExportSettings,
    AspectRatio,
    UpscaleTarget,
    PromptSuggestion
} from './types';
import { 
    CAMERA_PRESETS, 
    LIGHTING_PRESETS, 
    MOCKUP_PRESETS, 
    MANIPULATION_PRESETS, 
    PEOPLE_RETOUCH_PRESETS, 
    RETOUCH_PRESETS 
} from './constants';
import { 
    generateImage, 
    analyzeForCompositeSuggestions, 
    generateDesignKitPrompt 
} from './services/geminiService';

import ImageUploader from './components/ImageUploader';
import ImageViewer from './components/ImageViewer';
import ControlPanel from './components/ControlPanel';
import MagicCompositeToggle from './components/MagicCompositeToggle';
import { TomatoMascotIcon, SparklesIcon, PhotoIcon, PaintBrushIcon, RefreshIcon } from './components/Icons';

const App: React.FC = () => {
    // App State
    const [mode, setMode] = useState<AppMode>('design-kit');
    const [productImage, setProductImage] = useState<ImageFile | null>(null);
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
    const [useMagicComposite, setUseMagicComposite] = useState(true);
    
    // Selection State
    const [selectedCameras, setSelectedCameras] = useState<CameraPreset[]>([CAMERA_PRESETS[0]]);
    const [selectedLightings, setSelectedLightings] = useState<LightingPreset[]>([LIGHTING_PRESETS[0]]);
    const [selectedMockups, setSelectedMockups] = useState<MockupPreset[]>([MOCKUP_PRESETS[0]]);
    const [selectedManipulations, setSelectedManipulations] = useState<ManipulationPreset[]>([MANIPULATION_PRESETS[0]]);
    const [selectedPeopleRetouches, setSelectedPeopleRetouches] = useState<PeopleRetouchPreset[]>([PEOPLE_RETOUCH_PRESETS[0]]);
    const [selectedRetouches, setSelectedRetouches] = useState<RetouchPreset[]>([RETOUCH_PRESETS[0]]);
    
    const [customPrompt, setCustomPrompt] = useState('');
    const [exportSettings, setExportSettings] = useState<ExportSettings>({
        aspectRatio: '1:1',
        transparent: false,
    });

    // AI & UI State
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUpscaling, setIsUpscaling] = useState<false | UpscaleTarget>(false);
    const [suggestedPresetIds, setSuggestedPresetIds] = useState<Record<string, string[]>>({});
    const [generatedImage, setGeneratedImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [promptSuggestions, setPromptSuggestions] = useState<PromptSuggestion[]>([]);
    
    const [isUpscaleMenuOpen, setIsUpscaleMenuOpen] = useState(false);
    const upscaleMenuRef = useRef<HTMLDivElement>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, []);

    // Handle outside clicks for upscale menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (upscaleMenuRef.current && !upscaleMenuRef.current.contains(event.target as Node)) {
                setIsUpscaleMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Magic Composite Analysis
    useEffect(() => {
        const analyze = async () => {
            if (useMagicComposite && productImage && referenceImage) {
                setIsAnalyzing(true);
                try {
                    const result = await analyzeForCompositeSuggestions(productImage, referenceImage);
                    setSuggestedPresetIds(result);
                    
                    // Auto-select top suggestions if found
                    if (result.camera?.[0]) {
                        const p = CAMERA_PRESETS.find(x => x.id === result.camera[0]);
                        if (p) setSelectedCameras([p]);
                    }
                    if (result.lighting?.[0]) {
                        const p = LIGHTING_PRESETS.find(x => x.id === result.lighting[0]);
                        if (p) setSelectedLightings([p]);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsAnalyzing(false);
                }
            } else {
                setSuggestedPresetIds({});
            }
        };
        analyze();
    }, [useMagicComposite, productImage, referenceImage]);

    const handleGenerate = async () => {
        if (!productImage) return;
        setIsGenerating(true);
        setGeneratedImage(null);
        try {
            const params = {
                cameraPresets: selectedCameras,
                lightingPresets: selectedLightings,
                mockupPreset: selectedMockups[0] || MOCKUP_PRESETS[0],
                manipulationPresets: selectedManipulations,
                peopleRetouchPresets: selectedPeopleRetouches,
                retouchPresets: selectedRetouches,
                exportSettings,
                customPrompt,
            };
            const result = await generateImage(productImage, referenceImage, useMagicComposite, params);
            setGeneratedImage(result);
        } catch (error: any) {
            alert(error.message || "Failed to generate image.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpscale = async (target: UpscaleTarget) => {
        // In a real app we'd call the upscale function from geminiService
        // For this demo, we'll simulate it
        setIsUpscaling(target);
        setIsUpscaleMenuOpen(false);
        setTimeout(() => {
            setIsUpscaling(false);
            alert("Upscaling complete! (Simulation)");
        }, 2000);
    };

    const toggleSelection = useCallback(<T extends { id: string }>(
        preset: T,
        current: T[],
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        multi: boolean = false
    ) => {
        if (preset.id === 'none') {
            setter([preset]);
            return;
        }
        if (!multi) {
            setter([preset]);
        } else {
            const filtered = current.filter(p => p.id !== 'none');
            const exists = filtered.find(p => p.id === preset.id);
            if (exists) {
                const next = filtered.filter(p => p.id !== preset.id);
                setter(next.length === 0 ? [current.find(x => x.id === 'none') as any] : next);
            } else {
                setter([...filtered, preset]);
            }
        }
    }, []);

    const fetchPromptSuggestions = async () => {
        if (!productImage) return;
        setIsAnalyzing(true);
        try {
            const suggestions = await generateDesignKitPrompt(productImage, referenceImage);
            setPromptSuggestions(suggestions);
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden text-slate-100">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-black/40 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                    <TomatoMascotIcon className="w-10 h-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <div>
                        <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">TOMATO AI DESIGN KIT</h1>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Pro Studio v2.5</p>
                    </div>
                </div>
                
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                    <button 
                        onClick={() => setMode('design-kit')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'design-kit' ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        DESIGN KIT
                    </button>
                    <button 
                        onClick={() => setMode('creative-studio')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'creative-studio' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        CREATIVE STUDIO
                    </button>
                </div>

                {!isOnline && (
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        OFFLINE
                    </div>
                )}
            </header>

            <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Left Sidebar - Inputs */}
                <aside className="w-full lg:w-80 border-r border-[var(--border-color)] flex flex-col bg-black/20 overflow-y-auto">
                    <div className="p-4 space-y-6">
                        <section className="space-y-4">
                            <ImageUploader 
                                title="1. Product Asset" 
                                description="Upload your product, logo, or raw plate." 
                                onImageChange={setProductImage} 
                            />
                            
                            <ImageUploader 
                                title="2. Reference Style" 
                                description="Upload a moodboard or lighting reference." 
                                onImageChange={setReferenceImage} 
                            />
                        </section>

                        <MagicCompositeToggle isEnabled={useMagicComposite} onToggle={setUseMagicComposite} />

                        <section className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4" />
                                Custom Direction
                            </label>
                            <textarea 
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="Describe specific details (e.g., 'On a marble table with soft morning fog')"
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none min-h-[100px] resize-none"
                            />
                            {productImage && (
                                <button 
                                    onClick={fetchPromptSuggestions}
                                    className="w-full py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshIcon className="w-3 h-3" /> Get AI Suggestions
                                </button>
                            )}
                        </section>

                        {promptSuggestions.length > 0 && (
                            <section className="space-y-2 animate-fade-in">
                                {promptSuggestions.map((s, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCustomPrompt(s.prompt)}
                                        className="w-full text-left p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all group"
                                    >
                                        <p className="text-[10px] font-bold text-cyan-500 group-hover:text-cyan-400">{s.title}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{s.prompt}</p>
                                    </button>
                                ))}
                            </section>
                        )}
                    </div>
                </aside>

                {/* Center - Viewport */}
                <section className="flex-grow relative flex flex-col min-w-0 bg-[#0d061c]">
                    <ImageViewer 
                        productImage={productImage}
                        generatedImage={generatedImage}
                        isGenerating={isGenerating}
                    />
                </section>

                {/* Right Sidebar - Presets & Controls */}
                <aside className="w-full lg:w-96 border-l border-[var(--border-color)] flex flex-col bg-black/20">
                    <ControlPanel 
                        selectedCameras={selectedCameras}
                        onCameraSelect={(p) => toggleSelection(p, selectedCameras, setSelectedCameras)}
                        selectedLightings={selectedLightings}
                        onLightingSelect={(p) => toggleSelection(p, selectedLightings, setSelectedLightings)}
                        selectedMockups={selectedMockups}
                        onMockupSelect={(p) => toggleSelection(p, selectedMockups, setSelectedMockups)}
                        selectedManipulations={selectedManipulations}
                        onManipulationSelect={(p) => toggleSelection(p, selectedManipulations, setSelectedManipulations, true)}
                        selectedPeopleRetouches={selectedPeopleRetouches}
                        onPeopleRetouchSelect={(p) => toggleSelection(p, selectedPeopleRetouches, setSelectedPeopleRetouches, true)}
                        selectedRetouches={selectedRetouches}
                        onRetouchSelect={(p) => toggleSelection(p, selectedRetouches, setSelectedRetouches, true)}
                        exportSettings={exportSettings}
                        setExportSettings={setExportSettings}
                        referenceImage={referenceImage}
                        isAnalyzing={isAnalyzing}
                        suggestedPresetIds={suggestedPresetIds}
                        onGenerate={handleGenerate}
                        canGenerate={!!productImage && isOnline && !isGenerating}
                        isLoading={isGenerating}
                        generatedImage={generatedImage}
                        isUpscaling={isUpscaling}
                        onUpscale={handleUpscale}
                        isOnline={isOnline}
                        upscaleMenuRef={upscaleMenuRef}
                        isUpscaleMenuOpen={isUpscaleMenuOpen}
                        setIsUpscaleMenuOpen={setIsUpscaleMenuOpen}
                    />
                </aside>
            </main>

            {/* Footer / Status Bar */}
            <footer className="h-8 flex items-center justify-between px-4 bg-black/60 border-t border-white/5 text-[10px] font-medium text-gray-500">
                <div className="flex gap-4">
                    <span>Engine: Gemini 2.5 Flash</span>
                    <span>Modality: Multi-Part Image Synthesis</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {isOnline ? 'System Ready' : 'Connection Lost'}
                    </span>
                    <span>© 2025 TOMATO DESIGN KIT</span>
                </div>
            </footer>
        </div>
    );
};

export default App;
