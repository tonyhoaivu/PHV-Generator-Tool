
import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertCircle,
  RefreshCw,
  Zap,
  Sparkles,
  FileText,
  MonitorPlay,
  Upload,
  Cpu,
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
  PlusCircle,
  Trash2,
  Shield,
  Settings,
  Lock,
  LogIn,
  Link as LinkIcon,
  Youtube,
  Globe,
  Tag,
  Target,
  FileCode,
  Clock
} from 'lucide-react';
import { analyzeVideoContent } from './services/geminiService';
import { ScriptAnalysisResult, ProcessingStep, Ad } from './types';
import StepIndicator from './components/StepIndicator';

const COPYRIGHT_INFO = "Bản quyền © TonyHoaivu.Com | Email: tonyhoaivu@gmail.com | Phone: 0927099940";
const ADMIN_PASSWORD = "0927099940@Phv";

const DEFAULT_ADS: Ad[] = [
  { id: '1', title: 'Khóa học AI Video', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400', link: 'https://tonyhoaivu.com/course' },
  { id: '2', title: 'Bộ Prompt Grok-3', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400', link: 'https://tonyhoaivu.com/prompts' }
];

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState<{ data: string, mimeType: string, name: string, size: number }[]>([]);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [result, setResult] = useState<ScriptAnalysisResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyDetected, setIsApiKeyDetected] = useState<boolean>(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = process.env.API_KEY || "";
    setIsApiKeyDetected(!!key && key !== 'undefined' && key.length > 10);

    const savedAds = localStorage.getItem('phv_ads');
    if (savedAds) {
      setAds(JSON.parse(savedAds));
    } else {
      setAds(DEFAULT_ADS);
    }
  }, []);

  const saveAds = (newAds: Ad[]) => {
    setAds(newAds);
    localStorage.setItem('phv_ads', JSON.stringify(newAds));
  };

  const addAd = () => {
    const newAd: Ad = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'Quảng cáo mới',
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400',
      link: 'https://tonyhoaivu.com'
    };
    saveAds([...ads, newAd]);
  };

  const removeAd = (id: string) => {
    saveAds(ads.filter(ad => ad.id !== id));
  };

  const updateAd = (id: string, field: keyof Ad, value: string) => {
    saveAds(ads.map(ad => ad.id === id ? { ...ad, [field]: value } : ad));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles = await Promise.all(Array.from(selectedFiles).map(async (file) => {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      return {
        data: base64.split(',')[1],
        mimeType: file.type,
        name: file.name,
        size: file.size
      };
    }));
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassInput === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setError(null);
    } else {
      setError("Mật khẩu Admin không chính xác.");
    }
  };

  const handleProcess = async () => {
    if (!inputText && files.length === 0) return;
    setError(null);
    setResult(null);
    try {
      setStep('fetching');
      await new Promise(r => setTimeout(r, 600));
      setStep('transcribing');
      await new Promise(r => setTimeout(r, 600));
      setStep('analyzing');
      const inputData = files.length > 0 ? (files.length === 1 ? files[0] : files) : inputText;
      const analysis = await analyzeVideoContent(inputData as any, { doAnalysis: true, type: 'video' });
      setResult(analysis);
      setStep('completed');
    } catch (err: any) {
      setError(err.message || "Lỗi tạo kịch bản.");
      setStep('error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const Sidebar = () => (
    <aside className="hidden lg:block w-80 space-y-8 animate-fade">
      <div className="bg-white luxury-border luxury-shadow p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-black uppercase tracking-widest text-emerald-800 border-b pb-4 flex items-center gap-3">
          <Zap size={20} className="text-amber-500" /> Tài trợ / Ads
        </h3>
        <div className="space-y-6">
          {ads.map(ad => (
            <a key={ad.id} href={ad.link} target="_blank" rel="noopener noreferrer" className="block group">
              <div className="relative rounded-2xl overflow-hidden mb-3 aspect-video luxury-border luxury-shadow">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">{ad.title}</span>
                </div>
              </div>
            </a>
          ))}
          {ads.length === 0 && <p className="text-gray-400 text-xs italic">Chưa có quảng cáo...</p>}
        </div>
      </div>
    </aside>
  );

  const HomeView = () => {
    if (step === 'idle') {
      return (
        <div className="max-w-4xl mx-auto mt-20 text-center animate-fade">
          <div className="mb-10 inline-flex items-center justify-center p-6 rounded-full bg-emerald-50 border border-emerald-100 luxury-shadow">
            <Shield size={64} className="text-emerald-600" />
          </div>
          <h1 className="text-6xl md:text-7xl font-serif font-black text-emerald-950 mb-6 tracking-tighter leading-none">
            PHV <span className="text-emerald-600 italic">Generator</span> Tool
          </h1>
          <p className="text-gray-400 text-xs font-black italic mb-16 tracking-[0.8em] uppercase">
            6s Scene Duration • AI Link Analysis • Veggie Warriors
          </p>

          <div className="bg-white luxury-border luxury-shadow p-12 md:p-16 rounded-[4rem] relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Sparkles size={120} className="text-emerald-600" />
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-4">
                  <label className="text-[11px] font-black uppercase text-emerald-800/40 tracking-[0.3em]">Nguồn Video (Link hoặc Ý tưởng)</label>
                  <div className="flex gap-4 opacity-40">
                    <Youtube size={16} /><LinkIcon size={16} />
                  </div>
                </div>
                <textarea 
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-10 text-emerald-950 text-xl focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[160px] placeholder:italic placeholder:text-gray-300 resize-none font-medium leading-relaxed"
                  placeholder="Dán link YouTube, TikTok hoặc nhập tên Chiến binh Rau Củ..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-4">
                  <label className="text-[11px] font-black uppercase text-emerald-800/40 tracking-[0.3em]">Tải lên Ảnh/Video thực tế</label>
                  <Upload size={16} className="opacity-40" />
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer border-2 border-dashed border-emerald-100 bg-emerald-50/20 rounded-[2.5rem] p-12 text-center hover:bg-emerald-50/40 hover:border-emerald-300 transition-all"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple hidden accept="image/*,video/*" />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-5 bg-white rounded-3xl shadow-sm group-hover:scale-110 transition-transform">
                       <Upload size={32} className="text-emerald-600" />
                    </div>
                    <div>
                       <p className="text-emerald-950 font-black italic text-lg uppercase">Click để tải File</p>
                    </div>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {files.map((f, i) => (
                      <div key={i} className="relative group bg-white p-3 rounded-2xl border border-emerald-50 luxury-shadow">
                        <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 z-10"><X size={12}/></button>
                        {f.mimeType.startsWith('image/') ? (
                          <img src={`data:${f.mimeType};base64,${f.data}`} className="w-full aspect-square object-cover rounded-xl" alt="Preview" />
                        ) : (
                          <div className="w-full aspect-square bg-emerald-900 rounded-xl flex items-center justify-center"><FileVideo size={32} className="text-emerald-400" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={handleProcess} 
                  disabled={(!inputText && files.length === 0) || !isApiKeyDetected} 
                  className="btn-luxury flex-[3] text-white font-black px-12 py-7 rounded-3xl text-[14px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  <Sparkles size={24} className="animate-pulse" /> Sáng tạo kịch bản (Mỗi cảnh 6s)
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (step !== 'completed' && step !== 'error') {
      return (
        <div className="max-w-xl mx-auto mt-32 text-center animate-fade">
          <RefreshCw size={80} className="text-emerald-600 animate-spin-slow mx-auto mb-12 opacity-20" />
          <h3 className="text-3xl font-serif font-black text-emerald-900 mb-4 italic">Đang phân tích kịch bản 6s...</h3>
          <div className="mt-12 bg-white luxury-border luxury-shadow p-8 rounded-[3rem]">
            <StepIndicator currentStep={step} />
          </div>
        </div>
      );
    }
    
    if (result) {
      return (
        <div className="flex flex-col lg:flex-row gap-12 mt-10 max-w-[1600px] mx-auto px-6 animate-fade">
          <div className="flex-1 space-y-16 pb-40">
            {/* Kết quả Tóm tắt */}
            <div className="bg-emerald-50/50 p-10 rounded-[3rem] luxury-border luxury-shadow relative overflow-hidden group">
               <h3 className="text-lg font-black text-emerald-900 uppercase tracking-widest mb-6 flex items-center gap-3"><FileText size={20}/> Tóm tắt Video Link</h3>
               <p className="text-emerald-900/80 italic font-medium leading-relaxed text-lg mb-8">{result.summary}</p>
               <div className="flex flex-wrap gap-4">
                  <div className="bg-white px-6 py-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
                     <Clock size={18} className="text-emerald-600" />
                     <span className="text-[12px] font-black uppercase text-emerald-950 tracking-widest">Tiêu chuẩn kịch bản: 6s / cảnh</span>
                  </div>
               </div>
            </div>

            {/* Storyboard 6s */}
            <div className="space-y-16">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-serif font-black text-emerald-950 italic">Storyboard Chiến Binh Rau Củ (6s)</h2>
                <button onClick={() => setStep('idle')} className="text-emerald-600 font-bold uppercase text-xs flex items-center gap-2 hover:underline">
                  <RefreshCw size={14} /> Phân tích video khác
                </button>
              </div>
              
              {result.scenes.map((scene) => (
                <div key={scene.id} className="bg-white luxury-border luxury-shadow rounded-[3.5rem] overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                  <div className="p-10 md:p-14 space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-serif text-3xl font-black italic shadow-lg">
                          {scene.id}
                        </div>
                        <h4 className="text-2xl font-serif font-black text-emerald-950 italic">{scene.visual}</h4>
                      </div>
                      <div className="bg-amber-100 text-amber-800 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} /> 6 Seconds
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <span className="text-[12px] font-black uppercase tracking-widest text-emerald-800 flex items-center gap-3"><ImageIcon size={18} /> Prompt Hình Ảnh</span>
                        <div className="bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100 relative group/p min-h-[140px]">
                          <p className="text-[14px] text-emerald-900/70 font-mono italic leading-relaxed">{scene.image_generation_prompt}</p>
                          <button onClick={() => copyToClipboard(scene.image_generation_prompt, `ip-${scene.id}`)} className="absolute top-4 right-4 opacity-0 group-hover/p:opacity-100 transition-opacity"><Copy size={16}/></button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <span className="text-[12px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-3"><MonitorPlay size={18} /> Video Prompt (6s Motion)</span>
                        <div className="bg-amber-50/30 p-8 rounded-3xl border border-amber-100 relative group/v min-h-[140px]">
                          <p className="text-[14px] text-emerald-950 font-bold italic leading-relaxed">{scene.cinematic_video_prompt}</p>
                          <button onClick={() => copyToClipboard(scene.cinematic_video_prompt, `v-${scene.id}`)} className="absolute top-4 right-4 opacity-0 group-hover/v:opacity-100 transition-opacity"><Copy size={16}/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Sidebar />
        </div>
      );
    }
    return null;
  };

  const AdminPanel = () => {
    if (!isAdminAuthenticated) {
      return (
        <div className="max-w-md mx-auto mt-24 p-10 bg-white luxury-border luxury-shadow rounded-[3rem] animate-fade">
          <div className="text-center mb-10">
            <div className="inline-flex p-5 rounded-3xl bg-emerald-50 mb-6">
              <Lock size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-serif font-black text-emerald-950 uppercase tracking-tight">Admin Portal</h2>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <input type="password" value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none" placeholder="Mật khẩu Admin..." required />
            <button type="submit" className="w-full btn-luxury text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.3em]">Đăng nhập</button>
            <button type="button" onClick={() => setView('home')} className="w-full text-gray-400 text-[10px] font-black uppercase tracking-widest mt-4">Quay lại</button>
          </form>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto mt-10 p-10 bg-white luxury-border luxury-shadow rounded-[3rem] animate-fade">
        <div className="flex justify-between items-center mb-12 border-b pb-8">
          <h2 className="text-4xl font-serif font-black text-emerald-900">Quản Lý Ads Kiếm Tiền</h2>
          <button onClick={() => setView('home')} className="bg-emerald-50 text-emerald-800 px-8 py-3 rounded-2xl font-black uppercase text-xs">Thoát Admin</button>
        </div>
        <div className="space-y-12">
          <button onClick={addAd} className="w-full py-6 border-2 border-dashed border-emerald-200 rounded-3xl text-emerald-600 font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-3">
             <PlusCircle size={24} /> Thêm Banner Sidebar
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ads.map(ad => (
              <div key={ad.id} className="p-8 luxury-border rounded-3xl bg-gray-50/50 space-y-6 relative group">
                <button onClick={() => removeAd(ad.id)} className="absolute top-6 right-6 text-red-300 hover:text-red-600"><Trash2 size={20} /></button>
                <div className="space-y-4">
                  <input value={ad.title} onChange={e => updateAd(ad.id, 'title', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm" placeholder="Tên dịch vụ/Sản phẩm" />
                  <input value={ad.imageUrl} onChange={e => updateAd(ad.id, 'imageUrl', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm" placeholder="URL Hình ảnh banner" />
                  <input value={ad.link} onChange={e => updateAd(ad.id, 'link', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm" placeholder="Link Affiliate / Link đích" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1a1a1a]">
      <header className="px-8 md:px-16 py-8 flex justify-between items-center w-full glass sticky top-0 z-50 luxury-border luxury-shadow">
        <div onClick={() => setView('home')} className="flex items-center gap-4 cursor-pointer">
          <Shield size={32} className="text-emerald-800" />
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-black text-emerald-950 leading-none">PHV TOOL</span>
            <span className="text-[10px] font-black text-gray-400 tracking-[0.4em] uppercase leading-none mt-1">6s AI Scripting</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
           <div onClick={() => setView('admin')} className="cursor-pointer hover:bg-emerald-50 p-3 rounded-xl transition-all"><Settings size={22} className="text-emerald-800" /></div>
           <div className={`px-8 py-3 rounded-full text-[10px] font-black tracking-widest border ${isApiKeyDetected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
             {isApiKeyDetected ? '• ENGINE ACTIVE' : '• ENGINE ERROR'}
           </div>
        </div>
      </header>

      <main className="pb-32 px-6">
        {view === 'admin' ? <AdminPanel /> : <HomeView />}
      </main>

      <footer className="py-24 px-12 border-t border-gray-100 bg-white text-center">
        <h4 className="text-4xl font-serif font-black italic text-emerald-950 mb-4">PHV Generator Tool</h4>
        <div className="flex justify-center gap-10 text-emerald-800/40 mb-12">
           <a href="mailto:tonyhoaivu@gmail.com" className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase"><Mail size={16}/> Email</a>
           <a href="tel:0927099940" className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase"><Phone size={16}/> 0927099940</a>
        </div>
        <p className="text-[11px] text-gray-300 uppercase font-black tracking-[0.5em] italic pt-12 border-t">{COPYRIGHT_INFO}</p>
      </footer>
    </div>
  );
};

export default App;
