
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  RefreshCw,
  Zap,
  Sparkles,
  FileText,
  MonitorPlay,
  Upload,
  X,
  FileVideo,
  Image as ImageIcon,
  Copy,
  Info,
  Phone,
  Mail,
  PlusCircle,
  Trash2,
  Shield,
  Settings,
  Lock,
  LogIn,
  Link as LinkIcon,
  Youtube,
  Globe,
  Clock,
  Camera,
  CheckCircle2
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

// --- Sub-component cho Form Đăng Nhập để tối ưu Performance ---
const AdminLoginForm = ({ onLogin, onCancel, error }: { onLogin: (pass: string, remember: boolean) => void, onCancel: () => void, error: string | null }) => {
  const passRef = useRef<HTMLInputElement>(null);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passRef.current) {
      onLogin(passRef.current.value, remember);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-12 bg-white luxury-border luxury-shadow rounded-[3rem] animate-fade">
      <div className="text-center mb-10">
        <div className="inline-flex p-6 rounded-3xl bg-emerald-50 mb-6 border border-emerald-100 luxury-shadow">
          <Lock size={48} className="text-emerald-600" />
        </div>
        <h2 className="text-3xl font-serif font-black text-emerald-950 uppercase tracking-tight">Admin Portal</h2>
        <p className="text-[10px] text-gray-400 font-black uppercase mt-2 tracking-[0.2em]">Cổng quản trị bảo mật cao</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <input 
            ref={passRef}
            type="password" 
            autoFocus
            tabIndex={1}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
            placeholder="Nhập mật khẩu Admin..." 
            required 
          />
          <label className="flex items-center gap-3 cursor-pointer group" tabIndex={2} onKeyDown={(e) => e.key === ' ' && setRemember(!remember)}>
            <div className="relative">
              <input 
                type="checkbox" 
                checked={remember} 
                onChange={(e) => setRemember(e.target.checked)} 
                className="sr-only" 
              />
              <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${remember ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-200'}`}>
                {remember && <CheckCircle2 size={14} className="text-white" />}
              </div>
            </div>
            <span className="text-[11px] font-black uppercase text-emerald-900/60 tracking-widest group-hover:text-emerald-600 transition-colors">Ghi nhớ đăng nhập</span>
          </label>
        </div>
        {error && <p className="text-red-500 text-[11px] font-bold text-center animate-pulse">{error}</p>}
        <button type="submit" tabIndex={3} className="w-full btn-luxury text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3">
          <LogIn size={20} /> Truy cập hệ thống
        </button>
        <button type="button" onClick={onCancel} tabIndex={4} className="w-full text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">Quay lại trang chủ</button>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState<{ data: string, mimeType: string, name: string, size: number }[]>([]);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [result, setResult] = useState<ScriptAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyDetected, setIsApiKeyDetected] = useState<boolean>(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = process.env.API_KEY || "";
    setIsApiKeyDetected(!!key && key !== 'undefined' && key.length > 10);

    const savedAds = localStorage.getItem('phv_ads');
    if (savedAds) setAds(JSON.parse(savedAds));
    else setAds(DEFAULT_ADS);

    const savedLogo = localStorage.getItem('phv_logo');
    if (savedLogo) setAppLogo(savedLogo);

    const savedAuth = localStorage.getItem('phv_admin_auth');
    if (savedAuth === 'true') setIsAdminAuthenticated(true);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAppLogo(base64);
      localStorage.setItem('phv_logo', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAdImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateAd(id, 'imageUrl', base64);
    };
    reader.readAsDataURL(file);
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

  const handleAdminLogin = (password: string, remember: boolean) => {
    if (password.trim() === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setError(null);
      if (remember) {
        localStorage.setItem('phv_admin_auth', 'true');
      }
    } else {
      setError("Mật khẩu Admin không chính xác. Vui lòng thử lại!");
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('phv_admin_auth');
    setView('home');
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
    // Logic copiedId handled elsewhere if needed for UI feedback
  };

  const AppLogoDisplay = ({ size = 32 }: { size?: number }) => {
    if (appLogo) {
      return <img src={appLogo} alt="Logo" className="object-contain rounded-lg shadow-sm" style={{ width: size, height: size }} />;
    }
    return <Shield size={size} className="text-emerald-800" />;
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1a1a1a]">
      <header className="px-10 md:px-20 py-10 flex justify-between items-center w-full glass sticky top-0 z-50 luxury-border luxury-shadow">
        <div onClick={() => setView('home')} className="flex items-center gap-6 cursor-pointer group">
          <div className="p-1 transition-transform group-hover:scale-110 duration-500">
            <AppLogoDisplay size={40} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-serif font-black text-emerald-950 leading-none tracking-tighter uppercase">PHV <span className="text-emerald-600">TOOL</span></span>
            <span className="text-[11px] font-black text-gray-400 tracking-[0.5em] uppercase leading-none mt-2">AI Video Production</span>
          </div>
        </div>
        <div className="flex items-center gap-12">
           <div onClick={() => setView('admin')} className="cursor-pointer hover:bg-emerald-50 p-4 rounded-2xl transition-all group border border-transparent hover:border-emerald-100">
              <Settings size={28} className="text-emerald-800 group-hover:rotate-180 transition-transform duration-1000" />
           </div>
           <div className={`px-10 py-4 rounded-full text-[11px] font-black tracking-[0.3em] border transition-all ${isApiKeyDetected ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-red-50 text-red-600 border-red-100'}`}>
             {isApiKeyDetected ? '• ENGINE ACTIVE' : '• ENGINE ERROR'}
           </div>
        </div>
      </header>

      <main className="pb-40 px-10">
        {view === 'admin' ? (
          !isAdminAuthenticated ? (
            <AdminLoginForm 
              onLogin={handleAdminLogin} 
              onCancel={() => setView('home')} 
              error={error} 
            />
          ) : (
            <div className="max-w-5xl mx-auto mt-10 p-12 bg-white luxury-border luxury-shadow rounded-[3rem] animate-fade">
              <div className="flex justify-between items-center mb-12 border-b pb-8">
                <div>
                  <h2 className="text-4xl font-serif font-black text-emerald-900">Admin Control</h2>
                  <p className="text-emerald-800/40 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Hệ thống quản lý Luxury</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setView('home')} className="bg-emerald-50 text-emerald-800 px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-emerald-100 transition-all">Trang chủ</button>
                  <button onClick={handleLogout} className="bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-red-100 transition-all">Đăng xuất</button>
                </div>
              </div>
              <div className="space-y-16">
                <section className="space-y-8 bg-gray-50/30 p-10 rounded-[2.5rem] border border-gray-100">
                   <div className="flex items-center gap-4">
                      <Camera size={24} className="text-emerald-600" />
                      <h3 className="text-xl font-serif font-black text-emerald-950">Thay đổi Logo App</h3>
                   </div>
                   <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center border border-gray-100 luxury-shadow overflow-hidden group relative">
                         {appLogo ? <img src={appLogo} alt="Preview" className="w-full h-full object-contain" /> : <Shield size={48} className="text-gray-100" />}
                      </div>
                      <div className="flex-1 space-y-4">
                         <p className="text-sm font-bold text-emerald-950 italic">Cập nhật hình ảnh nhận diện thương hiệu</p>
                         <input type="file" ref={logoInputRef} onChange={handleLogoUpload} hidden accept="image/*" />
                         <div className="flex gap-4">
                            <button onClick={() => logoInputRef.current?.click()} className="btn-luxury text-white px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                               <Upload size={16} /> Tải logo mới
                            </button>
                            {appLogo && (
                               <button onClick={() => { setAppLogo(null); localStorage.removeItem('phv_logo'); }} className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:underline">Xóa logo</button>
                            )}
                         </div>
                      </div>
                   </div>
                </section>
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <Zap size={24} className="text-amber-500" />
                         <h3 className="text-xl font-serif font-black text-emerald-950 italic">Cấu hình Quảng cáo Sidebar</h3>
                      </div>
                      <button onClick={addAd} className="bg-emerald-600 text-white px-8 py-3 rounded-xl flex items-center gap-3 font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg">
                         <PlusCircle size={18} /> Tạo Banner Mới
                      </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {ads.map(ad => (
                      <div key={ad.id} className="p-8 luxury-border rounded-[2.5rem] bg-white space-y-8 relative group hover:shadow-2xl transition-all border-emerald-50">
                        <button onClick={() => removeAd(ad.id)} className="absolute top-6 right-6 text-red-200 hover:text-red-600 transition-colors">
                           <Trash2 size={24} />
                        </button>
                        <div className="space-y-6">
                          <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 luxury-shadow group/img">
                             <img src={ad.imageUrl} alt="Ad Banner" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <input type="file" onChange={(e) => handleAdImageUpload(ad.id, e)} hidden id={`ad-file-${ad.id}`} accept="image/*" />
                                <button onClick={() => document.getElementById(`ad-file-${ad.id}`)?.click()} className="bg-white text-emerald-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl">
                                   Thay đổi ảnh Banner
                                </button>
                             </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tiêu đề quảng cáo</label>
                                <input value={ad.title} onChange={e => updateAd(ad.id, 'title', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-emerald-500 outline-none" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Link điều hướng (URL)</label>
                                <input value={ad.link} onChange={e => updateAd(ad.id, 'link', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none" placeholder="https://..." />
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )
        ) : (
          step === 'idle' ? (
            <div className="max-w-4xl mx-auto mt-20 text-center animate-fade">
              <div className="mb-10 inline-flex items-center justify-center p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 luxury-shadow">
                <AppLogoDisplay size={80} />
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-black text-emerald-950 mb-6 tracking-tighter leading-none">
                PHV <span className="text-emerald-600 italic">Generator</span>
              </h1>
              <p className="text-gray-400 text-xs font-black italic mb-16 tracking-[1em] uppercase">6s Pixar Logic • Multimodal AI</p>
              <div className="bg-white luxury-border luxury-shadow p-12 md:p-20 rounded-[4rem] relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 p-10 opacity-5"><Sparkles size={160} className="text-emerald-600" /></div>
                <div className="space-y-16">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-4">
                      <label className="text-[11px] font-black uppercase text-emerald-800/40 tracking-[0.4em]">Phân tích Video Link</label>
                      <div className="flex gap-4 opacity-40"><Youtube size={18} /><LinkIcon size={18} /></div>
                    </div>
                    <textarea 
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-[3rem] p-10 text-emerald-950 text-xl focus:ring-8 focus:ring-emerald-500/5 transition-all min-h-[180px] placeholder:italic placeholder:text-gray-300 resize-none font-medium leading-relaxed"
                      placeholder="Dán link YouTube, TikTok hoặc FB để AI phân tích..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-4">
                      <label className="text-[11px] font-black uppercase text-emerald-800/40 tracking-[0.4em]">Hoặc Tải File Ảnh/Video</label>
                      <Upload size={18} className="opacity-40" />
                    </div>
                    <div onClick={() => fileInputRef.current?.click()} className="group cursor-pointer border-4 border-dashed border-emerald-50 bg-emerald-50/10 rounded-[3rem] p-16 text-center hover:bg-emerald-50/30 hover:border-emerald-200 transition-all duration-500">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple hidden accept="image/*,video/*" />
                      <div className="flex flex-col items-center gap-6">
                        <div className="p-6 bg-white rounded-3xl shadow-xl group-hover:scale-110 transition-transform"><Upload size={40} className="text-emerald-600" /></div>
                        <p className="text-emerald-950 font-black italic text-xl uppercase tracking-tight">Kéo thả hoặc Click để tải lên</p>
                      </div>
                    </div>
                    {files.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
                        {files.map((f, i) => (
                          <div key={i} className="relative group bg-white p-4 rounded-3xl border border-emerald-50 luxury-shadow animate-fade">
                            <button onClick={() => removeFile(i)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 opacity-100 z-10 hover:scale-125 transition-transform shadow-xl"><X size={14}/></button>
                            {f.mimeType.startsWith('image/') ? (
                              <img src={`data:${f.mimeType};base64,${f.data}`} className="w-full aspect-square object-cover rounded-2xl" alt="Preview" />
                            ) : (
                              <div className="w-full aspect-square bg-emerald-950 rounded-2xl flex items-center justify-center"><FileVideo size={40} className="text-emerald-400" /></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8">
                    <button onClick={handleProcess} disabled={(!inputText && files.length === 0) || !isApiKeyDetected} className="btn-luxury flex-[4] text-white font-black px-12 py-8 rounded-[2.5rem] text-[15px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl">
                      <Sparkles size={28} className="animate-pulse" /> Tạo kịch bản 6s Pixar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : step !== 'completed' && step !== 'error' ? (
            <div className="max-w-xl mx-auto mt-32 text-center animate-fade">
              <RefreshCw size={100} className="text-emerald-600 animate-spin-slow mx-auto mb-16 opacity-30" />
              <h3 className="text-4xl font-serif font-black text-emerald-900 mb-6 italic">Sáng tạo kịch bản chuyên sâu...</h3>
              <div className="mt-16 bg-white luxury-border luxury-shadow p-10 rounded-[4rem]"><StepIndicator currentStep={step} /></div>
            </div>
          ) : result ? (
            <div className="flex flex-col lg:flex-row gap-16 mt-12 max-w-[1700px] mx-auto px-10 animate-fade">
              <div className="flex-1 space-y-20 pb-60">
                <div className="bg-emerald-50/40 p-14 rounded-[4rem] luxury-border luxury-shadow relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-5"><Globe size={180} className="text-emerald-900" /></div>
                   <h3 className="text-xl font-black text-emerald-900 uppercase tracking-widest mb-8 flex items-center gap-4"><FileText size={24}/> Tóm tắt phân tích video</h3>
                   <p className="text-emerald-950 font-medium leading-relaxed text-2xl italic mb-10">{result.summary}</p>
                   <div className="flex flex-wrap gap-6">
                      <div className="bg-white px-8 py-5 rounded-[2rem] border border-emerald-100 flex items-center gap-4 luxury-shadow">
                         <Clock size={20} className="text-emerald-600" />
                         <span className="text-[13px] font-black uppercase text-emerald-950 tracking-[0.2em]">Cấu trúc: 6s / Scene</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-20">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-10">
                    <h2 className="text-5xl font-serif font-black text-emerald-950 italic">Storyboard Pixar (6s)</h2>
                    <button onClick={() => setStep('idle')} className="bg-white border luxury-border px-10 py-4 rounded-2xl text-emerald-800 font-black uppercase text-[11px] tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-3"><RefreshCw size={18} /> Phân tích video khác</button>
                  </div>
                  {result.scenes.map((scene) => (
                    <div key={scene.id} className="bg-white luxury-border luxury-shadow rounded-[4rem] overflow-hidden group hover:-translate-y-2 transition-all duration-700">
                      <div className="p-12 md:p-20 space-y-12">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-10">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-800 text-white flex items-center justify-center font-serif text-4xl font-black italic shadow-2xl group-hover:rotate-12 transition-transform">{scene.id}</div>
                            <h4 className="text-3xl font-serif font-black text-emerald-950 italic tracking-tight">{scene.visual}</h4>
                          </div>
                          <div className="bg-amber-50 text-amber-800 px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-[0.3em] border border-amber-100 flex items-center gap-3"><Clock size={16} /> 6 Seconds</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                          <div className="space-y-8">
                            <span className="text-[14px] font-black uppercase tracking-[0.3em] text-emerald-800 flex items-center gap-4"><ImageIcon size={22} /> Prompt Hình Ảnh</span>
                            <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 relative group/p min-h-[160px] luxury-shadow">
                              <p className="text-[15px] text-emerald-950 font-mono italic leading-relaxed">{scene.image_generation_prompt}</p>
                              <button onClick={() => copyToClipboard(scene.image_generation_prompt, `ip-${scene.id}`)} className="absolute top-6 right-6 opacity-0 group-hover/p:opacity-100 transition-opacity p-2 bg-white rounded-lg shadow-sm"><Copy size={18} className="text-emerald-600" /></button>
                            </div>
                          </div>
                          <div className="space-y-8">
                            <span className="text-[14px] font-black uppercase tracking-[0.3em] text-amber-700 flex items-center gap-4"><MonitorPlay size={22} /> Video Motion (6s)</span>
                            <div className="bg-amber-50/20 p-10 rounded-[2.5rem] border border-amber-100 relative group/v min-h-[160px] luxury-shadow">
                              <p className="text-[15px] text-emerald-950 font-black italic leading-relaxed">{scene.cinematic_video_prompt}</p>
                              <button onClick={() => copyToClipboard(scene.cinematic_video_prompt, `v-${scene.id}`)} className="absolute top-6 right-6 opacity-0 group-hover/v:opacity-100 transition-opacity p-2 bg-white rounded-lg shadow-sm"><Copy size={18} className="text-amber-600" /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="hidden lg:block w-80 space-y-8 animate-fade">
                <div className="bg-white luxury-border luxury-shadow p-6 rounded-3xl space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest text-emerald-800 border-b pb-4 flex items-center gap-3"><Zap size={20} className="text-amber-500" /> Tài trợ / Ads</h3>
                  <div className="space-y-6">
                    {ads.map(ad => (
                      <a key={ad.id} href={ad.link} target="_blank" rel="noopener noreferrer" className="block group">
                        <div className="relative rounded-2xl overflow-hidden mb-3 aspect-video luxury-border luxury-shadow">
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4"><span className="text-white text-xs font-bold uppercase tracking-wider">{ad.title}</span></div>
                        </div>
                      </a>
                    ))}
                    {ads.length === 0 && <p className="text-gray-400 text-xs italic">Chưa có quảng cáo...</p>}
                  </div>
                </div>
                <div className="bg-emerald-50 luxury-border p-6 rounded-3xl">
                  <p className="text-emerald-700/70 text-[10px] leading-relaxed italic font-bold uppercase tracking-widest text-center">{COPYRIGHT_INFO}</p>
                </div>
              </aside>
            </div>
          ) : null
        )}
      </main>

      <footer className="py-32 px-16 border-t border-gray-100 bg-white text-center">
        <div className="mb-12 flex justify-center grayscale hover:grayscale-0 transition-all duration-700"><AppLogoDisplay size={64} /></div>
        <h4 className="text-5xl font-serif font-black italic text-emerald-950 mb-6">PHV Generator Tool</h4>
        <p className="text-[11px] text-gray-400 font-black uppercase tracking-[1.5em] italic mb-16 leading-none">Luxury Multimodal System</p>
        <div className="flex justify-center gap-16 text-emerald-900/50 mb-20">
           <a href="mailto:tonyhoaivu@gmail.com" className="flex items-center gap-3 text-[12px] font-black tracking-widest uppercase hover:text-emerald-600 transition-colors"><Mail size={20}/> Email</a>
           <a href="tel:0927099940" className="flex items-center gap-3 text-[12px] font-black tracking-widest uppercase hover:text-emerald-600 transition-colors"><Phone size={20}/> 0927099940</a>
        </div>
        <p className="text-[12px] text-gray-300 uppercase font-black tracking-[0.8em] italic pt-16 border-t border-gray-50">{COPYRIGHT_INFO}</p>
      </footer>
    </div>
  );
};

export default App;
