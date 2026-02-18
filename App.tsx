
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
  Plus,
  ArrowRight,
  Scissors,
  Volume2,
  FileSearch,
  MessageSquareQuote
} from 'lucide-react';
import { analyzeVideoContent } from './services/geminiService';
import { ScriptAnalysisResult, ProcessingStep, GrokScene } from './types';
import StepIndicator from './components/StepIndicator';

const COPYRIGHT_INFO = "Bản quyền © TonyHoaivu.Com | Email: tonyhoaivu@gmail.com | Phone: 0927099940";

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
    const key = process.env.API_KEY || "";
    setIsApiKeyDetected(!!key && key !== 'undefined' && key.length > 10);
  }, []);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach((f: File) => {
        if (f.size > 50 * 1024 * 1024) {
          alert(`File ${f.name} quá lớn (tối đa 50MB).`);
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
    let fileName = `tonyhoaivu-script-${Date.now()}.${format}`;
    let type = "text/plain";

    if (format === 'json') {
      content = JSON.stringify({ ...result, copyright: COPYRIGHT_INFO }, null, 2);
      type = "application/json";
    } else {
      content = `CHUYÊN GIA BIÊN TẬP VIDEO AI - STORYBOARD PRO\n`;
      content += `===================================================\n`;
      content += `Tóm tắt tổng quát: ${result.summary}\n\n`;
      result.scenes.forEach(s => {
        content += `Phân cảnh ${s.id}: ${s.visual}\n`;
        content += `Prompt: ${s.cinematic_video_prompt}\n`;
        content += `Vocal: ${s.vietnamese_vocal}\n\n`;
      });
      content += `\n${COPYRIGHT_INFO}`;
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
        <div className="mt-12 text-center px-4 animate-in fade-in duration-1000 max-w-5xl mx-auto">
          <div className="mb-8 inline-flex items-center justify-center p-6 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <MonitorPlay size={56} className="text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter italic leading-none">
            AI VIDEO <span className="text-blue-500">EDITOR</span> PRO <span className="text-blue-600">TOOL</span>
          </h1>
          <p className="text-gray-500 text-xs font-black italic opacity-80 mb-12 tracking-[0.6em] uppercase">
            Phân cảnh chi tiết • Prompt chuyên sâu • Vocal tự nhiên
          </p>
          
          <div className="glass p-10 md:p-16 rounded-[3.5rem] border border-white/5 shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Cpu size={48} className="text-blue-500" />
            </div>

            <div className="space-y-10">
              {files.length === 0 ? (
                <div className="relative group">
                  <textarea 
                    className="w-full bg-black/60 border border-white/5 rounded-[2.5rem] p-10 text-white text-lg focus:ring-4 focus:ring-blue-500/20 transition-all min-h-[220px] placeholder:italic placeholder:text-gray-700 shadow-inner resize-none font-medium leading-relaxed"
                    placeholder="Dán kịch bản hoặc link Video của bạn vào đây để chuyên gia AI bắt đầu biên tập..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="absolute bottom-8 right-10 flex items-center gap-2 text-[10px] text-gray-600 font-black uppercase tracking-widest italic pointer-events-none opacity-40">
                    <Zap size={12} /> AI Storyboarding Engine
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 p-8 bg-black/40 rounded-[2.5rem] border border-dashed border-white/10">
                  {files.map((f, i) => (
                    <div key={i} className="relative group aspect-square bg-[#0a0f1d] rounded-3xl flex flex-col items-center justify-center p-6 border border-white/5 hover:border-blue-500/30 transition-all overflow-hidden shadow-2xl">
                      {f.mimeType.includes('video') ? <FileVideo size={48} className="text-blue-400" /> : <ImageIcon size={48} className="text-purple-400" />}
                      <span className="text-[10px] font-black text-gray-500 mt-4 truncate w-full text-center px-4 italic uppercase">{f.name}</span>
                      <button onClick={() => removeFile(i)} className="absolute top-3 right-3 p-2 bg-red-600/90 rounded-full hover:bg-red-600 transition-colors shadow-lg">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-blue-600/5 border border-dashed border-blue-500/20 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-blue-600/10 transition-all group"
                  >
                    <Plus size={40} className="text-blue-500 group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Thêm Media</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex-1 px-12 py-7 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-black uppercase text-[13px] tracking-widest transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl"
                >
                  <Upload size={22} /> Chọn Nguồn
                </button>
                <button 
                  onClick={handleProcess} 
                  disabled={(!inputText && files.length === 0) || !isApiKeyDetected} 
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:opacity-50 text-white font-black px-12 py-7 rounded-3xl text-[13px] uppercase tracking-[0.3em] transition-all shadow-[0_25px_60px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 active:scale-95"
                >
                  <Sparkles size={22} className="animate-pulse" /> BẮT ĐẦU BIÊN TẬP
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
          <div className="text-center mb-16">
            <div className="relative inline-block mb-12">
               <RefreshCw size={84} className="text-blue-500 animate-spin-slow opacity-10" />
               <Zap size={42} className="text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-[0.5em] italic mb-6">Đang Biên Tập...</h3>
            <p className="text-[11px] text-gray-500 italic max-w-sm mx-auto leading-relaxed uppercase tracking-[0.4em] font-black">AI đang phân tích, viết prompt và sáng tạo vocal cho từng cảnh...</p>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      );
    }

    if (step === 'error') {
      return (
        <div className="max-w-xl mx-auto mt-24 text-center px-12 py-16 glass rounded-[3.5rem] border border-red-500/20 shadow-2xl animate-in zoom-in">
          <AlertCircle size={84} className="text-red-500 mx-auto mb-10 shadow-red-500/20 shadow-2xl" />
          <h2 className="text-white font-black uppercase text-2xl mb-6 tracking-widest italic">Lỗi Xử Lý</h2>
          <p className="text-red-400 text-base italic font-bold mb-14 leading-relaxed bg-red-500/5 p-10 rounded-[2.5rem] border border-red-500/10 shadow-inner">
            {error}
          </p>
          <button onClick={() => setStep('idle')} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-12 py-7 rounded-3xl font-black text-[13px] uppercase tracking-widest transition-all shadow-2xl active:scale-95">
            Thử Lại
          </button>
        </div>
      );
    }

    if (result) {
      return (
        <div className="w-full mt-10 px-6 pb-48 space-y-20 max-w-[1600px] mx-auto animate-in fade-in duration-1000">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-white/5 pb-12">
            <div className="space-y-4 text-center md:text-left">
               <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-6 justify-center md:justify-start">
                <MonitorPlay className="text-blue-500" size={48}/> KẾT QUẢ BIÊN TẬP <span className="text-blue-500">AI</span>
               </h2>
               <div className="flex flex-wrap gap-5 items-center justify-center md:justify-start">
                 <span className="bg-blue-600/10 text-blue-400 text-[11px] font-black px-6 py-2.5 rounded-full border border-blue-500/20 uppercase italic tracking-[0.2em]">
                    {result.language}
                 </span>
                 <span className="bg-green-600/10 text-green-400 text-[11px] font-black px-6 py-2.5 rounded-full border border-green-500/20 uppercase italic tracking-[0.2em]">
                    {result.scenes.length} Phân Cảnh
                 </span>
               </div>
            </div>
            <div className="flex flex-wrap gap-5">
              <button onClick={() => exportData('txt')} className="glass px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-white/5 transition-all shadow-2xl">
                <FileText size={20} /> Xuất Kịch Bản
              </button>
              <button onClick={() => exportData('json')} className="glass px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-white/5 transition-all shadow-2xl">
                <FileJson size={20} /> Xuất JSON
              </button>
              <button onClick={() => setStep('idle')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-blue-500 transition-all shadow-[0_15px_50px_rgba(37,99,235,0.4)]">
                <RefreshCw size={20} /> Biên Tập Mới
              </button>
            </div>
          </div>

          {/* Detailed Scenes List - Following User's Request Structure */}
          <div className="space-y-20">
             <div className="flex items-center justify-between">
                <h3 className="text-4xl font-black uppercase italic flex items-center gap-10 text-white tracking-[0.3em]">
                  <Scissors className="text-blue-500" size={56}/> DANH SÁCH PHÂN CẢNH
                </h3>
                <div className="h-px bg-white/5 flex-1 ml-12 hidden md:block" />
             </div>

             <div className="grid grid-cols-1 gap-16">
                {result.scenes.map((scene) => (
                  <div key={scene.id} className="bg-[#0b101f]/90 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-3xl overflow-hidden transition-all hover:border-blue-500/30">
                    <div className="p-10 md:p-16 space-y-12 relative">
                      <div className="absolute top-0 left-0 w-3 h-full bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.8)]" />
                      
                      <div className="flex flex-col xl:flex-row gap-12 items-start">
                         {/* 1. Phân cảnh Section */}
                         <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-6">
                               <div className="w-20 h-20 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-xl italic">
                                 {scene.id}
                               </div>
                               <h4 className="text-2xl font-black text-white italic uppercase flex items-center gap-4">
                                 Phân cảnh {scene.id}
                               </h4>
                            </div>
                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                               <p className="text-lg text-gray-200 font-bold italic leading-relaxed">
                                 {scene.visual}
                               </p>
                            </div>
                         </div>

                         {/* 2. Prompt Section */}
                         <div className="flex-1 space-y-6">
                            <span className="text-[13px] text-blue-500 font-black uppercase tracking-[0.5em] flex items-center gap-4 italic">
                               <Cpu size={20} /> Prompt (Visual Description)
                            </span>
                            <div className="bg-black/60 p-8 rounded-[2rem] border border-blue-500/10 relative group">
                               <p className="text-[15px] text-blue-200/80 font-mono italic leading-[1.8]">
                                 {scene.cinematic_video_prompt}
                               </p>
                               <button 
                                 onClick={() => copyToClipboard(scene.cinematic_video_prompt, `p-${scene.id}`)}
                                 className="absolute top-6 right-6 p-3 bg-blue-500/10 rounded-xl hover:bg-blue-500/30 transition-all opacity-0 group-hover:opacity-100"
                               >
                                 <Copy size={18} className="text-blue-400" />
                               </button>
                            </div>
                         </div>

                         {/* 3. Vocal Section */}
                         <div className="flex-1 space-y-6">
                            <span className="text-[13px] text-green-500 font-black uppercase tracking-[0.5em] flex items-center gap-4 italic">
                               <Volume2 size={20} /> Vocal (Voiceover)
                            </span>
                            <div className="bg-green-600/10 p-8 rounded-[2rem] border border-green-500/20 relative group">
                               <p className="text-lg text-white font-black italic leading-relaxed">
                                 "{scene.vietnamese_vocal}"
                               </p>
                               <button 
                                 onClick={() => copyToClipboard(scene.vietnamese_vocal, `v-${scene.id}`)}
                                 className="absolute top-6 right-6 p-3 bg-green-500/10 rounded-xl hover:bg-green-500/30 transition-all opacity-0 group-hover:opacity-100"
                               >
                                 <Copy size={18} className="text-green-400" />
                               </button>
                            </div>
                         </div>
                      </div>

                      {/* Optional Expandable Technical Details */}
                      <button 
                        onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center justify-center gap-4 transition-all"
                      >
                        {expandedScene === scene.id ? <><ChevronDown size={16} /> Thu gọn chi tiết kỹ thuật</> : <><ChevronRight size={16} /> Xem chi tiết kỹ thuật (Mood, Camera, Lighting...)</>}
                      </button>

                      {expandedScene === scene.id && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 animate-in slide-in-from-top">
                           {[
                             { label: 'Camera', val: scene.camera_angle, icon: Camera },
                             { label: 'Lighting', val: scene.lighting_mood, icon: Sparkles },
                             { label: 'Mood', val: scene.mood, icon: Wind },
                             { label: 'Env', val: scene.background_setting, icon: Layers }
                           ].map((item, idx) => (
                             <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-2">
                               <div className="flex items-center gap-3">
                                 <item.icon size={16} className="text-blue-500" />
                                 <span className="text-[9px] font-black text-gray-600 uppercase italic tracking-widest">{item.label}</span>
                               </div>
                               <p className="text-[12px] text-gray-300 font-bold italic truncate">{item.val}</p>
                             </div>
                           ))}
                        </div>
                      )}
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
      <header className="px-12 py-10 flex justify-between items-center w-full border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-3xl z-40 shadow-2xl">
        <div className="flex items-center gap-8 font-black tracking-tighter cursor-pointer group">
          <div className="bg-blue-600 p-5 rounded-3xl shadow-3xl group-hover:rotate-[360deg] transition-transform duration-1000">
            <Terminal size={32} className="text-white" />
          </div>
          <span className="italic uppercase text-3xl hidden sm:inline tracking-tighter leading-none">
            <span className="text-blue-500">PHV</span> AI EDITOR <span className="text-blue-600">PRO</span>
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className={`flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.3em] px-10 py-4 rounded-full border shadow-3xl transition-all ${isApiKeyDetected ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {isApiKeyDetected ? <><ShieldCheck size={22} className="text-green-500" /> ENGINE ACTIVE</> : <><ShieldAlert size={22} className="text-red-500" /> AUTH ERROR</>}
          </div>
          <div className="hidden 2xl:flex gap-12 text-[12px] font-black text-gray-600 italic opacity-60 uppercase tracking-[0.4em]">
             <div className="flex items-center gap-4"><Mail size={20}/> tonyhoaivu@gmail.com</div>
             <div className="flex items-center gap-4"><Phone size={20}/> 0927099940</div>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full mx-auto">{renderContent()}</main>
      
      <footer className="w-full py-24 px-12 border-t border-white/5 text-center mt-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 blur-[200px] -z-10" />
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-4">
             <h4 className="text-3xl font-black italic uppercase tracking-tighter">Bản quyền © <span className="text-blue-500">TonyHoaivu.Com</span></h4>
             <p className="text-[12px] text-gray-600 font-black uppercase tracking-[1em] italic">AI Professional Video Editing Tools</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-10 opacity-50">
            <a href="mailto:tonyhoaivu@gmail.com" className="flex items-center justify-center gap-4 text-[14px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"><Mail size={22}/> tonyhoaivu@gmail.com</a>
            <a href="tel:0927099940" className="flex items-center justify-center gap-4 text-[14px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"><Phone size={22}/> 0927099940</a>
          </div>
          <p className="text-[11px] text-gray-800 max-w-3xl mx-auto leading-relaxed uppercase font-black tracking-[0.6em] italic pt-12 border-t border-white/5">
            Optimized for professional AI Video workflows: Grok-3, Sora, Runway Gen-3, Kling AI. 
            Automated Scene Recognition powered by Gemini 3 Flash.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
