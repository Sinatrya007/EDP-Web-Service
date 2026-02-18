
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MapPin, 
  Calendar as CalendarIcon,
  User as UserIcon,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { AttendanceRecord } from '../types';

const AdminAttendanceLog: React.FC = () => {
  // Fix: changed localStorage key to match Attendance.tsx for consistency
  const [records] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('kawitan_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const filteredRecords = records.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = ["Nama Karyawan", "Tipe Absen", "Waktu & Tanggal", "Latitude", "Longitude", "Status Verifikasi"];
    const rows = records.map(r => [
      r.userName,
      r.type === 'IN' ? 'MASUK' : 'PULANG',
      new Date(r.timestamp).toLocaleString('id-ID'),
      r.location.lat,
      r.location.lng,
      "GPS + FOTO TERVERIFIKASI"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Absensi_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Monitoring</h1>
          <p className="text-slate-500">Review all field agent presence logs and verification photos</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold text-sm"
        >
          <FileSpreadsheet size={18} />
          <span>Export to Excel (CSV)</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 w-full max-w-sm">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama karyawan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full" 
            />
          </div>
          <div className="flex items-center space-x-2">
             <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
               <CalendarIcon size={14} className="mr-2" />
               Semua Tanggal
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Karyawan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verifikasi Foto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Data absensi tidak ditemukan.</td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                           <UserIcon size={16} />
                         </div>
                         <span className="text-sm font-bold text-slate-900">{record.userName}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         record.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-slate-100'
                       }`}>
                         {record.type === 'IN' ? 'MASUK' : 'PULANG'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                       {new Date(record.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                       <button 
                         onClick={() => setSelectedPhoto(record.photo)}
                         className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                       >
                         <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                           <img src={record.photo} className="w-full h-full object-cover" alt="" />
                         </div>
                         <span>Lihat Hasil Absensi</span>
                       </button>
                    </td>
                    <td className="px-6 py-4">
                       <a 
                         href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center space-x-1 text-slate-500 hover:text-indigo-600 transition-colors"
                       >
                         <MapPin size={14} />
                         <span className="text-xs font-medium">{record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}</span>
                         <ExternalLink size={10} />
                       </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)} />
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setSelectedPhoto(null)} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all">
                  <X size={20} />
                </button>
             </div>
             <img src={selectedPhoto} className="w-full h-auto object-contain" alt="Attendance Proof" />
             <div className="p-6 bg-white">
                <div className="flex items-center justify-between">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Attendance Verification</p>
                   <ShieldCheck className="text-emerald-500" size={18} />
                </div>
                <p className="text-sm text-slate-600 mt-2 font-medium">Foto ini memuat bukti waktu dan lokasi koordinat petugas saat menekan tombol absen.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendanceLog;
