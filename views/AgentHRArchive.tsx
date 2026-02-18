
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  User as UserIcon, 
  Calendar, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileBadge,
  Download,
  Printer,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { User } from '../types';
import { useTranslation } from '../App';

interface AgentHRArchiveProps {
  users: User[];
}

const AgentHRArchive: React.FC<AgentHRArchiveProps> = ({ users }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const agent = users.find(u => u.id === id);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-slate-500 font-bold">Data petugas tidak ditemukan.</p>
        <button onClick={() => navigate('/agents')} className="text-blue-600 font-bold flex items-center">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/agents')}
          className="group flex items-center space-x-2 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:border-blue-200 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="font-black text-xs uppercase tracking-widest">Kembali</span>
        </button>
        
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-white text-slate-600 px-6 py-3 rounded-2xl border border-slate-100 shadow-sm font-bold text-xs hover:bg-slate-50 transition-all">
            <Printer size={18} />
            <span>Print Arsip</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-100 font-bold text-xs hover:bg-blue-700 transition-all">
            <Download size={18} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Profile */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-blue-900/5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-blue-600/5"></div>
            
            <div className="relative z-10">
              <img 
                src={agent.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + agent.username} 
                className="w-32 h-32 rounded-[2.25rem] border-4 border-white shadow-2xl mx-auto bg-white mb-6"
              />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{agent.name}</h2>
              <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.25em] mt-2 mb-8">@{agent.username}</p>
              
              <div className="flex justify-center space-x-3">
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center space-x-2">
                   <ShieldCheck size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Terverifikasi</span>
                </div>
                <div className={`px-4 py-2 rounded-xl border flex items-center space-x-2 ${agent.status === 'active' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                   <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">{agent.status || 'Active'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Briefcase size={120} />
             </div>
             <div className="relative z-10">
               <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6">Informasi Kepegawaian</h3>
               <div className="space-y-6">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                       <Calendar size={20} className="text-blue-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Bergabung</p>
                       <p className="text-[15px] font-bold">{agent.joinDate || '2023-01-01'}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                       <FileBadge size={20} className="text-blue-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pegawai</p>
                       <p className="text-[15px] font-bold">DT-{agent.id.toUpperCase().split('-')[1] || 'AGENT-01'}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                       <Phone size={20} className="text-blue-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Terdaftar</p>
                       <p className="text-[15px] font-bold">{agent.phone || 'N/A'}</p>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Documents */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-blue-900/5 relative">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center space-x-4">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-[1.5rem]">
                     <CreditCard size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Kartu Tanda Penduduk (KTP)</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Identitas Nasional Terverifikasi</p>
                  </div>
               </div>
               <button className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] flex items-center hover:underline">
                  <ExternalLink size={14} className="mr-2" /> Lihat Fullscreen
               </button>
            </div>

            <div className="aspect-[16/10] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
               {agent.ktpPhoto ? (
                 <img src={agent.ktpPhoto} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="KTP Photo" />
               ) : (
                 <div className="text-center">
                    <CreditCard size={64} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic tracking-wide">Belum ada lampiran foto KTP dalam arsip digital.</p>
                 </div>
               )}
            </div>
            
            <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start space-x-4">
               <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
                  <ShieldCheck size={18} />
               </div>
               <p className="text-sm text-blue-900 font-semibold leading-relaxed">
                  Arsip dokumen KTP ini bersifat rahasia dan hanya dapat diakses oleh administrator HRD. 
                  Dokumen ini disimpan untuk keperluan kepatuhan hukum dan verifikasi data lapangan.
               </p>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-blue-900/5">
             <div className="flex items-center space-x-4 mb-8">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-[1.5rem]">
                   <UserIcon size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Catatan Personalia</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Riwayat Kepegawaian Internal</p>
                </div>
             </div>

             <div className="divide-y divide-slate-50">
                <div className="py-5 flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-500">Status Akun Login</span>
                   <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Active Access</span>
                </div>
                <div className="py-5 flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-500">Jabatan</span>
                   <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Field Recovery Agent</span>
                </div>
                <div className="py-5 flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-500">Divisi</span>
                   <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Operational Field</span>
                </div>
                <div className="py-5 flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-500">Lokasi Penempatan</span>
                   <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Jakarta Headquarters</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHRArchive;
