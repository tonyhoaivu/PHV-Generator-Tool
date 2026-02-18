
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
  Scissors
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
    // Ưu tiên lấy từ process.env.API_KEY do build tool inject vào
    const key = process.env.API_KEY || "";
    setIsApiKeyDetected(!!key && key !== 'undefined' && key.length > 10 && !key.includes('PLACEHOLDER'));
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
    let fileName = `tonyhoaivu-analysis-${Date.now()}.${format}`;
    let type = "text/plain";

    if (format === 'json') {
      content = JSON.stringify({ ...result, copyright: COPYRIGHT_INFO }, null, 2);
      type = "application/json";
    } else {
      content = `VIDEO & IMAGE → SCENE ANALYSIS → PROMPT GENERATOR PRO\n`;
      content += `===================================================\n`;
      content += `Tóm tắt: ${result.summary}\n`;
      content += `Hook: ${result.hook_data.thumbnail_text}\n\n`;
      content += `DANH SÁCH PHÂN CẢNH (Mỗi 6 giây):\n`;
      result.scenes.forEach(s => {
        content += `[Cảnh ${s.id}] (${s.timestamp})\n`;
        content += `- Hành động: ${s.action}\n`;
        content += `- Hình ảnh: ${s.visual}\n`;
        content += `- Video Prompt (EN): ${s.cinematic_video_prompt}\n\n`;
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
            VIDEO & IMAGE <span className="text-blue-500">→</span> PROMPT GENERATOR <span className="text-blue-600">PRO</span>
          </h1>
          <p className="text-gray-500 text-xs font-black italic opacity-80 mb-12 tracking-[0.6em] uppercase">
            AI Real Content Analysis • Grok-3 Video Optimization • Cinematic Storyboarding
          </p>
          
          <div className="glass p-10 md:p-16 rounded-[3.5rem] border border-white/5 shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Cpu size={48} className="text-blue-500" />
            </div>

            {!isApiKeyDetected && (
              <div className="mb-8 p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center gap-5 text-left animate-pulse">
                <ShieldAlert size={32} className="text-red-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-red-400 uppercase tracking-widest italic">Cảnh báo: Chưa cấu hình API Key</p>
                  <p className="text-[11px] text-red-200/60 leading-relaxed font-medium">Hệ thống chưa tìm thấy khóa API hợp lệ. Vui lòng thiết lập GEMINI_API_KEY trong biến môi trường và REDEPLOY.</p>
                </div>
              </div>
            )}

            <div className="space-y-10">
              {files.length === 0 ? (
                <div className="relative group">
                  <textarea 
                    className="w-full bg-black/60 border border-white/5 rounded-[2.5rem] p-10 text-white text-lg focus:ring-4 focus:ring-blue-500/20 transition-all min-h-[220px] placeholder:italic placeholder:text-gray-700 shadow-inner resize-none font-medium leading-relaxed"
                    placeholder="Dán link Video (YT, TikTok, FB, Zalo...) hoặc kịch bản để phân tích nội dung thực tế..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="absolute bottom-8 right-10 flex items-center gap-2 text-[10px] text-gray-600 font-black uppercase tracking-widest italic pointer-events-none opacity-40">
                    <Zap size={12} /> Deep Multimodal Extraction
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
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Upload Media</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex-1 px-12 py-7 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-black uppercase text-[13px] tracking-widest transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl"
                >
                  <Upload size={22} /> Chọn File Nguồn
                </button>
                <button 
                  onClick={handleProcess} 
                  disabled={(!inputText && files.length === 0) || !isApiKeyDetected} 
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:opacity-50 text-white font-black px-12 py-7 rounded-3xl text-[13px] uppercase tracking-[0.3em] transition-all shadow-[0_25px_60px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 active:scale-95"
                >
                  <Sparkles size={22} className="animate-pulse" /> PHÂN TÍCH NỘI DUNG (AI)
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
            <h3 className="text-3xl font-black text-white uppercase tracking-[0.5em] italic mb-6">Analytic Core</h3>
            <p className="text-[11px] text-gray-500 italic max-w-sm mx-auto leading-relaxed uppercase tracking-[0.4em] font-black">Extracting real visual metadata & splitting scenes every 6 seconds...</p>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      );
    }

    if (step === 'error') {
      return (
        <div className="max-w-xl mx-auto mt-24 text-center px-12 py-16 glass rounded-[3.5rem] border border-red-500/20 shadow-2xl animate-in zoom-in">
          <AlertCircle size={84} className="text-red-500 mx-auto mb-10 shadow-red-500/20 shadow-2xl" />
          <h2 className="text-white font-black uppercase text-2xl mb-6 tracking-widest italic">Hệ Thống Tạm Ngừng</h2>
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
                <MonitorPlay className="text-blue-500" size={48}/> SCENE BREAKDOWN <span className="text-blue-500">PRO</span>
               </h2>
               <div className="flex flex-wrap gap-5 items-center justify-center md:justify-start">
                 <span className="bg-blue-600/10 text-blue-400 text-[11px] font-black px-6 py-2.5 rounded-full border border-blue-500/20 uppercase italic tracking-[0.2em]">
                    {result.language}
                 </span>
                 <span className="bg-green-600/10 text-green-400 text-[11px] font-black px-6 py-2.5 rounded-full border border-green-500/20 uppercase italic tracking-[0.2em]">
                    {result.scenes.length} Phân Cảnh (6s)
                 </span>
               </div>
            </div>
            <div className="flex flex-wrap gap-5">
              <button onClick={() => exportData('txt')} className="glass px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-white/5 transition-all shadow-2xl">
                <FileText size={20} /> Xuất TXT
              </button>
              <button onClick={() => exportData('json')} className="glass px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-white/5 transition-all shadow-2xl">
                <FileJson size={20} /> Xuất JSON
              </button>
              <button onClick={() => setStep('idle')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-blue-500 transition-all shadow-[0_15px_50px_rgba(37,99,235,0.4)]">
                <RefreshCw size={20} /> Làm Mới
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-8 space-y-12">
                {/* Analysis Box */}
                <div className="glass p-12 md:p-16 rounded-[4rem] space-y-12 relative overflow-hidden group/box shadow-3xl">
                  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover/box:scale-110 transition-transform duration-1000">
                    <Layers size={140} className="text-blue-500" />
                  </div>
                  <h4 className="text-blue-500 font-black text-[14px] uppercase tracking-[0.6em] flex items-center gap-6 italic">
                    <Info size={24}/> Phân Tích Nội Dung Thực Tế
                  </h4>
                  <div className="space-y-10 relative">
                    <div className="p-10 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 shadow-inner">
                      <p className="text-gray-200 text-xl leading-[1.8] italic font-medium">
                        "{result.summary}"
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-4">
                       <div className="space-y-5">
                          <span className="text-[12px] text-gray-600 font-black uppercase tracking-[0.4em] flex items-center gap-4 italic">
                            <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_10px_blue]" /> Nhân vật
                          </span>
                          <div className="flex flex-wrap gap-4">
                            {result.detected_characters.map((c, i) => (
                              <span key={i} className="bg-white/5 px-5 py-2 rounded-xl text-[13px] font-bold text-gray-400 italic border border-white/5">#{c}</span>
                            ))}
                          </div>
                       </div>
                       <div className="space-y-5">
                          <span className="text-[12px] text-gray-600 font-black uppercase tracking-[0.4em] flex items-center gap-4 italic">
                            <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_10px_blue]" /> Bối cảnh
                          </span>
                          <div className="flex flex-wrap gap-4">
                            {result.detected_locations.map((l, i) => (
                              <span key={i} className="bg-white/5 px-5 py-2 rounded-xl text-[13px] font-bold text-gray-400 italic border border-white/5">@{l}</span>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Title Box */}
                <div className="glass p-12 md:p-16 rounded-[4rem] space-y-12 shadow-3xl">
                  <h4 className="text-orange-500 font-black text-[14px] uppercase tracking-[0.6em] flex items-center gap-6 italic">
                    <Sparkles size={24}/> Đề Xuất 10 Tiêu Đề Viral (SEO)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {result.titles.map((t, i) => (
                      <div key={i} className="group p-8 rounded-[2.5rem] bg-[#0d1324] border border-white/5 hover:border-orange-500/40 transition-all space-y-5 relative shadow-xl">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] italic">
                            {t.category}
                          </span>
                          <button onClick={() => copyToClipboard(t.vietnamese, `title-vn-${i}`)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 p-2.5 rounded-full hover:bg-white/10">
                            <Copy size={16} className="text-gray-400" />
                          </button>
                        </div>
                        <p className="font-bold text-white text-lg italic leading-snug">"{t.vietnamese}"</p>
                        <p className="text-[11px] text-gray-600 font-mono line-clamp-2 italic leading-relaxed opacity-60">Prompt: {t.english_prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="lg:col-span-4 space-y-12">
               {/* Hook Box */}
               <div className="glass p-12 rounded-[3.5rem] space-y-12 border-l-[16px] border-l-red-600 shadow-red-600/10 shadow-3xl sticky top-40">
                  <h4 className="text-red-500 font-black text-[14px] uppercase tracking-[0.6em] flex items-center gap-6 italic">
                    <Wind size={24}/> Viral Hook & Thumbnail
                  </h4>
                  <div className="space-y-10">
                    <div className="space-y-5">
                      <span className="text-[12px] text-gray-600 font-black uppercase tracking-[0.4em] italic">Text Thumbnail (VN)</span>
                      <p className="text-3xl font-black text-white italic leading-none tracking-tighter">"{result.hook_data.thumbnail_text}"</p>
                    </div>
                    <div className="space-y-5 pt-10 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-red-400 font-black uppercase tracking-widest flex items-center gap-3">
                           <Camera size={16}/> Image Prompt (EN)
                        </span>
                        <button onClick={() => copyToClipboard(result.hook_data.image_prompt, 'hook-p')} className="p-4 bg-red-600/10 rounded-2xl hover:bg-red-600/20 transition-all border border-red-500/20">
                          <Copy size={18} className="text-red-400" />
                        </button>
                      </div>
                      <p className="text-[13px] text-gray-400 leading-relaxed font-mono italic p-8 bg-black/60 rounded-[2rem] border border-white/5 shadow-inner">
                        {result.hook_data.image_prompt}
                      </p>
                    </div>
                    <div className="space-y-5 pt-4">
                      <div className="flex items-center gap-5 text-[13px] text-gray-400 italic bg-white/5 p-5 rounded-2xl">
                        <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_12px_red]" />
                        <span className="font-black uppercase text-[10px] tracking-widest opacity-50">Highlight:</span> {result.hook_data.emotional_highlight}
                      </div>
                      <div className="flex items-center gap-5 text-[13px] text-gray-400 italic bg-white/5 p-5 rounded-2xl">
                        <div className="w-3 h-3 rounded-full bg-orange-600 animate-pulse shadow-[0_0_12px_orange]" />
                        <span className="font-black uppercase text-[10px] tracking-widest opacity-50">Lighting:</span> {result.hook_data.dramatic_lighting_description}
                      </div>
                    </div>
                  </div>
               </div>
             </div>
          </div>

          {/* Detailed Scenes List */}
          <div className="space-y-20">
             <div className="flex items-center justify-between">
                <h3 className="text-4xl font-black uppercase italic flex items-center gap-10 text-white tracking-[0.3em]">
                  <Scissors className="text-blue-500" size={56}/> Phân Cảnh 6 Giây
                </h3>
                <div className="h-px bg-white/5 flex-1 ml-12 hidden md:block" />
             </div>

             <div className="space-y-16">
                {result.scenes.map((scene) => (
                  <div key={scene.id} className="bg-[#0b101f]/90 backdrop-blur-3xl border border-white/5 rounded-[4.5rem] shadow-3xl overflow-hidden group/scene transition-all hover:border-blue-500/30">
                    <div className="p-12 md:p-20 flex flex-col xl:flex-row gap-20 relative">
                      <div className="absolute top-0 left-0 w-3 h-full bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.8)]" />
                      
                      {/* Left: Metadata */}
                      <div className="xl:w-1/4 space-y-10 border-r border-white/5 pr-12">
                        <div className="flex items-center gap-8">
                          <div className="w-28 h-28 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white font-black text-5xl shadow-[0_0_40px_rgba(37,99,235,0.4)] italic">
                            {scene.id}
                          </div>
                          <div className="space-y-1">
                            <span className="block text-4xl font-black text-blue-400 tracking-tighter italic leading-none">{scene.timestamp}</span>
                            <span className="block text-[11px] text-gray-600 font-black uppercase tracking-[0.6em] italic">6s Segment</span>
                          </div>
                        </div>

                        <div className="space-y-6 pt-12">
                           {[
                             { label: 'Camera', val: scene.camera_angle, icon: Camera },
                             { label: 'Lighting', val: scene.lighting_mood, icon: Sparkles },
                             { label: 'Env', val: scene.background_setting, icon: Layers },
                             { label: 'Mood', val: scene.mood, icon: Wind },
                             { label: 'Emotion', val: scene.emotion_conveyed, icon: Zap }
                           ].map((item, idx) => (
                             <div key={idx} className="flex items-center gap-6 group/item bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                               <div className="p-3 bg-blue-600/10 rounded-xl">
                                 <item.icon size={20} className="text-blue-400 group-hover/item:scale-110 transition-transform duration-500" />
                               </div>
                               <div className="space-y-1">
                                 <span className="block text-[10px] text-gray-600 uppercase font-black tracking-widest italic">{item.label}</span>
                                 <span className="block text-[13px] text-gray-200 font-bold italic truncate max-w-[160px]">{item.val}</span>
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Right: Detailed Content & Prompts */}
                      <div className="xl:w-3/4 space-y-16">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-6">
                               <span className="text-[13px] text-gray-500 font-black uppercase tracking-[0.5em] flex items-center gap-5 italic">
                                 <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_blue]" /> Visual & Action
                               </span>
                               <div className="bg-black/60 p-10 rounded-[2.5rem] border border-white/5 shadow-inner min-h-[160px] flex items-center">
                                 <p className="text-lg text-gray-200 font-bold italic leading-relaxed">
                                   {scene.visual} — {scene.action}
                                 </p>
                               </div>
                               <div className="flex flex-col gap-2 opacity-60">
                                  <span className="text-[10px] font-black text-gray-600 uppercase italic">Gesture/Expression:</span>
                                  <p className="text-[12px] text-gray-400 italic">{scene.body_gesture} | {scene.facial_expression}</p>
                               </div>
                            </div>
                            <div className="space-y-6">
                               <span className="text-[13px] text-gray-500 font-black uppercase tracking-[0.5em] flex items-center gap-5 italic">
                                 <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_blue]" /> Audio & Dialogue
                               </span>
                               <div className="space-y-6 bg-[#030712] p-10 rounded-[2.5rem] border border-white/5 min-h-[160px]">
                                  <p className="text-lg text-blue-400 font-black italic">"{scene.dialogue_voice}"</p>
                                  <div className="flex flex-wrap gap-8 pt-6 border-t border-white/5">
                                    <div className="text-[12px] text-gray-500 italic flex items-center gap-3 font-black uppercase"><Layers size={16}/> FX: {scene.music_sound_effects}</div>
                                    <div className="text-[12px] text-gray-500 italic flex items-center gap-3 font-black uppercase"><Wind size={16}/> AMB: {scene.ambient_audio}</div>
                                  </div>
                                </div>
                            </div>
                         </div>

                         {/* AI Prompts Generator Section */}
                         <div className="space-y-10">
                            <div className="flex justify-between items-center border-b border-white/5 pb-8">
                              <h5 className="text-[16px] font-black uppercase tracking-[0.6em] text-blue-500 italic flex items-center gap-4">
                                <Sparkles size={20}/> Grok-3 / Sora PROMPT SUITE (EN)
                              </h5>
                              <button 
                                onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                                className="px-8 py-3 rounded-full bg-blue-600/10 text-[12px] font-black uppercase text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 flex items-center gap-4 transition-all"
                              >
                                {expandedScene === scene.id ? <><ChevronDown size={18} /> Hide Prompts</> : <><ChevronRight size={18} /> Full Suite Details</>}
                              </button>
                            </div>

                            <div className="space-y-8">
                               <div className="group/prompt relative">
                                 <div className="flex justify-between items-center mb-5 px-6">
                                   <span className="text-[12px] font-black text-gray-600 uppercase tracking-widest italic">Cinematic Video Prompt</span>
                                   <button onClick={() => copyToClipboard(scene.cinematic_video_prompt, `vid-p-${scene.id}`)} className="text-[13px] font-black text-blue-500 hover:underline flex items-center gap-3">
                                     <Copy size={16}/> Sao chép prompt
                                   </button>
                                 </div>
                                 <div className="bg-black p-12 rounded-[3rem] border border-blue-500/10 text-[15px] font-mono text-blue-200/70 italic leading-[1.8] group-hover/prompt:border-blue-500/30 transition-all border-l-[12px] border-l-blue-600 shadow-3xl">
                                   {scene.cinematic_video_prompt}
                                 </div>
                               </div>

                               {expandedScene === scene.id && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-top duration-700">
                                    {[
                                      { label: 'Character Prompt', val: scene.character_description_prompt, icon: Cpu },
                                      { label: 'Motion Control', val: scene.motion_prompt, icon: RefreshCw },
                                      { label: 'Dynamic Camera', val: scene.camera_movement_prompt, icon: Camera },
                                      { label: 'World/Art Style', val: scene.environment_prompt, icon: Layers },
                                      { label: 'Image Prompt', val: scene.image_generation_prompt, icon: ImageIcon },
                                      { label: 'Lighting Prompt', val: scene.lighting_prompt, icon: Sparkles }
                                    ].map((p, pi) => (
                                      <div key={pi} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-5 hover:border-blue-500/20 transition-all shadow-2xl">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[11px] font-black text-gray-600 uppercase flex items-center gap-4 tracking-[0.2em] italic">
                                            <p.icon size={18} className="text-blue-400"/> {p.label}
                                          </span>
                                          <button onClick={() => copyToClipboard(p.val, `p-${pi}-${scene.id}`)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10">
                                            <Copy size={16} className="text-gray-500 hover:text-white" />
                                          </button>
                                        </div>
                                        <p className="text-[13px] text-gray-400 italic leading-relaxed font-mono opacity-80">{p.val}</p>
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
      <header className="px-12 py-10 flex justify-between items-center w-full border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-3xl z-40 shadow-2xl">
        <div className="flex items-center gap-8 font-black tracking-tighter cursor-pointer group">
          <div className="bg-blue-600 p-5 rounded-3xl shadow-3xl group-hover:rotate-[360deg] transition-transform duration-1000">
            <Terminal size={32} className="text-white" />
          </div>
          <span className="italic uppercase text-3xl hidden sm:inline tracking-tighter leading-none">
            <span className="text-blue-500">PHV</span> AI GENERATOR <span className="text-blue-600">PRO</span>
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
             <p className="text-[12px] text-gray-600 font-black uppercase tracking-[1em] italic">AI Professional Storyboarding Tools</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-10 opacity-50">
            <a href="mailto:tonyhoaivu@gmail.com" className="flex items-center justify-center gap-4 text-[14px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"><Mail size={22}/> tonyhoaivu@gmail.com</a>
            <a href="tel:0927099940" className="flex items-center justify-center gap-4 text-[14px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"><Phone size={22}/> 0927099940</a>
          </div>
          <p className="text-[11px] text-gray-800 max-w-3xl mx-auto leading-relaxed uppercase font-black tracking-[0.6em] italic pt-12 border-t border-white/5">
            Optimized for professional AI Video workflows: Grok-3, Sora, Runway Gen-3, Kling AI. 
            Automated Scene Recognition powered by Gemini 3 Flash Brain.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
