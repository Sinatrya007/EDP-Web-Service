
import React, { useState, useRef } from 'react';
import { 
  UserPlus, X, Save, Eye, User as UserIcon, Phone, MapPin, Briefcase, AtSign, Lock, ShieldAlert, Clock, Trash2, AlertTriangle, Edit, PenTool, Image as ImageIcon
} from 'lucide-react';
import { User, UserRole } from '../types';

const AgentsManagement: React.FC<{ users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>, currentUser: User }> = ({ users, setUsers, currentUser }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<User | null>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);
  const canEdit = currentUser.role === UserRole.ADMIN;

  const [formData, setFormData] = useState({ 
    name: '', phone: '', role: UserRole.AGENT, address: '', username: '', password: '', signature: ''
  });

  const handleAction = (isNew: boolean) => {
    if (!canEdit) return;
    if (!formData.name || !formData.phone || !formData.username || !formData.password || !formData.address) { 
      alert("Harap lengkapi seluruh bidang data personel."); 
      return; 
    }

    if ((formData.role === UserRole.HEAD || formData.role === UserRole.AGENT) && !formData.signature) {
      alert("Khusus Direktur Utama dan Petugas Lapangan wajib melampirkan scan tanda tangan.");
      return;
    }
    
    if (isNew) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...formData,
        status: 'waiting_auth',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      setShowAddModal(false);
      alert("Permintaan penambahan personel telah dikirim ke Direktur.");
    } else if (showEditModal) {
      const updated = users.map(u => {
        if (u.id === showEditModal.id) {
          return {
            ...u,
            status: 'pending_edit' as any,
            pendingEdit: { ...formData }
          };
        }
        return u;
      });
      setUsers(updated);
      setShowEditModal(null);
      alert("Permintaan perubahan data personel telah dikirim ke Direktur.");
    }
    setFormData({ name: '', phone: '', role: UserRole.AGENT, address: '', username: '', password: '', signature: '' });
  };

  const handleDeleteRequest = (user: User) => {
    if (!canEdit) return;
    if (window.confirm(`Ajukan penghapusan akun ${user.name}? Memerlukan persetujuan Direktur.`)) {
      const updated = users.map(u => u.id === user.id ? { ...u, status: 'pending_delete' as any, pendingDelete: true } : u);
      setUsers(updated);
      alert("Permintaan penghapusan personel telah dikirim ke Direktur.");
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, signature: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const internalUsers = users.filter(u => u.role !== UserRole.FREELANCE);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Personel</h1>
          <p className="text-slate-500 font-bold mt-1">Kelola data Anggota Kantor & Petugas Lapangan</p>
        </div>
        {canEdit && (
          <button onClick={() => { setFormData({ name: '', phone: '', role: UserRole.AGENT, address: '', username: '', password: '', signature: '' }); setShowAddModal(true); }} className="bg-blue-700 text-white px-8 py-4 rounded-3xl shadow-xl shadow-blue-100 font-black text-xs uppercase tracking-widest active:scale-95 flex items-center space-x-3">
            <UserPlus size={20} />
            <span>Tambah Anggota</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {internalUsers.map(person => {
          const isPending = person.status === 'waiting_auth' || person.status === 'pending_edit' || person.status === 'pending_delete';

          return (
            <div key={person.id} className={`bg-white rounded-[3rem] border p-10 group transition-all relative shadow-xl ${isPending ? 'border-amber-200 ring-4 ring-amber-50' : 'border-slate-100 hover:border-blue-200'}`}>
               
               {person.status === 'waiting_auth' && (
                 <div className="absolute top-6 right-6 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">Pendaftaran Baru</div>
               )}
               {person.status === 'pending_edit' && (
                 <div className="absolute top-6 right-6 bg-amber-600 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">Menunggu Review Edit</div>
               )}
               {person.status === 'pending_delete' && (
                 <div className="absolute top-6 right-6 bg-blue-700 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">Menunggu Konfirmasi Hapus</div>
               )}

               <div className="flex items-center space-x-5 mb-8">
                  <div className="w-16 h-16 rounded-[1.75rem] bg-slate-50 border flex items-center justify-center overflow-hidden shadow-inner">
                     <img src={person.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900 leading-tight truncate">{person.name}</h3>
                     <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest mt-1 block">{person.role}</span>
                  </div>
               </div>
               
               <div className="space-y-4 mb-10">
                  <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                     <Phone size={14} className="mr-3 text-blue-700" /> {person.phone}
                  </div>
                  <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                     <MapPin size={14} className="mr-3 text-blue-700" /> {person.address}
                  </div>
                  {(person.role === UserRole.HEAD || person.role === UserRole.AGENT) && (
                    <div className="flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 p-3 rounded-2xl border border-emerald-100 uppercase tracking-widest">
                       <PenTool size={14} className="mr-3" /> Tanda Tangan Terlampir
                    </div>
                  )}
               </div>

               <div className="flex space-x-3">
                 {canEdit ? (
                    <>
                      <button 
                        onClick={() => {
                          if (isPending) return;
                          setShowEditModal(person);
                          const displayData = person.pendingEdit || person;
                          setFormData({ 
                            name: displayData.name, phone: displayData.phone || '', role: displayData.role, 
                            address: displayData.address || '', username: displayData.username, password: displayData.password || '',
                            signature: displayData.signature || ''
                          });
                        }}
                        className={`flex-1 py-5 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center shadow-lg ${isPending ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-slate-900 text-white hover:bg-blue-700'}`}
                        disabled={isPending}
                      >
                         <Edit size={16} className="mr-2" /> Detail / Edit
                      </button>
                      <button 
                        disabled={isPending}
                        onClick={() => handleDeleteRequest(person)}
                        className={`p-5 rounded-2xl transition-all border ${isPending ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-red-50 hover:text-red-700'}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                 ) : (
                    <div className="w-full py-5 bg-slate-50 text-slate-300 font-black text-[11px] uppercase tracking-widest text-center rounded-2xl border border-slate-100">Hanya Admin yang dapat mengelola</div>
                 )}
               </div>
            </div>
          );
        })}
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => { setShowAddModal(false); setShowEditModal(null); }} />
           <div className="relative bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between shrink-0">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">{showAddModal ? 'Daftarkan Personel Baru' : 'Edit Data Personel'}</h3>
                 <button onClick={() => { setShowAddModal(false); setShowEditModal(null); }} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={28} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">1. Nama Lengkap</label>
                          <input className="w-full bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 font-bold focus:border-blue-700 outline-none transition-all" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="Sesuai KTP" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">2. No. WhatsApp</label>
                          <input className="w-full bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 font-bold focus:border-blue-700 outline-none transition-all" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="0812..." />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">3. Jabatan Kantor</label>
                          <select className="w-full bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 font-bold focus:border-blue-700 outline-none appearance-none transition-all" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value as UserRole})}>
                             <option value={UserRole.AGENT}>Petugas Lapangan</option>
                             <option value={UserRole.ADMIN}>Admin Kantor</option>
                             <option value={UserRole.HEAD}>Direktur Utama</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">4. Alamat Domisili</label>
                          <input className="w-full bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 font-bold focus:border-blue-700 outline-none transition-all" value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} placeholder="Alamat Lengkap" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">5. Username</label>
                             <input className="w-full bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 font-bold focus:border-blue-700 outline-none transition-all" value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} placeholder="Username" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">6. Password</label>
                             <input type="text" className="w-full bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 font-bold focus:border-blue-700 outline-none transition-all" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} placeholder="********" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {(formData.role === UserRole.HEAD || formData.role === UserRole.AGENT) && (
                    <div className="space-y-4">
                       <div className="flex items-center space-x-3 mb-2">
                          <PenTool size={20} className="text-blue-700" />
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">Lampiran Tanda Tangan Digital</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                          <div 
                             onClick={() => sigInputRef.current?.click()}
                             className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-700 transition-all group aspect-video overflow-hidden relative"
                          >
                             {formData.signature ? (
                                <img src={formData.signature} className="w-full h-full object-contain" alt="Signature" />
                             ) : (
                                <>
                                   <ImageIcon size={32} className="text-slate-300 group-hover:text-blue-700 mb-2" />
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unggah Scan Tanda Tangan</span>
                                   <p className="text-[8px] text-slate-300 mt-2 text-center uppercase">Gunakan latar belakang putih bersih & tinta hitam/biru</p>
                                </>
                             )}
                             <input ref={sigInputRef} type="file" hidden accept="image/*" onChange={handleSignatureUpload} />
                          </div>
                          <div className="space-y-4">
                             <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                                <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">Tanda tangan ini akan digunakan secara otomatis pada penerbitan Surat Kuasa (SK) penugasan dan dokumen resmi perusahaan lainnya.</p>
                             </div>
                             <div className="flex items-center space-x-3 p-4 border border-slate-100 rounded-2xl italic text-[10px] text-slate-400 font-bold">
                                <ShieldAlert size={14} />
                                <span>Hanya file gambar (JPG/PNG) yang diperbolehkan.</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-start space-x-4">
                    <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                    <p className="text-xs text-amber-900 font-bold leading-relaxed uppercase">Setiap perubahan data personel wajib melalui peninjauan Direktur Utama sebelum diaktifkan dalam sistem operasional.</p>
                 </div>
              </div>

              <div className="p-10 border-t border-slate-50 shrink-0 bg-slate-50/50 flex justify-end">
                 <button 
                   onClick={() => handleAction(!!showAddModal)}
                   className="bg-blue-700 text-white px-16 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95 flex items-center space-x-3"
                 >
                    <Save size={20} />
                    <span>Kirim Pengajuan</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AgentsManagement;