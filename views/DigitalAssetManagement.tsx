
import React, { useState, useEffect, useRef } from 'react';
import { 
  ImageIcon, Plus, Trash2, Download, Search, FileText, 
  Upload, CheckCircle2, X, Filter, LayoutGrid, List, MoreVertical,
  Briefcase, Loader2, Image as LucideImage, Clock, ShieldCheck,
  Type, Stamp, FileSignature, Layers
} from 'lucide-react';
import { User, DigitalAsset, UserRole } from '../types';

const ASSET_CATEGORIES = ['Logo Utama', 'Kop Surat', 'Stempel Kantor', 'Template Dokumen', 'Lainnya'];

const DigitalAssetManagement: React.FC<{ user: User }> = ({ user }) => {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'Logo Utama',
    data: '',
    type: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
    const interval = setInterval(loadAssets, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAssets = () => {
    const saved = localStorage.getItem('kawitan_digital_assets');
    if (saved) setAssets(JSON.parse(saved));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAsset(prev => ({
          ...prev,
          name: prev.name || file.name.split('.')[0],
          data: reader.result as string,
          type: file.type
        }));
        // Reset input value so the same file can be selected again if needed
        if (e.target) e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAsset = () => {
    if (!newAsset.name || !newAsset.data) {
      alert("Harap lengkapi nama aset dan pilih berkas.");
      return;
    }

    setIsUploading(true);
    // Simulate slight delay for UX
    setTimeout(() => {
      const asset: DigitalAsset = {
        id: `asset-${Date.now()}`,
        name: newAsset.name,
        category: newAsset.category,
        data: newAsset.data,
        type: newAsset.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.name
      };

      const mainCategories = ['Logo Utama', 'Kop Surat', 'Stempel Kantor'];
      let updated: DigitalAsset[];
      
      if (mainCategories.includes(asset.category)) {
        // If it's a main category, replace existing one
        updated = [asset, ...assets.filter(a => a.category !== asset.category)];
      } else {
        // If it's a general asset, add to list
        updated = [asset, ...assets];
      }

      setAssets(updated);
      localStorage.setItem('kawitan_digital_assets', JSON.stringify(updated));
      
      setIsUploading(false);
      setShowUploadModal(false);
      setNewAsset({ name: '', category: 'Logo Utama', data: '', type: '' });
      alert("Aset digital berhasil diperbarui.");
    }, 800);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm("Hapus aset digital ini secara permanen?")) {
      const updated = assets.filter(a => a.id !== id);
      setAssets(updated);
      localStorage.setItem('kawitan_digital_assets', JSON.stringify(updated));
    }
  };

  const openMainUpload = (category: string) => {
    // Critical fix: Reset data and type to clear previous state from modal
    setNewAsset({ name: category, category, data: '', type: '' });
    setShowUploadModal(true);
  };

  const getAssetByCategory = (category: string) => assets.find(a => a.category === category);

  const mainAssets = [
    { id: 'logo', title: 'Logo Utama', cat: 'Logo Utama', icon: LucideImage, desc: 'Logo resmi format PNG/SVG' },
    { id: 'kop', title: 'Kop Surat', cat: 'Kop Surat', icon: Type, desc: 'Header surat resmi kantor' },
    { id: 'stempel', title: 'Stempel Kantor', cat: 'Stempel Kantor', icon: Stamp, desc: 'Scan stempel basah/digital' },
  ];

  const otherAssets = assets.filter(a => 
    !['Logo Utama', 'Kop Surat', 'Stempel Kantor'].includes(a.category) &&
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden border-4 border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center space-x-4 mb-6">
               <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10"><ShieldCheck size={26} className="text-blue-400" /></div>
               <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Pusat Identitas Digital Korporat</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-4">Branding & Aset Digital.</h1>
            <p className="text-slate-400 font-bold text-lg max-w-2xl leading-relaxed">
              Kelola identitas visual utama dan dokumen template resmi perusahaan dalam satu kendali terpusat.
            </p>
          </div>
          <button 
            onClick={() => {
              setNewAsset({ name: '', category: 'Template Dokumen', data: '', type: '' });
              setShowUploadModal(true);
            }}
            className="bg-blue-700 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-800 transition-all flex items-center space-x-3 active:scale-95"
          >
            <Plus size={20} />
            <span>Unggah Berkas Baru</span>
          </button>
        </div>
        <Layers size={400} className="absolute -right-24 -bottom-24 opacity-5 transform rotate-12" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-4 px-6">
           <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center"><FileSignature size={20} /></div>
           <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-wider">I. Identitas Utama Perusahaan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mainAssets.map((slot) => {
            const asset = getAssetByCategory(slot.cat);
            return (
              <div key={slot.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col group transition-all hover:border-blue-200">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <slot.icon size={18} className="text-blue-700" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-900">{slot.title}</span>
                   </div>
                   {asset && (
                     <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">Tersedia</div>
                   )}
                </div>
                
                <div className="aspect-square bg-slate-50 relative flex items-center justify-center p-12 overflow-hidden">
                  {asset ? (
                    <img src={asset.data} className="max-w-full max-h-full object-contain drop-shadow-xl transition-transform group-hover:scale-105" alt={slot.title} />
                  ) : (
                    <div className="text-center space-y-4 opacity-40">
                       <slot.icon size={64} className="mx-auto text-slate-300" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slot.desc}</p>
                    </div>
                  )}
                </div>

                <div className="p-8 mt-auto">
                   {asset ? (
                     <div className="flex gap-3">
                        <button onClick={() => openMainUpload(slot.cat)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all">Ganti Aset</button>
                        <a href={asset.data} download={asset.name} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-700 border border-slate-100 transition-all">
                           <Download size={16} />
                        </a>
                     </div>
                   ) : (
                     <button onClick={() => openMainUpload(slot.cat)} className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all flex items-center justify-center space-x-2">
                        <Upload size={16} />
                        <span>Unggah {slot.title}</span>
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6">
           <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"><Layers size={20} /></div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-wider">II. Aset Pendukung Lainnya</h2>
           </div>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                placeholder="Cari aset tambahan..." 
                className="w-full bg-white pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-700 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {otherAssets.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
               <p className="text-slate-400 font-bold italic text-sm">Gunakan tombol di atas untuk menambah aset tambahan (Template, Foto Kantor, dll).</p>
            </div>
          ) : (
            otherAssets.map(asset => (
              <div key={asset.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden group hover:border-blue-200 transition-all flex flex-col">
                <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-8">
                  {asset.type.startsWith('image/') ? (
                    <img src={asset.data} className="max-w-full max-h-full object-contain" alt={asset.name} />
                  ) : (
                    <FileText size={64} className="text-slate-200" />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{asset.category}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight mb-6 truncate">{asset.name}</h3>
                  <div className="mt-auto flex items-center gap-3">
                     <a href={asset.data} download={asset.name} className="flex-1 bg-slate-50 text-slate-400 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center justify-center gap-2">
                        <Download size={14} /> <span>Unduh</span>
                     </a>
                     <button onClick={() => handleDeleteAsset(asset.id)} className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowUploadModal(false)} />
          {/* Change overflow-hidden to overflow-y-auto and max-h-[90vh] to allow internal scrolling of modal content */}
          <div className="relative bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar animate-in zoom-in-95">
             <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-blue-700 text-white sticky top-0 z-20">
                <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">Konfigurasi Aset Digital</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
             </div>

             <div className="p-10 space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Aset</label>
                   <select 
                    className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-700 outline-none transition-all appearance-none"
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                   >
                     {ASSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Label</label>
                   <input 
                    placeholder="Contoh: Logo Elkha 2024" 
                    className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-700 outline-none transition-all"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Berkas</label>
                   <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-700 transition-all group overflow-hidden relative"
                   >
                     {newAsset.data ? (
                        <div className="w-full h-full flex items-center justify-center p-6">
                           {newAsset.type.startsWith('image/') ? (
                             <img src={newAsset.data} className="max-w-full max-h-full object-contain" />
                           ) : (
                             <FileText size={48} className="text-slate-300" />
                           )}
                        </div>
                     ) : (
                       <>
                         <Upload size={32} className="text-slate-300 group-hover:text-blue-700 mb-2" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik untuk pilih berkas</span>
                       </>
                     )}
                     <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
                   </div>
                </div>
             </div>

             <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4 sticky bottom-0 z-20">
                <button onClick={() => setShowUploadModal(false)} className="px-8 py-4 bg-white text-slate-400 font-black text-[10px] uppercase rounded-xl border border-slate-200">Batal</button>
                <button 
                  disabled={isUploading}
                  onClick={handleSaveAsset}
                  className="px-12 py-4 bg-blue-700 text-white font-black text-[10px] uppercase rounded-xl shadow-xl hover:bg-blue-800 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>Simpan Perubahan</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalAssetManagement;
