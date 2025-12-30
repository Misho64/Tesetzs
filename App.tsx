
import React, { useState, useRef } from 'react';
import { 
  CameraAngle, 
  LightingType, 
  MockupEnvironment, 
  ManipulationEffect, 
  ProductRetouch, 
  PeopleRetouch, 
  AspectRatio,
  GeneratedAsset,
  GenerationSettings
} from './types';
import { generateProductScene } from './services/gemini';
import { 
  Camera, 
  Lightbulb, 
  Upload, 
  Sparkles, 
  Download, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Info,
  Layers,
  Wand2,
  Box,
  User,
  Settings2,
  Check,
  ExternalLink
} from 'lucide-react';

const ToOtLogo = () => (
  <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
    {/* Berry Shape (Mulberry) */}
    <path d="M20 36C28 36 34 30 34 21C34 12 28 4 20 4C12 4 6 12 6 21C6 30 12 36 20 36Z" fill="#E11D48" />
    {/* Texture details */}
    <circle cx="12" cy="15" r="3" fill="#F43F5E" />
    <circle cx="28" cy="15" r="3" fill="#F43F5E" />
    <circle cx="20" cy="10" r="3" fill="#F43F5E" />
    <circle cx="12" cy="27" r="3" fill="#F43F5E" />
    <circle cx="28" cy="27" r="3" fill="#F43F5E" />
    <circle cx="20" cy="31" r="3" fill="#F43F5E" />
    {/* Leaf on top */}
    <path d="M18 4C18 2 20 1 22 1M18 4C16 2 14 1 12 1" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
    {/* Eyes */}
    <circle cx="14" cy="20" r="3" fill="white" />
    <circle cx="14" cy="20.5" r="1.5" fill="black" />
    <circle cx="26" cy="20" r="3" fill="white" />
    <circle cx="26" cy="20.5" r="1.5" fill="black" />
    {/* Smiling Mouth */}
    <path d="M16 26.5C16 26.5 18 29.5 20 29.5C22 29.5 24 26.5 24 26.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const App: React.FC = () => {
  // Advanced State
  const [angle, setAngle] = useState<CameraAngle>(CameraAngle.Front);
  const [lighting, setLighting] = useState<LightingType>(LightingType.SoftStudio);
  const [mockup, setMockup] = useState<MockupEnvironment>(MockupEnvironment.None);
  const [manipulation, setManipulation] = useState<ManipulationEffect>(ManipulationEffect.None);
  const [productRetouch, setProductRetouch] = useState<ProductRetouch>(ProductRetouch.None);
  const [peopleRetouch, setPeopleRetouch] = useState<PeopleRetouch>(PeopleRetouch.None);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  const [transparent, setTransparent] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [history, setHistory] = useState<GeneratedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (id: string) => setOpenSection(openSection === id ? null : id);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
        setOpenSection('mockup');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) {
      setError("يرجى رفع صورة المنتج أولاً");
      setOpenSection('upload');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const settings: GenerationSettings = {
      angle,
      lighting,
      mockup,
      manipulation,
      productRetouch,
      peopleRetouch,
      aspectRatio,
      transparentBackground: transparent,
      prompt: customPrompt
    };

    try {
      const result = await generateProductScene(originalImage, settings);

      if (result) {
        setGeneratedImage(result);
        const newAsset: GeneratedAsset = {
          id: Date.now().toString(),
          url: result,
          timestamp: Date.now()
        };
        setHistory(prev => [newAsset, ...prev]);
      } else {
        setError("فشل في توليد الصورة، يرجى المحاولة مرة أخرى");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `to-ot-design-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col md:flex-row overflow-hidden pb-[28px]">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-[380px] border-l border-zinc-800 bg-[#121214] flex flex-col h-screen sticky top-0">
        {/* Logo Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ToOtLogo />
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">to-otAI</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Advanced Visuals</p>
            </div>
          </div>
        </div>

        {/* Scrollable Accordions */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {/* Section: Upload */}
          <Accordion 
            id="upload" 
            title="صورة المنتج" 
            icon={<ImageIcon size={18} />} 
            isOpen={openSection === 'upload'} 
            onToggle={() => toggleSection('upload')}
          >
            <div 
              className="mt-2 border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-rose-500 transition-colors cursor-pointer bg-zinc-800/20 group"
              onClick={() => fileInputRef.current?.click()}
            >
              {originalImage ? (
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-zinc-700">
                  <img src={originalImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold">تغيير الصورة</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-zinc-500 group-hover:text-rose-500" />
                  <p className="text-xs text-zinc-400">ارفع صورة المنتج هنا</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
          </Accordion>

          {/* Section: Mockup */}
          <Accordion 
            id="mockup" 
            title="قسم Mockup (البيئة)" 
            icon={<Layers size={18} />} 
            isOpen={openSection === 'mockup'} 
            onToggle={() => toggleSection('mockup')}
          >
            <div className="grid grid-cols-2 gap-2 pt-2">
              {Object.values(MockupEnvironment).map(m => (
                <OptionButton 
                  key={m} 
                  label={getArabicMockup(m)} 
                  isActive={mockup === m} 
                  onClick={() => setMockup(m)} 
                />
              ))}
            </div>
          </Accordion>

          {/* Section: Manipulation */}
          <Accordion 
            id="manipulation" 
            title="قسم Manipulation (تأثيرات)" 
            icon={<Wand2 size={18} />} 
            isOpen={openSection === 'manipulation'} 
            onToggle={() => toggleSection('manipulation')}
          >
            <div className="grid grid-cols-1 gap-2 pt-2">
              {Object.values(ManipulationEffect).map(m => (
                <OptionButton 
                  key={m} 
                  label={getArabicManipulation(m)} 
                  isActive={manipulation === m} 
                  onClick={() => setManipulation(m)} 
                />
              ))}
            </div>
          </Accordion>

          {/* Section: Product Retouch */}
          <Accordion 
            id="productRetouch" 
            title="Product Retouch (تحسين المنتج)" 
            icon={<Box size={18} />} 
            isOpen={openSection === 'productRetouch'} 
            onToggle={() => toggleSection('productRetouch')}
          >
            <div className="grid grid-cols-2 gap-2 pt-2">
              {Object.values(ProductRetouch).map(m => (
                <OptionButton 
                  key={m} 
                  label={getArabicProductRetouch(m)} 
                  isActive={productRetouch === m} 
                  onClick={() => setProductRetouch(m)} 
                />
              ))}
            </div>
          </Accordion>

          {/* Section: People Retouch */}
          <Accordion 
            id="peopleRetouch" 
            title="People Retouch (تحسين الأشخاص)" 
            icon={<User size={18} />} 
            isOpen={openSection === 'peopleRetouch'} 
            onToggle={() => toggleSection('peopleRetouch')}
          >
            <div className="grid grid-cols-1 gap-2 pt-2">
              {Object.values(PeopleRetouch).map(m => (
                <OptionButton 
                  key={m} 
                  label={getArabicPeopleRetouch(m)} 
                  isActive={peopleRetouch === m} 
                  onClick={() => setPeopleRetouch(m)} 
                />
              ))}
            </div>
          </Accordion>

          {/* Section: Camera & Light */}
          <Accordion 
            id="camera" 
            title="زوايا الكاميرا والإضاءة" 
            icon={<Camera size={18} />} 
            isOpen={openSection === 'camera'} 
            onToggle={() => toggleSection('camera')}
          >
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase font-bold">زاوية التصوير</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(CameraAngle).map(a => (
                    <OptionButton 
                      key={a} 
                      label={getArabicAngle(a)} 
                      isActive={angle === a} 
                      onClick={() => setAngle(a)} 
                      small
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase font-bold">نمط الإضاءة</p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(LightingType).map(l => (
                    <OptionButton 
                      key={l} 
                      label={getArabicLighting(l)} 
                      isActive={lighting === l} 
                      onClick={() => setLighting(l)} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </Accordion>

          {/* Section: Export Settings */}
          <Accordion 
            id="export" 
            title="إعدادات التصدير (Export)" 
            icon={<Settings2 size={18} />} 
            isOpen={openSection === 'export'} 
            onToggle={() => toggleSection('export')}
          >
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase font-bold">أبعاد الصورة</p>
                <div className="flex gap-2">
                  {Object.values(AspectRatio).map(r => (
                    <button 
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`flex-1 py-2 text-xs rounded border transition-all ${
                        aspectRatio === r ? 'bg-rose-600 border-rose-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg border border-zinc-700">
                <span className="text-xs">خلفية شفافة (PNG)</span>
                <button 
                  onClick={() => setTransparent(!transparent)}
                  className={`w-10 h-5 rounded-full transition-all relative ${transparent ? 'bg-rose-600' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${transparent ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </Accordion>

          {/* Custom Prompt */}
          <div className="p-4">
             <div className="flex items-center gap-2 mb-2 text-zinc-400">
                <Info size={14} />
                <span className="text-xs font-medium">وصف إضافي مخصص</span>
              </div>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="أدخل أي تفاصيل إضافية هنا..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs focus:outline-none focus:border-rose-600 transition-all resize-none h-20"
              />
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-zinc-800 bg-[#0c0c0e]">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !originalImage}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
              isGenerating || !originalImage
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            <span>{isGenerating ? 'جاري التحويل...' : 'توليد التصميم'}</span>
          </button>
          {error && <p className="text-rose-500 text-[10px] mt-2 text-center">{error}</p>}
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 p-6 md:p-12 flex flex-col gap-8 h-screen overflow-y-auto">
        <header className="flex justify-between items-end border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <ToOtLogo />
            <div>
              <h2 className="text-3xl font-black text-white">to-ot Studio</h2>
              <p className="text-zinc-500 text-sm mt-1">الذكاء الاصطناعي في خدمة تجارتك الإلكترونية</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setOriginalImage(null);
                setGeneratedImage(null);
                setHistory([]);
                setOpenSection('upload');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-xs transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              <span>إعادة تعيين</span>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
             <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold px-2">
                <span>الصورة الأصلية</span>
             </div>
             <div className="aspect-[4/5] bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden flex items-center justify-center relative">
                {originalImage ? (
                  <img src={originalImage} className="w-full h-full object-contain p-8" alt="Original" />
                ) : (
                  <div className="text-center opacity-20 flex flex-col items-center gap-3">
                    <ImageIcon size={64} />
                    <p className="text-sm">لم يتم رفع صورة</p>
                  </div>
                )}
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold px-2">
                <span>النتيجة المولدة</span>
                {generatedImage && (
                  <button 
                    onClick={() => downloadImage(generatedImage)}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Download size={14} />
                    <span>تحميل</span>
                  </button>
                )}
             </div>
             <div className="aspect-[4/5] bg-[#1a1a1c] rounded-3xl border-2 border-zinc-800 overflow-hidden flex items-center justify-center relative shadow-2xl">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-20 h-20 bg-rose-600/20 rounded-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-rose-600" size={40} />
                    </div>
                    <p className="text-zinc-400 font-medium">جاري معالجة بكسلات الصورة...</p>
                  </div>
                ) : generatedImage ? (
                  <img src={generatedImage} className="w-full h-full object-contain" alt="Result" />
                ) : (
                  <div className="text-center opacity-10 flex flex-col items-center gap-3">
                    <Sparkles size={80} />
                    <p className="text-lg">جاهز للبدء</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8 border-t border-zinc-800 pt-8 mb-10">
            <h3 className="text-sm font-bold text-zinc-400 mb-6 flex items-center gap-2">
              <Layers size={16} />
              سجل التجارب
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {history.map(asset => (
                <div 
                  key={asset.id} 
                  className="min-w-[120px] aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer hover:border-rose-600 transition-all group relative"
                  onClick={() => setGeneratedImage(asset.url)}
                >
                   <img src={asset.url} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Download size={18} className="text-white" onClick={(e) => { e.stopPropagation(); downloadImage(asset.url); }} />
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Rebranded Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-[28px] bg-[#0c0c0e] border-t border-zinc-800 z-[100] px-4 flex items-center justify-between text-[10px] text-zinc-500 font-medium select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
          <span>Engine: Gemini 2.5 Flash</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span>Made by:</span>
          <a 
            href="https://t.me/Gruop64" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-0.5 font-bold"
          >
            64Group
            <ExternalLink size={8} />
          </a>
        </div>

        <div className="tracking-tight">
          &copy; 2026 to-otAI
        </div>
      </footer>
    </div>
  );
};

// UI Reusable Components
const Accordion: React.FC<{
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className={`rounded-xl border transition-all overflow-hidden ${isOpen ? 'bg-zinc-800/20 border-zinc-700' : 'bg-transparent border-transparent hover:bg-zinc-800/40'}`}>
    <button 
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className={isOpen ? 'text-rose-500' : 'text-zinc-500'}>{icon}</span>
        <span className="text-xs font-bold">{title}</span>
      </div>
      <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-rose-500' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-4 pb-5">
        {children}
      </div>
    )}
  </div>
);

const OptionButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  small?: boolean;
}> = ({ label, isActive, onClick, small }) => (
  <button 
    onClick={onClick}
    className={`relative text-right px-3 py-2.5 rounded-lg border text-[11px] font-medium transition-all ${
      isActive 
      ? 'bg-rose-600/10 border-rose-500/50 text-rose-400' 
      : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
    } ${small ? 'py-1.5' : ''}`}
  >
    {label}
    {isActive && (
      <div className="absolute top-1 left-1">
        <Check size={10} className="text-rose-500" />
      </div>
    )}
  </button>
);

// Helpers
function getArabicMockup(m: MockupEnvironment): string {
  switch (m) {
    case MockupEnvironment.None: return 'بدون بيئة';
    case MockupEnvironment.Supermarket: return 'رف سوبر ماركت';
    case MockupEnvironment.Cafe: return 'طاولة مقهى';
    case MockupEnvironment.Billboard: return 'لوحة إعلانية';
    case MockupEnvironment.Nature: return 'مشهد طبيعي';
    case MockupEnvironment.Sunset: return 'غروب شمس';
    default: return m;
  }
}

function getArabicManipulation(m: ManipulationEffect): string {
  switch (m) {
    case ManipulationEffect.None: return 'عادي';
    case ManipulationEffect.SmartMasking: return 'عزل ذكي (Masking)';
    case ManipulationEffect.PerspectiveMatch: return 'محاكاة المنظور';
    case ManipulationEffect.FogParticles: return 'ضباب وجزيئات';
    case ManipulationEffect.LiquidSplash: return 'رذاذ سوائل (Splash)';
    default: return m;
  }
}

function getArabicProductRetouch(m: ProductRetouch): string {
  switch (m) {
    case ProductRetouch.None: return 'بدون';
    case ProductRetouch.CleanUp: return 'تنظيف السطح';
    case ProductRetouch.EdgeRefinement: return 'تنعيم الحواف';
    case ProductRetouch.Polish: return 'تلميع (معدن/بلاستيك)';
    case ProductRetouch.ColorMastering: return 'تصحيح لوني احترافي';
    default: return m;
  }
}

function getArabicPeopleRetouch(m: PeopleRetouch): string {
  switch (m) {
    case PeopleRetouch.None: return 'بدون';
    case PeopleRetouch.NaturalSkin: return 'بشرة طبيعية';
    case PeopleRetouch.EyeEnhancement: return 'تفتيح العيون';
    case PeopleRetouch.HairCleanup: return 'تهذيب الشعر';
    default: return m;
  }
}

function getArabicAngle(angle: CameraAngle): string {
  switch (angle) {
    case CameraAngle.Front: return 'أمامية';
    case CameraAngle.Side: return 'جانبية';
    case CameraAngle.TopDown: return 'من الأعلى';
    case CameraAngle.EyeLevel: return 'مستوى العين';
    case CameraAngle.LowAngle: return 'منخفضة (هيرو)';
    case CameraAngle.Diagonal: return 'زاوية 45';
    default: return angle;
  }
}

function getArabicLighting(light: LightingType): string {
  switch (light) {
    case LightingType.SoftStudio: return 'استوديو ناعم';
    case LightingType.Cinematic: return 'سينمائي غامض';
    case LightingType.Dramatic: return 'ظلال قوية';
    case LightingType.NaturalSunlight: return 'شمس طبيعية';
    case LightingType.Neon: return 'نيون وسايبربانك';
    case LightingType.Luxury: return 'فخامة الساعة الذهبية';
    default: return light;
  }
}

export default App;
