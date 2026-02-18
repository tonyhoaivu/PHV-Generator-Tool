
import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertCircle,
  RefreshCw,
  Zap,
  Sparkles,
  Terminal,
  FileText,
  MonitorPlay,
  Upload,
  Download,
  Trash2,
  FileJson,
  Cpu,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  X,
  FileVideo,
  Image as ImageIcon,
  Copy,
  ChevronRight,
  ChevronDown,
  Info,
  Phone,
  Mail,
  Camera,
  Layers,
  Wind,
  Plus
} from 'lucide-react';
import { analyzeVideoContent } from './services/geminiService';
import { ScriptAnalysisResult, ProcessingStep, GrokScene } from './types';
import StepIndicator from './components/StepIndicator';

const WATERMARK = "\n\nBản quyền © TonyHoaivu.Com | Email: tonyhoaivu@gmail.com | Phone: 0927099940";

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState<{ data: string, mimeType: string, name: string, size: number }[]>([]);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [result, setResult] = useState<ScriptAnalysisResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyDetected, setIsApiKeyDetected] = useState<boolean>(false);
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = process.env.API_KEY;
    setIsApiKeyDetected(!!key && key !== 'undefined' && key.length > 10);
  }, []);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach((f: File) => {
        if (f.size > 30 * 1024 * 1024) {
          alert(`File ${f.name} quá lớn (tối đa 30MB).`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const base64 = (reader.result as string).split(',')[1];
            setFiles(prev => [...prev, { 
              data: base64, 
              mimeType: f.type, 
              name: f.name,
              size: f.size
            }]);
            setInputText("");
          }
        };
        reader.readAsDataURL(f);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (!inputText && files.length === 0) return;
    setError(null);
    setResult(null);
    try {
      setStep('fetching');
      await new Promise(r => setTimeout(r, 400));
      setStep('transcribing');
      await new Promise(r => setTimeout(r, 400));
      setStep('analyzing');
      
      const inputData = files.length > 0 
        ? (files.length === 1 ? files[0] : files)
        : inputText;
      
      const analysis = await analyzeVideoContent(inputData as any, { doAnalysis: true, type: 'video' });
      setResult(analysis);
      setStep('completed');
    } catch (err: any) {
      setError(err.message || "Unable to analyze source content.");
      setStep('error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportData = (format: 'txt' | 'json') => {
    if (!result) return;
    let content = "";
    let fileName = `tonyhoaivu-storyboard-${Date.now()}.${format}`;
    let type = "text/plain";

    if (format === 'json') {
      content = JSON.stringify({ ...result, copyright: "TonyHoaivu.Com", watermark: WATERMARK.trim() }, null, 2);
      type = "application/json";
    } else {
      content = `VIDEO & IMAGE ANALYSIS STORYBOARD PRO\n`;
      content += `=====================================\n`;
      content += `Summary: ${result.summary}\n`;
      content += `Hook: ${result.hook_data.thumbnail_text}\n\n`;
      content += `SCENES (6s SPLITS):\n`;
      result.scenes.forEach(s => {
        content += `[Scene ${s.id}] (${s.timestamp})\n`;
        content += `- Action: ${s.action}\n`;
        content += `- Visual: ${s.visual}\n`;
        content += `- Grok Prompt: ${s.grok_video_prompt}\n\n`;
      });
      content += WATERMARK;
    }

    const a = document.createElement("a");
    const blob = new Blob([content], { type });
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
  };

  const renderContent = () => {
    if (step === 'idle') {
      return (
        <div className="mt-12 text-center px-4 animate-in fade-in duration-700 max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center justify-center p-5 rounded-3xl bg-blue-600/10 border border-blue-500/20 shadow-2xl">
            <Zap size={48} className="text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">
            VIDEO & IMAGE <span className="text-blue-500">→</span> PROMPT GENERATOR <span className="text-blue-600">PRO</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium italic opacity-80 mb-10 tracking-widest uppercase">
            Deep Scene Analysis • Grok-3 Optimized • AI Storyboarding
          </p>
          
          <div className="glass p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Cpu size={32} className="text-blue-500" />
            </div>

            <div className="space-y-8">
              {files.length === 0 ? (
                <div className="relative group">
                  <textarea 
                    className="w-full bg-black/50 border border-white/10 rounded-[2rem] p-8 text-white text-base focus:ring-4 focus:ring-blue-500/20 transition-all min-h-[200px] placeholder:italic placeholder:text-gray-600 shadow-inner resize-none font-medium"
                    placeholder="Dán link Video (YouTube, TikTok, FB, MP4...) hoặc kịch bản chữ để phân tích thực tế..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest italic pointer-events-none opacity-50">
                    <ExternalLink size={12} /> Real content extraction mode
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-black/40 rounded-[2rem] border border-dashed border-white/10">
                  {files.map((f, i) => (
                    <div key={i} className="relative group aspect-square bg-[#0f172a] rounded-2xl flex flex-col items-center justify-center p-4 border border-white/5 hover:border-blue-500/30 transition-all overflow-hidden shadow-2xl">
                      {f.mimeType.includes('video') ? <FileVideo size={40} className="text-blue-400" /> : <ImageIcon size={40} className="text-purple-400" />}
                      <span className="text-[10px] font-bold text-gray-400 mt-3 truncate w-full text-center px-2 italic">{f.name}</span>
                      <button onClick={() => removeFile(i)} className="absolute top-2 right-2 p-1.5 bg-red-600/90 rounded-full hover:bg-red-500 transition-colors shadow-lg">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-blue-600/5 border border-dashed border-blue-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-blue-600/10 transition-all group"
                  >
                    <Plus size={32} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Thêm File</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-5">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex-1 px-10 py-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[12px] tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                >
                  <Upload size={20} /> Upload Image/Video
                </button>
                <button 
                  onClick={handleProcess} 
                  disabled={(!inputText && files.length === 0) || !isApiKeyDetected} 
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:opacity-50 text-white font-black px-12 py-6 rounded-2xl text-[12px] uppercase tracking-[0.2em] transition-all shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 active:scale-95"
                >
                  <Sparkles size={20} className="animate-pulse" /> RUN ANALYSIS ENGINE
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center items-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2"><ImageIcon size={16}/> JPG/PNG</div>
             <div className="flex items-center gap-2"><FileVideo size={16}/> MP4/MOV</div>
             <div className="flex items-center gap-2"><MonitorPlay size={16}/> YT/TikTok</div>
          </div>
        </div>
      );
    }

    if (step !== 'completed' && step !== 'error') {
      return (
        <div className="max-w-xl mx-auto mt-24 px-4">
          <div className="text-center mb-16">
            <div className="relative inline-block mb-10">
               <RefreshCw size={72} className="text-blue-500 animate-spin-slow opacity-20" />
               <Zap size={32} className="text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-[0.4em] italic mb-4">Processing Engine</h3>
            <p className="text-sm text-gray-500 italic max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">Extracting real visual data & generating detailed storyboards...</p>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      );
    }

    if (step === 'error') {
      return (
        <div className="max-w-xl mx-auto mt-24 text-center px-12 py-16 glass rounded-[3rem] border border-red-500/20 shadow-2xl animate-in zoom-in">
          <AlertCircle size={72} className="text-red-500 mx-auto mb-8 shadow-red-500/20 shadow-2xl" />
          <h2 className="text-white font-black uppercase text-xl mb-6 tracking-widest italic">Source Access Denied</h2>
          <p className="text-red-400 text-base italic font-medium mb-12 leading-relaxed bg-red-500/5 p-8 rounded-3xl border border-red-500/10 shadow-inner">
            "{error}"
          </p>
          <button onClick={() => setStep('idle')} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-2xl active:scale-95">
            Back to Dashboard
          </button>
        </div>
      );
    }

    if (result) {
      return (
        <div className="w-full mt-8 px-6 pb-40 space-y-16 max-w-[1500px] mx-auto animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-b border-white/5 pb-10">
            <div className="space-y-3 text-center md:text-left">
               <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                <MonitorPlay className="text-blue-500" size={36}/> SCENE ANALYSIS <span className="text-blue-500">PRO</span>
               </h2>
               <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                 <span className="bg-blue-600/10 text-blue-400 text-[11px] font-black px-5 py-2 rounded-full border border-blue-500/20 uppercase italic tracking-widest">
                    {result.language}
                 </span>
                 <span className="bg-green-600/10 text-green-400 text-[11px] font-black px-5 py-2 rounded-full border border-green-500/20 uppercase italic tracking-widest">
                    {result.scenes.length} Blocks (6s Splits)
                 </span>
               </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => exportData('txt')} className="glass px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 transition-all shadow-xl">
                <FileText size={18} /> TXT Storyboard
              </button>
              <button onClick={() => exportData('json')} className="glass px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 transition-all shadow-xl">
                <FileJson size={18} /> JSON Data
              </button>
              <button onClick={() => setStep('idle')} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-500 transition-all shadow-[0_10px_40px_rgba(37,99,235,0.4)]">
                <RefreshCw size={18} /> New Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-8 space-y-12">
                <div className="glass p-12 rounded-[3.5rem] space-y-10 relative overflow-hidden group/box shadow-2xl">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover/box:scale-110 transition-transform duration-1000">
                    <Layers size={120} className="text-blue-500" />
                  </div>
                  <h4 className="text-blue-500 font-black text-[13px] uppercase tracking-[0.5em] flex items-center gap-5 italic">
                    <Info size={22}/> Content Metadata Summary
                  </h4>
                  <div className="space-y-8 relative">
                    <div className="p-8 bg-blue-600/5 rounded-3xl border border-blue-500/10 shadow-inner">
                      <p className="text-gray-200 text-lg leading-relaxed italic font-medium">
                        "{result.summary}"
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <span className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600" /> Detected Characters
                          </span>
                          <div className="flex flex-wrap gap-3">
                            {result.detected_characters.map((c, i) => (
                              <span key={i} className="bg-white/5 px-4 py-1.5 rounded-xl text-[12px] font-bold text-gray-300 italic border border-white/5">#{c}</span>
                            ))}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <span className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600" /> Detected Locations
                          </span>
                          <div className="flex flex-wrap gap-3">
                            {result.detected_locations.map((l, i) => (
                              <span key={i} className="bg-white/5 px-4 py-1.5 rounded-xl text-[12px] font-bold text-gray-300 italic border border-white/5">@{l}</span>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="glass p-12 rounded-[3.5rem] space-y-10 shadow-2xl">
                  <h4 className="text-orange-500 font-black text-[13px] uppercase tracking-[0.5em] flex items-center gap-5 italic">
                    <Sparkles size={22}/> Title Generation (10 Suggestions)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {result.titles.map((t, i) => (
                      <div key={i} className="group p-6 rounded-[2rem] bg-[#0f172a] border border-white/5 hover:border-orange-500/40 transition-all space-y-4 relative shadow-lg">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black bg-orange-500/10 text-orange-400 px-3 py-1 rounded-lg uppercase tracking-widest italic">
                            {t.category}
                          </span>
                          <button onClick={() => copyToClipboard(t.vietnamese, `title-vn-${i}`)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 p-2 rounded-full hover:bg-white/10">
                            <Copy size={14} className="text-gray-400" />
                          </button>
                        </div>
                        <p className="font-bold text-white text-base italic leading-snug">"{t.vietnamese}"</p>
                        <p className="text-[11px] text-gray-600 font-mono line-clamp-2 italic leading-relaxed">Prompt: {t.english_prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="lg:col-span-4 space-y-12">
               <div className="glass p-12 rounded-[3.5rem] space-y-10 border-l-[12px] border-l-red-600 shadow-red-600/10 shadow-2xl sticky top-32">
                  <h4 className="text-red-500 font-black text-[13px] uppercase tracking-[0.5em] flex items-center gap-5 italic">
                    <Wind size={22}/> Viral Hook & Thumbnail
                  </h4>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest italic">Hook Thumbnail Text (VN)</span>
                      <p className="text-2xl font-black text-white italic leading-[1.1] tracking-tighter">"{result.hook_data.thumbnail_text}"</p>
                    </div>
                    <div className="space-y-4 pt-8 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-red-400 font-black uppercase tracking-widest flex items-center gap-2">
                           <Camera size={14}/> Image Prompt (EN)
                        </span>
                        <button onClick={() => copyToClipboard(result.hook_data.image_prompt, 'hook-prompt')} className="p-3 bg-red-600/10 rounded-2xl hover:bg-red-600/20 transition-all border border-red-500/20">
                          <Copy size={16} className="text-red-400" />
                        </button>
                      </div>
                      <p className="text-[12px] text-gray-400 leading-relaxed font-mono italic p-6 bg-black/60 rounded-2xl border border-white/5 shadow-inner">
                        {result.hook_data.image_prompt}
                      </p>
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-4 text-[12px] text-gray-400 italic bg-white/5 p-4 rounded-xl">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                        <span className="font-bold">Highlight:</span> {result.hook_data.emotional_highlight}
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-gray-400 italic bg-white/5 p-4 rounded-xl">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse shadow-[0_0_10px_orange]" />
                        <span className="font-bold">Lighting:</span> {result.hook_data.dramatic_lighting}
                      </div>
                    </div>
                  </div>
               </div>
             </div>
          </div>

          <div className="space-y-16">
             <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black uppercase italic flex items-center gap-8 text-white tracking-[0.2em]">
                  <MonitorPlay className="text-blue-500" size={48}/> Storyboard 6s
                </h3>
                <div className="h-px bg-white/10 flex-1 ml-10 hidden md:block" />
             </div>

             <div className="space-y-12">
                {result.scenes.map((scene) => (
                  <div key={scene.id} className="bg-[#0f172a]/90 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl overflow-hidden group/scene transition-all hover:border-blue-500/30">
                    <div className="p-10 md:p-16 flex flex-col lg:flex-row gap-16 relative">
                      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.6)]" />
                      
                      {/* Technical Specs */}
                      <div className="lg:w-1/4 space-y-8 border-r border-white/5 pr-12">
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-blue-600/40 italic">
                            {scene.id}
                          </div>
                          <div className="space-y-1">
                            <span className="block text-3xl font-black text-blue-400 tracking-tighter italic">{scene.timestamp}</span>
                            <span className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.5em] italic">Standard Block</span>
                          </div>
                        </div>

                        <div className="space-y-6 pt-10">
                           {[
                             { label: 'Camera Angle', val: scene.camera, icon: Camera },
                             { label: 'Lighting Style', val: scene.lighting, icon: Sparkles },
                             { label: 'Environment', val: scene.environment, icon: Layers },
                             { label: 'Mood/Tone', val: scene.mood, icon: Wind },
                             { label: 'Core Emotion', val: scene.emotion, icon: Zap }
                           ].map((item, idx) => (
                             <div key={idx} className="flex items-center gap-5 group/item bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                               <div className="p-3 bg-blue-600/10 rounded-xl">
                                 <item.icon size={18} className="text-blue-400 group-hover/item:scale-110 transition-transform" />
                               </div>
                               <div className="space-y-0.5">
                                 <span className="block text-[9px] text-gray-500 uppercase font-black tracking-widest italic">{item.label}</span>
                                 <span className="block text-[12px] text-gray-200 font-bold italic truncate max-w-[150px]">{item.val}</span>
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Analysis & Content */}
                      <div className="lg:w-3/4 space-y-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-5">
                               <span className="text-[12px] text-gray-400 font-black uppercase tracking-[0.4em] flex items-center gap-4 italic">
                                 <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_8px_blue]" /> Visual & Action (VN)
                               </span>
                               <div className="bg-black/50 p-8 rounded-[2rem] border border-white/5 shadow-inner min-h-[140px] flex items-center">
                                 <p className="text-base text-gray-200 font-semibold italic leading-relaxed">
                                   {scene.visual} — {scene.action}
                                 </p>
                               </div>
                            </div>
                            <div className="space-y-5">
                               <span className="text-[12px] text-gray-400 font-black uppercase tracking-[0.4em] flex items-center gap-4 italic">
                                 <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_8px_blue]" /> Dialogue & Script (VN)
                               </span>
                               <div className="space-y-5 bg-[#020617] p-8 rounded-[2rem] border border-white/5 min-h-[140px]">
                                  <p className="text-base text-blue-400 font-black italic">"{scene.dialogue}"</p>
                                  <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5 opacity-50">
                                    <div className="text-[11px] text-gray-400 italic flex items-center gap-2 font-bold"><Layers size={14}/> FX: {scene.sound_effects}</div>
                                    <div className="text-[11px] text-gray-400 italic flex items-center gap-2 font-bold"><Wind size={14}/> AMB: {scene.ambient_audio}</div>
                                  </div>
                                </div>
                            </div>
                         </div>

                         {/* AI Prompts Section */}
                         <div className="space-y-8">
                            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                              <h5 className="text-[14px] font-black uppercase tracking-[0.5em] text-blue-500 italic">Grok-3 / Sora AI Generation Suite (EN)</h5>
                              <button 
                                onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                                className="px-6 py-2.5 rounded-full bg-blue-600/10 text-[11px] font-black uppercase text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 flex items-center gap-3 transition-all"
                              >
                                {expandedScene === scene.id ? <><ChevronDown size={16} /> Less Detail</> : <><ChevronRight size={16} /> Show All Prompts</>}
                              </button>
                            </div>

                            <div className="space-y-6">
                               <div className="group/prompt relative">
                                 <div className="flex justify-between items-center mb-4 px-4">
                                   <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest italic">Core Cinematic Video Prompt</span>
                                   <button onClick={() => copyToClipboard(scene.grok_video_prompt, `vid-p-${scene.id}`)} className="text-[12px] font-black text-blue-500 hover:underline flex items-center gap-2">
                                     <Copy size={14}/> Copy Prompt
                                   </button>
                                 </div>
                                 <div className="bg-black p-10 rounded-[2.5rem] border border-blue-500/10 text-[14px] font-mono text-blue-200/70 italic leading-[1.8] group-hover/prompt:border-blue-500/30 transition-all border-l-8 border-l-blue-600 shadow-3xl">
                                   {scene.grok_video_prompt}
                                 </div>
                               </div>

                               {expandedScene === scene.id && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top duration-500">
                                    {[
                                      { label: 'Character Profile', val: scene.character_description, icon: Cpu },
                                      { label: 'Motion Dynamics', val: scene.motion_prompt, icon: RefreshCw },
                                      { label: 'Advanced Camera', val: scene.camera_movement_prompt, icon: Camera },
                                      { label: 'Env/Art Context', val: scene.environment_prompt, icon: Layers }
                                    ].map((p, pi) => (
                                      <div key={pi} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all shadow-xl">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-3 tracking-widest italic">
                                            <p.icon size={16} className="text-blue-400"/> {p.label}
                                          </span>
                                          <button onClick={() => copyToClipboard(p.val, `p-${pi}-${scene.id}`)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                                            <Copy size={14} className="text-gray-500 hover:text-white" />
                                          </button>
                                        </div>
                                        <p className="text-[12px] text-gray-400 italic leading-relaxed font-mono opacity-80">{p.val}</p>
                                      </div>
                                    ))}
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter'] selection:bg-blue-500/30">
      <header className="px-12 py-8 flex justify-between items-center w-full border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-3xl z-40 shadow-2xl">
        <div className="flex items-center gap-6 font-black tracking-tighter cursor-pointer group">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-2xl group-hover:rotate-[360deg] transition-transform duration-1000">
            <Terminal size={24} className="text-white" />
          </div>
          <span className="italic uppercase text-2xl hidden sm:inline tracking-tighter">
            <span className="text-blue-500">PHV</span> AI PROMPT GENERATOR <span className="text-blue-600">PRO</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-5 text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-full border shadow-2xl transition-all ${isApiKeyDetected ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {isApiKeyDetected ? <><ShieldCheck size={18} className="text-green-500" /> ENGINE ACTIVE</> : <><ShieldAlert size={18} className="text-red-500" /> API KEY ERROR</>}
          </div>
          <div className="hidden xl:flex gap-8 text-[11px] font-black text-gray-500 italic opacity-50 uppercase tracking-widest">
             <div className="flex items-center gap-3"><Mail size={16}/> tonyhoaivu@gmail.com</div>
             <div className="flex items-center gap-3"><Phone size={16}/> 0927099940</div>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full mx-auto">{renderContent()}</main>
      
      <footer className="w-full py-20 px-12 border-t border-white/5 text-center mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 blur-[150px] -z-10" />
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-3">
             <h4 className="text-2xl font-black italic uppercase tracking-tighter">Bản quyền © <span className="text-blue-500">TonyHoaivu.Com</span></h4>
             <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.8em] italic">AI Studio Professional Workflows</p>
          </div>
          <div className="flex justify-center gap-12 opacity-40">
            <a href="mailto:tonyhoaivu@gmail.com" className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"><Mail size={18}/> tonyhoaivu@gmail.com</a>
            <a href="tel:0927099940" className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"><Phone size={18}/> 0927099940</a>
          </div>
          <p className="text-[10px] text-gray-700 max-w-2xl mx-auto leading-relaxed uppercase font-black tracking-[0.4em] italic pt-10 border-t border-white/5">
            Optimized for Grok-3 Video, Sora, and Runway Gen-3. 
            Automated Scene Recognition Engine powered by Gemini 3 Flash Multimodal AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
