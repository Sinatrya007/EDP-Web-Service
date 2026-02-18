
import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, ShieldCheck, MapPin, Search, Download, 
  Navigation, Calendar, Filter, User, ArrowLeft 
} from 'lucide-react';
import { FreelanceActivityLog } from '../types';
import { Link } from 'react-router-dom';

const PartnershipAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<FreelanceActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('kawitan_freelance_logs');
      if (saved) setLogs(JSON.parse(saved).reverse());
    };
    load();
    const int = setInterval(load, 5000);
    return () => clearInterval(int);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.freelanceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.referralMemberName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const handleExport = () => {
    if (logs.length === 0) return;
    const headers = ["ID", "Nama Mitra", "Aksi", "Unit/Plat", "Waktu", "Lat Mitra", "Lng Mitra", "Staff Otoritas"];
    const rows = logs.map(l => [
      l.id, l.freelanceName, l.actionType, l.vehiclePlate || '-', 
      new Date(l.freelanceTime).toLocaleString(),
      l.freelanceLocation.lat, l.freelanceLocation.lng,
      l.referralMemberName
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Audit_Kemitraan_EDP.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
            <History className="text-blue-700 mr-4" size={32} />
            Audit Aktivitas Kemitraan
          </h1>
          <p className="text-slate-500 font-bold mt-1">Laporan Jejak Digital Mitra & Otoritas Dual-Location</p>
        </div>
        <button onClick={handleExport} className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] shadow-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center space-x-3">
          <Download size={18} /> <span>Export Log CSV</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            placeholder="Cari Nama Mitra, Plat Nomor, atau Staff Kantor..." 
            className="w-full bg-slate-50 p-5 pl-16 rounded-[2rem] border-2 border-transparent focus:border-blue-700 focus:bg-white outline-none font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden lg:flex items-center space-x-3 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-[2rem] border border-emerald-100 font-black text-[10px] uppercase tracking-widest">
           <ShieldCheck size={16} />
           <span>{logs.length} Log Tercatat</span>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-900 text-amber-400">
                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Mitra Lapangan</th>
                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Aksi / Otoritas</th>
                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Objek Unit</th>
                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-center">Lokasi Mitra (GPS)</th>
                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-center">Lokasi Staff (Otor)</th>
                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Pemberi Izin</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredLogs.length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-8 py-24 text-center text-slate-400 font-bold italic">Tidak ditemukan riwayat audit yang sesuai.</td>
                    </tr>
                 ) : (
                    filteredLogs.map(log => (
                       <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-8 py-6">
                             <p className="font-black text-sm text-slate-900">{log.freelanceName}</p>
                             <p className="text-[9px] font-bold text-slate-400 mt-1 flex items-center"><Calendar size={10} className="mr-1" /> {new Date(log.freelanceTime).toLocaleString('id-ID')}</p>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                                log.actionType === 'LOGIN_AUTH' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                log.actionType === 'DOC_DOWNLOAD' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                             }`}>{log.actionType.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="px-8 py-6 font-black text-xs text-slate-600 uppercase tracking-tighter">{log.vehiclePlate || 'LOGIN SESSION'}</td>
                          <td className="px-8 py-6 text-center">
                             <a href={`https://maps.google.com?q=${log.freelanceLocation.lat},${log.freelanceLocation.lng}`} target="_blank" className="inline-flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl font-bold text-[10px] hover:bg-blue-600 hover:text-white transition-all">
                                <Navigation size={12} /> <span>CEK LOKASI</span>
                             </a>
                          </td>
                          <td className="px-8 py-6 text-center">
                             {log.approvalLocation ? (
                                <a href={`https://maps.google.com?q=${log.approvalLocation.lat},${log.approvalLocation.lng}`} target="_blank" className="inline-flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl font-bold text-[10px] hover:bg-emerald-600 hover:text-white transition-all">
                                   <MapPin size={12} /> <span>VERIFIKASI</span>
                                </a>
                             ) : (
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Otoritas Langsung</span>
                             )}
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-black text-xs text-slate-700">{log.referralMemberName}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">STAFF ID: {log.referralMemberId.split('-')[1] || 'OFFICE'}</p>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
      
      <div className="bg-amber-50 p-8 rounded-[3.5rem] border border-amber-100 flex items-start space-x-6">
         <div className="p-4 bg-white text-amber-600 rounded-2xl shadow-sm"><History size={24} /></div>
         <div>
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Informasi Keamanan Audit</p>
            <p className="text-xs font-bold text-amber-700 leading-relaxed uppercase opacity-80 italic">Halaman ini menyimpan seluruh jejak digital permintaan berkas oleh mitra freelance. Audit ini mencakup koordinat GPS ganda untuk memastikan akuntabilitas operasional antara mitra di lapangan dan staff pemberi otoritas di kantor.</p>
         </div>
      </div>
    </div>
  );
};

export default PartnershipAuditLog;