
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
import { ScriptAnalysisResult, ProcessingStep, GrokScene, ViralTitle } from './types';
import StepIndicator from './components/StepIndicator';

const WATERMARK = "\n\nCopyright © TonyHoaivu | Email: tonyhoaivu@gmail.com | Phone: 092709940";

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
    // Only use process.env.API_KEY as per guidelines
    const key = process.env.API_KEY;
    setIsApiKeyDetected(!!key && key !== 'undefined' && key.length > 10);
  }, []);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      // Fixed: Explicitly typed the file as File to resolve unknown type error
      Array.from(uploadedFiles).forEach((f: File) => {
        if (f.size > 20 * 1024 * 1024) return;
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
        // Fixed: f is now typed as File which is a Blob
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

  const exportData = (format: 'txt' | 'json' | 'docx') => {
    if (!result) return;
    let content = "";
    let fileName = `tonyhoaivu-storyboard.${format}`;
    let type = "text/plain";

    if (format === 'json') {
      content = JSON.stringify({ ...result, watermark: WATERMARK.trim() }, null, 2);
      type = "application/json";
    } else {
      content = `VIDEO & IMAGE ANALYSIS STORYBOARD\n`;
      content += `================================\n`;
      content += `Summary: ${result.summary}\n`;
      content += `Language: ${result.language}\n\n`;
      content += `SCENES:\n`;
      result.scenes.forEach(s => {
        content += `[Scene ${s.id}] (${s.timestamp})\n`;
        content += `- Visual: ${s.visual}\n`;
        content += `- Action: ${s.action}\n`;
        content += `- Prompt: ${s.grok_video_prompt}\n\n`;
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
          <div className="mb-6 inline-flex items-center justify-center p-4 rounded-3xl bg-blue-600/10 border border-blue-500/20 shadow-2xl">
            <Sparkles size={42} className="text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">
            VIDEO & IMAGE <span className="text-blue-500">→</span> PROMPT GENERATOR <span className="text-blue-600">PRO</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium italic opacity-80 mb-10 tracking-wide">
            Analyze Real Content • Scene Splits • Grok-3 Video Ready • by TonyHoaivu
          </p>
          
          <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-40">
              <Cpu size={24} className="text-blue-500" />
            </div>

            <div className="space-y-8">
              {files.length === 0 ? (
                <div className="relative group">
                  <textarea 
                    className="w-full bg-black/50 border border-white/10 rounded-3xl p-8 text-white text-base focus:ring-4 focus:ring-blue-500/20 transition-all min-h-[180px] placeholder:italic placeholder:text-gray-600 shadow-inner resize-none"
                    placeholder="Dán Link Video (YouTube, TikTok, FB...) hoặc mô tả kịch bản..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest italic pointer-events-none">
                    <ExternalLink size={12} /> Auto AI Detection
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  {files.map((f, i) => (
                    <div key={i} className="relative group aspect-square bg-black/40 rounded-2xl flex flex-col items-center justify-center p-4 border border-white/5 hover:border-blue-500/30 transition-all overflow-hidden">
                      {f.mimeType.includes('video') ? <FileVideo size={32} className="text-blue-400" /> : <ImageIcon size={32} className="text-purple-400" />}
                      <span className="text-[9px] font-bold text-gray-400 mt-2 truncate w-full text-center px-2">{f.name}</span>
                      <button onClick={() => removeFile(i)} className="absolute top-2 right-2 p-1 bg-red-600/80 rounded-full hover:bg-red-600 transition-colors">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-blue-600/10 border border-dashed border-blue-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-600/20 transition-all group"
                  >
                    <Plus size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-blue-400">Thêm File</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex-1 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[12px] tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Upload size={18} /> Upload Media
                </button>
                <button 
                  onClick={handleProcess} 
                  disabled={(!inputText && files.length === 0) || !isApiKeyDetected} 
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:opacity-50 text-white font-black px-10 py-5 rounded-2xl text-[12px] uppercase tracking-widest transition-all shadow-[0_15px_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 active:scale-95"
                >
                  <Zap size={18} className="animate-pulse" /> Analyze content now
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (step !== 'completed' && step !== 'error') {
      return (
        <div className="max-w-xl mx-auto mt-24 px-4">
          <div className="text-center mb-12">
            <RefreshCw size={54} className="text-blue-500 animate-spin mx-auto mb-8 shadow-blue-500/20 shadow-2xl" />
            <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] italic mb-4">Deep Content Analysis...</h3>
            <p className="text-sm text-gray-500 italic max-w-xs mx-auto leading-relaxed">System is extracting visual & audio data from your source.</p>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      );
    }

    if (step === 'error') {
      return (
        <div className="max-w-xl mx-auto mt-24 text-center px-12 py-16 glass rounded-[3rem] border border-red-500/20 shadow-2xl animate-in zoom-in">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-8" />
          <h2 className="text-white font-black uppercase text-lg mb-4 tracking-widest italic">Analysis Error</h2>
          <p className="text-red-400 text-sm italic font-medium mb-12 leading-relaxed bg-red-500/5 p-6 rounded-2xl border border-red-500/10">
            {error}
          </p>
          <button onClick={() => setStep('idle')} className="w-full bg-white/5 hover:bg-white/10 text-white px-8 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest border border-white/10 transition-all">
            Try Again
          </button>
        </div>
      );
    }

    if (result) {
      return (
        <div className="w-full mt-8 px-6 pb-40 space-y-12 max-w-[1400px] mx-auto animate-in fade-in duration-500">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-8">
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Storyboarding & <span className="text-blue-500">Prompts</span>
               </h2>
               <div className="flex flex-wrap gap-3 items-center">
                 <span className="bg-blue-600/10 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-500/20 uppercase italic">
                    {result.language}
                 </span>
                 <span className="bg-green-600/10 text-green-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-green-500/20 uppercase italic">
                    {result.scenes.length} Sections
                 </span>
               </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => exportData('txt')} className="glass px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white/5 transition-all">
                <FileText size={16} /> Export TXT
              </button>
              <button onClick={() => exportData('json')} className="glass px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white/5 transition-all">
                <FileJson size={16} /> Export JSON
              </button>
              <button onClick={() => setStep('idle')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                <RefreshCw size={16} /> New Analysis
              </button>
            </div>
          </div>

          {/* Analysis Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-10">
                <div className="glass p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Layers size={80} className="text-blue-500" />
                  </div>
                  <h4 className="text-blue-500 font-black text-[12px] uppercase tracking-[0.4em] flex items-center gap-4">
                    <Info size={18}/> Real Content Analysis
                  </h4>
                  <div className="space-y-6">
                    <p className="text-gray-300 text-base leading-relaxed italic border-l-4 border-blue-600 pl-6 bg-blue-600/5 py-4 rounded-r-2xl">
                      "{result.summary}"
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                       <div className="space-y-3">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Characters Detected</span>
                          <div className="flex flex-wrap gap-2">
                            {result.detected_characters.map((c, i) => (
                              <span key={i} className="bg-white/5 px-3 py-1 rounded-lg text-[11px] font-bold text-gray-400 italic">#{c}</span>
                            ))}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Locations Detected</span>
                          <div className="flex flex-wrap gap-2">
                            {result.detected_locations.map((l, i) => (
                              <span key={i} className="bg-white/5 px-3 py-1 rounded-lg text-[11px] font-bold text-gray-400 italic">@{l}</span>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Viral Titles Section */}
                <div className="glass p-10 rounded-[2.5rem] space-y-8">
                  <h4 className="text-orange-500 font-black text-[12px] uppercase tracking-[0.4em] flex items-center gap-4">
                    <Sparkles size={18}/> Viral & SEO Titles Generator
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.titles.map((t, i) => (
                      <div key={i} className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all space-y-3 relative">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-black bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded uppercase tracking-tighter">
                            {t.category}
                          </span>
                          <button onClick={() => copyToClipboard(t.vietnamese, `title-vn-${i}`)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy size={12} className="text-gray-500 hover:text-white" />
                          </button>
                        </div>
                        <p className="font-bold text-white text-sm italic leading-snug">"{t.vietnamese}"</p>
                        <p className="text-[10px] text-gray-500 font-mono line-clamp-2 italic opacity-60">Prompt: {t.english_prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="space-y-10">
               {/* Hook Section */}
               <div className="glass p-10 rounded-[2.5rem] space-y-8 border-l-8 border-l-red-600 shadow-red-600/10 shadow-2xl">
                  <h4 className="text-red-500 font-black text-[12px] uppercase tracking-[0.4em] flex items-center gap-4">
                    <Wind size={18}/> Viral Hook / Thumbnail
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Hook Text (VN)</span>
                      <p className="text-lg font-black text-white italic leading-tight">"{result.hook_data.thumbnail_text}"</p>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-red-400 font-black uppercase">Hook Image Prompt (EN)</span>
                        <button onClick={() => copyToClipboard(result.hook_data.image_prompt, 'hook-prompt')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                          <Copy size={14} className="text-gray-400" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-mono italic p-4 bg-black/40 rounded-xl border border-white/5">
                        {result.hook_data.image_prompt}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        Highlight: {result.hook_data.emotional_highlight}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                        Lighting: {result.hook_data.dramatic_lighting}
                      </div>
                    </div>
                  </div>
               </div>
             </div>
          </div>

          {/* Detailed Scenes */}
          <div className="space-y-12">
             <h3 className="text-2xl font-black uppercase italic flex items-center gap-6 text-white tracking-widest">
                <MonitorPlay className="text-blue-500" size={32}/> Detailed Scene Storyboard
             </h3>

             <div className="space-y-8">
                {result.scenes.map((scene) => (
                  <div key={scene.id} className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden group/scene transition-all hover:border-blue-500/20">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row gap-10">
                      {/* Left Side: Basic Info */}
                      <div className="md:w-1/4 space-y-6 border-r border-white/5 pr-8">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/30">
                            {scene.id}
                          </div>
                          <div className="space-y-1">
                            <span className="block text-2xl font-black text-blue-400 tracking-tighter italic">{scene.timestamp}</span>
                            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">6S Segment</span>
                          </div>
                        </div>

                        <div className="space-y-4 pt-6">
                           {[
                             { label: 'Camera', val: scene.camera, icon: Camera },
                             { label: 'Lighting', val: scene.lighting, icon: Sparkles },
                             { label: 'Mood', val: scene.mood, icon: Wind },
                             { label: 'Emotion', val: scene.emotion, icon: Zap }
                           ].map((item, idx) => (
                             <div key={idx} className="flex items-center gap-3 group/item">
                               <item.icon size={14} className="text-gray-600 group-hover/item:text-blue-500 transition-colors" />
                               <div className="space-y-0.5">
                                 <span className="block text-[8px] text-gray-600 uppercase font-black tracking-widest">{item.label}</span>
                                 <span className="block text-[11px] text-gray-300 font-bold italic">{item.val}</span>
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Right Side: Detailed Analysis & Prompts */}
                      <div className="md:w-3/4 space-y-10">
                         {/* Content Row */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                               <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Visual & Action
                               </span>
                               <p className="text-base text-gray-200 font-medium italic leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                                 {scene.visual} — {scene.action}
                               </p>
                            </div>
                            <div className="space-y-4">
                               <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Audio / Script
                               </span>
                               <div className="space-y-3">
                                  {/* Fixed: Use dialogue property from GrokScene instead of voiceover */}
                                  <p className="text-sm text-blue-400 font-black italic">"{scene.dialogue}"</p>
                                  <div className="text-[10px] text-gray-500 italic flex gap-4">
                                    <span>FX: {scene.sound_effects}</span>
                                    <span>Ambient: {scene.ambient_audio}</span>
                                  </div>
                                </div>
                            </div>
                         </div>

                         {/* Prompts Row */}
                         <div className="space-y-6">
                            <div className="flex justify-between items-center">
                              <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 italic">Advanced Generation Prompts (English)</h5>
                              <button 
                                onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                                className="text-[10px] font-black uppercase text-gray-500 hover:text-white flex items-center gap-2 transition-colors"
                              >
                                {expandedScene === scene.id ? <><ChevronDown size={14} /> Close details</> : <><ChevronRight size={14} /> Full Prompt Suite</>}
                              </button>
                            </div>

                            <div className="space-y-4">
                               <div className="group/prompt relative">
                                 <div className="flex justify-between items-center mb-2 px-2">
                                   <span className="text-[9px] font-black text-gray-600 uppercase">Grok-3 / Sora Video Prompt</span>
                                   <button onClick={() => copyToClipboard(scene.grok_video_prompt, `vid-p-${scene.id}`)} className="text-[10px] font-black text-blue-500 hover:underline">Copy Prompt</button>
                                 </div>
                                 <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-[12px] font-mono text-blue-200/60 italic leading-relaxed group-hover/prompt:border-blue-500/30 transition-all border-l-4 border-l-blue-600 shadow-2xl">
                                   {scene.grok_video_prompt}
                                 </div>
                               </div>

                               {expandedScene === scene.id && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top duration-300">
                                    {[
                                      { label: 'Character Description', val: scene.character_description, icon: Cpu },
                                      { label: 'Motion Prompt', val: scene.motion_prompt, icon: RefreshCw },
                                      { label: 'Camera Movement', val: scene.camera_movement_prompt, icon: Camera },
                                      { label: 'Environment / Art Style', val: scene.environment_prompt, icon: Layers }
                                    ].map((p, pi) => (
                                      <div key={pi} className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-2">
                                            <p.icon size={12}/> {p.label}
                                          </span>
                                          <button onClick={() => copyToClipboard(p.val, `p-${pi}-${scene.id}`)}>
                                            <Copy size={12} className="text-gray-600 hover:text-white" />
                                          </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic line-clamp-3">{p.val}</p>
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
      <header className="px-10 py-6 flex justify-between items-center w-full border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-2xl z-40 shadow-2xl">
        <div className="flex items-center gap-5 font-black tracking-tighter cursor-pointer group">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg group-hover:rotate-[360deg] transition-transform duration-1000">
            <Terminal size={20} className="text-white" />
          </div>
          <span className="italic uppercase text-xl hidden sm:inline">
            <span className="text-blue-500">PHV</span> AI PROMPT GENERATOR
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full border shadow-inner transition-all ${isApiKeyDetected ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {isApiKeyDetected ? <><ShieldCheck size={14} className="text-green-500" /> API Engine Loaded</> : <><ShieldAlert size={14} className="text-red-500" /> Key Missing</>}
          </div>
          <div className="hidden lg:flex gap-4 text-[10px] font-bold text-gray-500 italic opacity-60">
             <div className="flex items-center gap-2"><Mail size={12}/> tonyhoaivu@gmail.com</div>
             <div className="flex items-center gap-2"><Phone size={12}/> 092709940</div>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full mx-auto">{renderContent()}</main>
      
      <footer className="w-full py-16 px-10 border-t border-white/5 text-center mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 blur-[100px] -z-10" />
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.5em] italic">
            Copyright © TonyHoaivu • 2024
          </p>
          <div className="flex justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><Mail size={14}/> tonyhoaivu@gmail.com</div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><Phone size={14}/> 092709940</div>
          </div>
          <p className="text-[9px] text-gray-600 max-w-lg mx-auto leading-relaxed uppercase font-black tracking-widest italic pt-4">
            Advanced Scene Analysis System powered by Gemini 3 Flash. 
            All generated content is optimized for professional AI video workflows.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
