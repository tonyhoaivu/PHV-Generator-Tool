
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
  Settings,
  Plus,
  Trash2,
  FileJson,
  Cpu,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  X,
  FileVideo
} from 'lucide-react';
import { analyzeVideoContent } from './services/geminiService';
import { ScriptAnalysisResult, ProcessingStep, GrokScene } from './types';
import StepIndicator from './components/StepIndicator';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<{ data: string, mimeType: string, name: string, size: number } | null>(null);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [result, setResult] = useState<ScriptAnalysisResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyDetected, setIsApiKeyDetected] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
    setIsApiKeyDetected(!!key && key !== 'undefined' && key.length > 10 && !key.includes('PLACEHOLDER'));
  }, []);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 20 * 1024 * 1024) { // 20MB Limit
        alert("File quá lớn! Vui lòng chọn file dưới 20MB để đảm bảo tốc độ xử lý.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFile({ 
          data: base64, 
          mimeType: f.type, 
          name: f.name,
          size: f.size
        });
        // Clear input text if file is uploaded
        setInputText("");
      };
      reader.readAsDataURL(f);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProcess = async () => {
    if (!inputText && !file) return;
    setError(null);
    setResult(null);
    try {
      setStep('fetching');
      await new Promise(r => setTimeout(r, 500));
      setStep('transcribing');
      await new Promise(r => setTimeout(r, 500));
      setStep('analyzing');
      
      const inputData = file ? { data: file.data, mimeType: file.mimeType } : inputText;
      const analysis = await analyzeVideoContent(inputData, { doAnalysis: true } as any);
      
      setResult(analysis);
      setStep('completed');
    } catch (err: any) {
      setError(err.message || "Hệ thống gặp lỗi không xác định.");
      setStep('error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const blob = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
  };

  const renderContent = () => {
    if (step === 'idle') {
      return (
        <div className="mt-20 text-center px-4 animate-in fade-in duration-700">
          <div className="mb-6 inline-flex items-center justify-center p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.3)]">
            <Zap size={40} className="text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter italic flex items-center justify-center gap-3">
            PHV <span className="text-blue-500">Generator Tool</span>
            <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded italic non-italic font-bold tracking-normal align-middle shadow-lg shadow-blue-500/50">TURBO 3.0</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium italic opacity-70 mb-12 tracking-wide">
            Phân tích Video & Kịch bản — Chia cảnh 6s chuyên nghiệp cho AI Video
          </p>
          
          <div className="max-w-3xl mx-auto glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 text-[8px] font-bold text-blue-500 uppercase tracking-widest">
                <Cpu size={12} /> Gemini 3 Flash Enabled
              </div>
            </div>

            {!isApiKeyDetected && (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4 text-left animate-pulse">
                <ShieldAlert size={24} className="text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-200 font-bold uppercase italic leading-tight">
                  Cảnh báo: Không tìm thấy API Key. Hãy cấu hình GEMINI_API_KEY trên Vercel và REDEPLOY.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {!file ? (
                <div className="relative">
                  <textarea 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all min-h-[200px] placeholder:italic placeholder:text-gray-600 shadow-inner"
                    placeholder="Dán link (YT/TikTok/FB) hoặc dán kịch bản văn bản vào đây..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase italic">
                    <ExternalLink size={12} /> Auto-detect Content
                  </div>
                </div>
              ) : (
                <div className="w-full bg-blue-600/5 border-2 border-dashed border-blue-500/30 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-300">
                  <div className="relative">
                    {file.mimeType.includes('video') ? <FileVideo size={48} className="text-blue-400" /> : <FileText size={48} className="text-blue-400" />}
                    <button onClick={removeFile} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-white italic truncate max-w-xs">{file.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Analysis</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.docx,video/*" onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className={`flex-1 px-6 py-4 rounded-xl border font-black uppercase text-[11px] transition-all flex items-center justify-center gap-3 ${file ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'}`}
                  disabled={!!file}
                >
                  <Upload size={16} /> Upload Video/Doc
                </button>
                <button 
                  onClick={handleProcess} 
                  disabled={(!inputText && !file) || !isApiKeyDetected} 
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:opacity-50 text-white font-black px-8 py-4 rounded-xl text-[11px] uppercase transition-all shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 active:scale-95"
                >
                  <Sparkles size={16} /> Bắt Đầu Xử Lý
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
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <RefreshCw size={48} className="text-blue-500 animate-spin mx-auto mb-6" />
              <Zap size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-widest italic animate-pulse">
              {step === 'fetching' ? 'Đang đọc dữ liệu...' : step === 'transcribing' ? 'Đang chuẩn hóa nội dung...' : 'Gemini đang phân tích Video...'}
            </h3>
            <p className="text-xs text-gray-500 mt-2 italic">Vui lòng không tắt trình duyệt, quá trình này có thể mất 15-30 giây.</p>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      );
    }

    if (step === 'error') {
      const isConfigError = error?.includes("CHƯA CẤU HÌNH");
      return (
        <div className="max-w-xl mx-auto mt-24 text-center px-10 py-12 glass rounded-[2.5rem] border border-red-500/20 shadow-2xl animate-in zoom-in">
          <AlertCircle size={56} className="text-red-500 mx-auto mb-6 shadow-red-500/20 shadow-2xl" />
          <h2 className="text-white font-black uppercase text-base mb-4 tracking-widest italic">LỖI HỆ THỐNG</h2>
          <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 mb-8 text-left">
            <p className="text-red-400 text-sm italic font-bold leading-relaxed whitespace-pre-line">{error}</p>
          </div>
          <button onClick={() => setStep('idle')} className="w-full bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-[12px] uppercase shadow-lg transition-all active:scale-95 shadow-red-600/20">
            Thử Lại Ngay
          </button>
        </div>
      );
    }

    if (result) {
      return (
        <div className="w-full mt-8 px-6 pb-40 space-y-12 animate-in fade-in max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-6">
            <div className="space-y-1">
               <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                KẾT QUẢ <span className="text-blue-500">OPTIMIZED</span>
               </h2>
               <div className="flex gap-2 items-center">
                 <span className="bg-blue-600/10 text-blue-400 text-[9px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase italic">
                    {result.language}
                 </span>
                 <span className="bg-green-600/10 text-green-400 text-[9px] font-black px-3 py-1 rounded-full border border-green-500/20 uppercase italic">
                    {result.scenes.length} Cảnh (6s/Block)
                 </span>
               </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadFile(JSON.stringify(result, null, 2), "phv-analysis.json", "application/json")} className="glass px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-white/5 transition-all">
                <FileJson size={14} /> Tải JSON
              </button>
              <button onClick={() => setStep('idle')} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-blue-500 transition-all">
                <RefreshCw size={14} /> Làm Mới
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                <div className="glass p-8 rounded-3xl space-y-6">
                  <h4 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                    <FileText size={16}/> TÓM TẮT NỘI DUNG & KỊCH BẢN GỐC
                  </h4>
                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                    <p className="text-xs text-blue-400 font-black mb-4 uppercase italic">Tóm tắt:</p>
                    <p className="text-sm text-gray-400 leading-relaxed italic mb-6 border-b border-white/5 pb-4">{result.summary}</p>
                    <p className="text-xs text-blue-400 font-black mb-4 uppercase italic">Kịch bản đã viết lại:</p>
                    <p className="text-sm text-gray-200 leading-relaxed italic whitespace-pre-wrap">{result.rewritten_script}</p>
                  </div>
                </div>
             </div>

             <div className="space-y-6">
               <div className="glass p-8 rounded-3xl h-full space-y-6">
                  <h4 className="text-green-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                    <Sparkles size={16}/> ĐỀ XUẤT TIÊU ĐỀ VIRAL
                  </h4>
                  <div className="space-y-4">
                    {result.viral_titles.map((title: string, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/20 transition-all group">
                         <p className="font-black text-white text-[13px] leading-snug italic">"{title}"</p>
                         <button onClick={() => copyToClipboard(title, `t-${i}`)} className="mt-3 text-[8px] font-black bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full uppercase">
                           {copiedId === `t-${i}` ? 'Đã Chép' : 'Sao Chép'}
                         </button>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>

          <div className="space-y-10">
             <h3 className="text-xl font-black uppercase italic flex items-center gap-4 text-white">
                <MonitorPlay className="text-blue-500" size={24}/> CHI TIẾT PHÂN CẢNH (6 GIÂY/CẢNH)
             </h3>

             <div className="grid grid-cols-1 gap-10">
                {result.scenes.map((scene: GrokScene) => (
                  <div key={scene.id} className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl hover:border-blue-500/30 transition-all group/scene relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.8)]"></div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-8 border-b border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                          {scene.id}
                        </div>
                        <div className="space-y-1">
                          <span className="text-xl font-black text-blue-400 uppercase tracking-widest">{scene.timestamp}</span>
                          <span className="block text-[10px] text-gray-500 font-bold uppercase italic tracking-widest">6 Seconds Segment</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Góc Quay', val: scene.camera },
                          { label: 'Cảm Xúc', val: scene.emotion },
                          { label: 'Ánh Sáng', val: scene.lighting },
                          { label: 'Âm Thanh', val: scene.sound_effect }
                        ].map((attr, ai) => (
                          <div key={ai} className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[8px] text-gray-500 font-black uppercase block">{attr.label}</span>
                            <span className="text-[10px] text-gray-300 font-bold italic truncate block">{attr.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic opacity-50">Visual & Action Description</span>
                            <div className="bg-black/30 p-6 rounded-2xl border border-white/5 min-h-[100px] shadow-inner">
                              <p className="text-[13px] font-black text-gray-200 italic leading-relaxed">
                                {scene.visual} — {scene.action}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic opacity-50">Voiceover / Script</span>
                            <p className="text-[11px] font-medium text-blue-300 italic">"{scene.voiceover}"</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-2">
                                <MonitorPlay size={12}/> GROK / SORA VIDEO PROMPT
                              </span>
                              <button onClick={() => copyToClipboard(scene.grok_video_prompt, `p-vid-${scene.id}`)} className="text-[9px] font-black bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 px-5 py-1.5 rounded-full border border-blue-500/20 transition-all">
                                {copiedId === `p-vid-${scene.id}` ? 'Đã Chép' : 'Chép Prompt'}
                              </button>
                            </div>
                            <pre className="bg-black/60 p-6 rounded-2xl border border-white/5 text-[11px] font-mono text-blue-200/70 italic overflow-x-auto whitespace-pre-wrap leading-relaxed border-l-2 border-blue-600 shadow-2xl">
                              {scene.grok_video_prompt}
                            </pre>
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
          <span className="italic uppercase text-xl">
            <span className="text-blue-500">PHV</span> Generator Tool
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-4 text-[9px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full border shadow-inner transition-all ${isApiKeyDetected ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {isApiKeyDetected ? (
              <>
                <ShieldCheck size={14} className="text-green-500" />
                System Active
              </>
            ) : (
              <>
                <ShieldAlert size={14} className="text-red-500" />
                Check API Key
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full mx-auto">{renderContent()}</main>
      
      <footer className="w-full py-12 px-10 border-t border-white/5 text-center mt-20 opacity-40">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em] italic">
          PHV GEN TURBO • MULTIMODAL AI AGENT • 2024
        </p>
      </footer>
    </div>
  );
};

export default App;
