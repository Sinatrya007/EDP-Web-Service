
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Car, CheckCircle2, ChevronRight, AlertCircle, User as UserIcon, X, 
  ImageIcon, Loader2, FileCheck, FileText, Play, Briefcase, MapPin, 
  Camera, History, Send, XCircle, Clock, Activity, Power, TrendingUp,
  ClipboardList, MessageSquare, Download, FileArchive, Printer
} from 'lucide-react';
import { User, VehicleRecoveryTask, TaskStatus, TaskProgressLog, AttendanceRecord, DigitalAsset, UserRole } from '../types';
import { Link } from 'react-router-dom';

// Declare external libraries
declare const JSZip: any;
declare const jspdf: any;

interface AgentDashboardProps {
  user: User;
}

const StatMini = ({ label, value, color, textColor, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${color} ${textColor}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user }) => {
  const [activeTasks, setActiveTasks] = useState<VehicleRecoveryTask[]>([]);
  const [reportingTask, setReportingTask] = useState<VehicleRecoveryTask | null>(null);
  const [progressTask, setProgressTask] = useState<VehicleRecoveryTask | null>(null);
  const [isZipping, setIsZipping] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);
  
  const [reportData, setReportData] = useState({ type: 'UNIT_HANDOVER' as 'UNIT_HANDOVER' | 'SETTLEMENT', chronology: '', photo: '' });
  const [visitData, setVisitData] = useState({ description: '', photo: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visitPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    const int = setInterval(loadData, 5000);
    return () => clearInterval(int);
  }, [user.id]);

  const loadData = () => {
    const savedTasks = localStorage.getItem('kawitan_tasks');
    if (savedTasks) {
      const all: VehicleRecoveryTask[] = JSON.parse(savedTasks);
      setActiveTasks(all.filter(t => t.assignedTo === user.id && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED));
    }
  };

  const agentStats = useMemo(() => {
    const total = activeTasks.length;
    const pending = activeTasks.filter(t => t.status === TaskStatus.ASSIGNED).length;
    const processing = activeTasks.filter(t => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ACCEPTED).length;
    
    const savedTasks = localStorage.getItem('kawitan_tasks');
    const all: VehicleRecoveryTask[] = savedTasks ? JSON.parse(savedTasks) : [];
    const completed = all.filter(t => t.assignedTo === user.id && t.status === TaskStatus.COMPLETED).length;

    return { total, pending, processing, completed };
  }, [activeTasks, user.id]);

  const updateStatus = (taskId: string, status: TaskStatus) => {
    const all: VehicleRecoveryTask[] = JSON.parse(localStorage.getItem('kawitan_tasks') || '[]');
    const updated = all.map(t => t.id === taskId ? { ...t, status } : t);
    localStorage.setItem('kawitan_tasks', JSON.stringify(updated));
    loadData();
  };

  const getImageType = (dataUrl: string): string => {
    if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG';
    if (dataUrl.includes('image/webp')) return 'WEBP';
    return 'PNG';
  };

  const handleAction = (task: VehicleRecoveryTask, action: 'ACCEPT' | 'REJECT' | 'START' | 'COMPLETE' | 'PROGRESS') => {
    if (action === 'ACCEPT') updateStatus(task.id, TaskStatus.ACCEPTED);
    if (action === 'START') updateStatus(task.id, TaskStatus.IN_PROGRESS);
    if (action === 'REJECT') {
       if(window.confirm("Tolak tugas ini? Unit akan muncul kembali di daftar admin.")) {
          updateStatus(task.id, TaskStatus.REJECTED_BY_AGENT);
       }
    }
    if (action === 'COMPLETE') setReportingTask(task);
    if (action === 'PROGRESS') setProgressTask(task);
  };

  const generateAssignmentLetter = async (task: VehicleRecoveryTask) => {
    setIsGeneratingPDF(task.id);
    
    try {
      const jsPDF = (window as any).jspdf.jsPDF;
      const doc = new jsPDF();
      
      const savedAssets = localStorage.getItem('kawitan_digital_assets');
      const assets: DigitalAsset[] = savedAssets ? JSON.parse(savedAssets) : [];
      const kopSurat = assets.find(a => a.category === 'Kop Surat');
      
      const savedUsers = localStorage.getItem('kawitan_users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      const latestUserData = users.find(u => u.id === user.id) || user;
      const director = users.find(u => u.role === UserRole.HEAD);

      if (kopSurat) {
        doc.addImage(kopSurat.data, getImageType(kopSurat.data), 10, 10, 190, 45);
      } else {
        doc.setFontSize(18);
        doc.text("ELKHA DENA PERKASA", 105, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text("Sistem Manajemen Penagihan & Penarikan Unit", 105, 32, { align: 'center' });
      }

      const topMargin = kopSurat ? 65 : 45;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SURAT TUGAS PENANGANAN UNIT", 105, topMargin, { align: 'center' });
      doc.line(60, topMargin + 2, 150, topMargin + 2);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Nomor: ST/${task.leasingName.toUpperCase()}/${task.plateNumber}/${new Date().getFullYear()}`, 105, topMargin + 8, { align: 'center' });

      doc.setFontSize(11);
      const content = `Yang bertanda tangan di bawah ini, Direktur Utama Elkha Dena Perkasa, memberikan tugas sepenuhnya kepada petugas lapangan yang namanya tercantum di bawah ini:`;
      const splitContent = doc.splitTextToSize(content, 170);
      doc.text(splitContent, 20, topMargin + 25);

      doc.setFont("helvetica", "bold");
      doc.text("Penerima Kuasa:", 20, topMargin + 45);
      doc.setFont("helvetica", "normal");
      doc.text(`Nama : ${latestUserData.name}`, 30, topMargin + 52);
      doc.text(`Jabatan : ${latestUserData.role}`, 30, topMargin + 58);
      doc.text(`WhatsApp : ${latestUserData.phone || '-'}`, 30, topMargin + 64);

      doc.setFont("helvetica", "bold");
      doc.text("Objek Penugasan (Unit Kendaraan):", 20, topMargin + 78);
      
      const vehicleTableY = topMargin + 85;
      doc.setFont("helvetica", "normal");
      doc.rect(20, vehicleTableY, 170, 45);
      
      doc.text(`Klien / Leasing : ${task.leasingName}`, 25, vehicleTableY + 10);
      doc.text(`No. Polisi : ${task.platePrefix} ${task.plateNumber} ${task.plateSuffix}`, 25, vehicleTableY + 18);
      doc.text(`Merek / Tipe : ${task.vehicleBrand} ${task.vehicleModel}`, 25, vehicleTableY + 26);
      doc.text(`No. Rangka : ${task.chassisNumber || '-'}`, 25, vehicleTableY + 34);
      doc.text(`No. Mesin : ${task.engineNumber || '-'}`, 25, vehicleTableY + 42);

      doc.setFontSize(10);
      const footerText = "Petugas diwajibkan melakukan koordinasi dengan pihak kepolisian setempat jika diperlukan dan menjaga kode etik perusahaan dalam menjalankan tugas penagihan/penarikan unit. Surat tugas ini berlaku sejak tanggal diterbitkan.";
      const splitFooter = doc.splitTextToSize(footerText, 170);
      doc.text(splitFooter, 20, vehicleTableY + 60);

      const sigY = vehicleTableY + 90;
      const issuanceLocation = director?.address || latestUserData.address || 'Indonesia';
      doc.text(`Dikeluarkan di: ${issuanceLocation}`, 130, sigY - 10);
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 130, sigY - 4);

      doc.setFont("helvetica", "bold");
      doc.text("Pemberi Kuasa,", 20, sigY);
      doc.text("Direktur Utama", 20, sigY + 6);
      
      if (director?.signature) {
        doc.addImage(director.signature, getImageType(director.signature), 20, sigY + 10, 40, 20);
      }
      doc.text(`( ${director?.name || 'Direktur Utama'} )`, 20, sigY + 40);

      doc.text("Penerima Kuasa,", 130, sigY);
      doc.text("Petugas Lapangan", 130, sigY + 6);
      
      if (latestUserData.signature) {
        doc.addImage(latestUserData.signature, getImageType(latestUserData.signature), 130, sigY + 10, 40, 20);
      }
      doc.text(`( ${latestUserData.name} )`, 130, sigY + 40);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Dokumen ini dihasilkan secara otomatis oleh EDP Web Service 2.0", 105, 285, { align: 'center' });

      doc.save(`Surat_Tugas_${task.plateNumber}_${new Date().getTime()}.pdf`);
      alert("Surat tugas berhasil dibuat dalam format PDF.");
    } catch (err: any) {
      console.error(err);
      alert("Gagal membuat PDF: " + err.message);
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  const handleDownloadAllAsZip = async (task: VehicleRecoveryTask) => {
    if (!task.documents || task.documents.length === 0) {
      alert("Admin belum mengunggah berkas untuk unit ini.");
      return;
    }

    setIsZipping(task.id);
    
    try {
      const JSZipLib = (window as any).JSZip;
      if (!JSZipLib) throw new Error("Sistem kompresi sedang memuat.");

      const zip = new JSZipLib();
      
      task.documents.forEach((doc, index) => {
        const base64Data = doc.data.includes('base64,') 
          ? doc.data.split('base64,')[1] 
          : doc.data;
          
        const extension = doc.type.split('/')[1] || 'jpg';
        const safeCategory = doc.category.replace(/[^a-z0-9]/gi, '_').toUpperCase();
        const fileName = `${safeCategory}_${index + 1}.${extension}`;
        
        zip.file(fileName, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BERKAS_EKSEKUSI_${task.plateNumber}.zip`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error: any) {
      alert("Gagal mengunduh berkas: " + error.message);
    } finally {
      setIsZipping(null);
    }
  };

  const handleVisitSubmit = () => {
    if (!visitData.description || !visitData.photo || !progressTask) return alert("Lengkapi data progres.");
    setIsSubmitting(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const all: VehicleRecoveryTask[] = JSON.parse(localStorage.getItem('kawitan_tasks') || '[]');
      const newLog: TaskProgressLog = {
        id: `prog-${Date.now()}`,
        timestamp: new Date().toISOString(),
        description: visitData.description,
        location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        photo: visitData.photo,
        type: 'VISIT'
      };
      
      const updated = all.map(t => t.id === progressTask.id ? { ...t, progressLogs: [...(t.progressLogs || []), newLog], status: TaskStatus.IN_PROGRESS } : t);
      localStorage.setItem('kawitan_tasks', JSON.stringify(updated));
      setIsSubmitting(false);
      setProgressTask(null);
      setVisitData({ description: '', photo: '' });
      loadData();
      alert("Progres kunjungan berhasil dilaporkan.");
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'REPORT' | 'VISIT') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if(target === 'REPORT') setReportData({...reportData, photo: reader.result as string});
        else setVisitData({...visitData, photo: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Operative Header */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border-4 border-slate-800">
        <div className="relative z-10">
          <div>
             <h1 className="text-3xl font-black tracking-tight">Halo, {user.name.split(' ')[0]}!</h1>
             <p className="text-slate-400 font-bold mt-1 text-sm">Monitor setiap perkembangan unit di lapangan.</p>
          </div>
        </div>
        <Activity size={300} className="absolute -right-20 -bottom-20 opacity-5" />
      </div>

      {/* Operative Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatMini label="Tugas Baru" value={agentStats.pending} color="bg-amber-50" textColor="text-amber-600" icon={AlertCircle} />
        <StatMini label="Dalam Proses" value={agentStats.processing} color="bg-blue-50" textColor="text-blue-600" icon={Activity} />
        <StatMini label="Total Berhasil" value={agentStats.completed} color="bg-emerald-50" textColor="text-emerald-700" icon={TrendingUp} />
        <StatMini label="Sisa Kuota" value={20 - agentStats.total} color="bg-slate-100" textColor="text-slate-600" icon={Briefcase} />
      </div>

      {/* Main Work Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center tracking-tight">
            <ClipboardList className="text-blue-700 mr-3" size={24} />
            Daftar Unit Penugasan
          </h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full">{activeTasks.length} Aktif</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeTasks.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 text-center flex flex-col items-center">
              <Car size={48} className="text-slate-100 mb-4" />
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest leading-relaxed">Saat ini tidak ada unit yang ditugaskan kepada Anda.<br/>Harap hubungi Admin jika ada kekeliruan.</p>
            </div>
          ) : (
            activeTasks.map(task => {
              const visitCount = task.progressLogs?.length || 0;
              const lastLog = visitCount > 0 ? task.progressLogs![task.progressLogs!.length - 1] : null;

              return (
                <div key={task.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col space-y-6 transition-all hover:border-blue-200 group">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6 flex-1 w-full">
                      <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center shrink-0 border transition-colors ${task.status === TaskStatus.ASSIGNED ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        <Car size={28} />
                      </div>
                      <div className="min-w-0 flex-1">
                         <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${task.status === TaskStatus.ASSIGNED ? 'bg-amber-100 text-amber-700' : 'bg-blue-700 text-white'}`}>{task.status.replace('_', ' ')}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{task.leasingName}</span>
                            {visitCount > 0 && (
                              <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md flex items-center">
                                <History size={10} className="mr-1" /> {visitCount} Laporan
                              </span>
                            )}
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 leading-tight truncate">{task.platePrefix} {task.plateNumber} {task.plateSuffix}</h3>
                         <div className="flex flex-wrap items-center gap-3 mt-1">
                           <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter truncate">{task.vehicleModel} • {task.debtorName || 'N/A'}</p>
                           
                           <div className="flex items-center gap-2">
                             <button 
                               disabled={isZipping === task.id}
                               onClick={() => handleDownloadAllAsZip(task)}
                               className="text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center gap-2 transition-all"
                             >
                               {isZipping === task.id ? <Loader2 size={12} className="animate-spin" /> : <FileArchive size={12} />}
                               <span>Berkas ZIP</span>
                             </button>

                             <button 
                               disabled={isGeneratingPDF === task.id}
                               onClick={() => generateAssignmentLetter(task)}
                               className="text-[9px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center gap-2 transition-all"
                             >
                               {isGeneratingPDF === task.id ? <Loader2 size={12} className="animate-spin" /> : <Printer size={12} />}
                               <span>Buat Surat Tugas (PDF)</span>
                             </button>
                           </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">
                       {task.status === TaskStatus.ASSIGNED ? (
                          <>
                             <button onClick={() => handleAction(task, 'REJECT')} className="flex-1 md:flex-none px-6 py-4 bg-slate-50 text-slate-400 font-black text-[10px] uppercase rounded-2xl border border-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-all">Tolak</button>
                             <button onClick={() => handleAction(task, 'ACCEPT')} className="flex-1 md:flex-none px-10 py-4 bg-blue-700 text-white font-black text-[10px] uppercase rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all">Terima Tugas</button>
                          </>
                       ) : (
                          <>
                             <button onClick={() => handleAction(task, 'PROGRESS')} className="flex-1 md:flex-none px-6 py-4 bg-amber-50 text-amber-700 font-black text-[10px] uppercase rounded-2xl border border-amber-100 flex items-center justify-center hover:bg-amber-100 transition-all">
                                <MapPin size={16} className="mr-2" /> Kunjungan
                             </button>
                             <button onClick={() => handleAction(task, 'COMPLETE')} className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase rounded-2xl shadow-xl shadow-slate-900/20 flex items-center justify-center hover:bg-blue-700 transition-all">
                                <CheckCircle2 size={16} className="mr-2" /> Selesaikan
                             </button>
                          </>
                       )}
                    </div>
                  </div>

                  {/* Riwayat Terakhir Lapangan */}
                  {lastLog && (
                    <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-start space-x-4">
                       <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2 border-white shadow-sm">
                          <img src={lastLog.photo} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <Clock size={10} className="mr-1" /> Progres Terakhir: {new Date(lastLog.timestamp).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                             </p>
                             <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-blue-100">Laporan Terverifikasi</span>
                          </div>
                          <p className="text-xs font-bold text-slate-600 italic line-clamp-1">"{lastLog.description}"</p>
                       </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL LAPOR KUNJUNGAN */}
      {progressTask && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-slate-900">Laporkan Kunjungan Baru</h3>
                 <button onClick={()=>setProgressTask(null)}><X size={24} className="text-slate-300"/></button>
              </div>
              <div className="space-y-6">
                 <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center space-x-3 mb-2">
                    <MessageSquare size={18} className="text-blue-600" />
                    <p className="text-[10px] font-bold text-blue-700 leading-tight uppercase">Catat setiap temuan di lapangan untuk memantau progres unit secara bertahap.</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Detail Kronologi Kunjungan</label>
                    <textarea rows={3} className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 font-bold outline-none focus:border-blue-700 transition-all" placeholder="Misal: Bertemu istri debitur, unit sedang diservis, dijanjikan mediasi besok..." value={visitData.description} onChange={e=>setVisitData({...visitData, description:e.target.value})} />
                 </div>
                 <div onClick={()=>visitPhotoRef.current?.click()} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
                    {visitData.photo ? <img src={visitData.photo} className="w-full h-full object-cover" /> : <><Camera size={32} className="text-slate-300 group-hover:text-blue-700 transition-colors"/><span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Unggah Foto Bukti Kunjungan</span></>}
                    <input ref={visitPhotoRef} type="file" hidden accept="image/*" onChange={(e)=>handlePhotoUpload(e, 'VISIT')} />
                 </div>
                 <button disabled={isSubmitting} onClick={handleVisitSubmit} className="w-full py-6 bg-blue-700 text-white font-black text-xs uppercase rounded-[2.5rem] shadow-2xl flex items-center justify-center space-x-3 transition-all hover:bg-blue-800 active:scale-95">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Send size={20}/><span>Kirim Laporan Progres</span></>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL PENYELESAIAN */}
      {reportingTask && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">Penyelesaian Akhir</h3>
                <button onClick={()=>setReportingTask(null)}><X size={24} className="text-slate-300"/></button>
             </div>
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={()=>setReportData({...reportData, type:'UNIT_HANDOVER'})} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center ${reportData.type === 'UNIT_HANDOVER' ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                      <Car size={32} className="mb-2"/> <span className="text-[10px] font-black uppercase">Tarik Unit</span>
                   </button>
                   <button onClick={()=>setReportData({...reportData, type:'SETTLEMENT'})} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center ${reportData.type === 'SETTLEMENT' ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                      <FileText size={32} className="mb-2"/> <span className="text-[10px] font-black uppercase">Pelunasan</span>
                   </button>
                </div>
                <textarea rows={3} className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 font-bold outline-none focus:border-blue-700" placeholder="Kronologi penyelesaian (Serah terima, mediasi, dll)..." value={reportData.chronology} onChange={e=>setReportData({...reportData, chronology:e.target.value})} />
                <div onClick={()=>fileInputRef.current?.click()} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
                   {reportData.photo ? <img src={reportData.photo} className="w-full h-full object-cover" /> : <><ImageIcon size={32} className="text-slate-300 group-hover:text-blue-700"/><span className="text-[10px] font-black text-slate-400 mt-2 uppercase">Unggah Bukti Selesai</span></>}
                   <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={(e)=>handlePhotoUpload(e, 'REPORT')} />
                </div>
                <button disabled={isSubmitting} onClick={()=>{
                  if(!reportData.chronology || !reportData.photo) return alert("Lengkapi laporan.");
                  setIsSubmitting(true);
                  setTimeout(()=>{
                    const all: VehicleRecoveryTask[] = JSON.parse(localStorage.getItem('kawitan_tasks') || '[]');
                    const updated = all.map(t => t.id === reportingTask.id ? { ...t, status: TaskStatus.COMPLETED, resolutionType: reportData.type, resolutionChronology: reportData.chronology, resolutionPhoto: reportData.photo } : t);
                    localStorage.setItem('kawitan_tasks', JSON.stringify(updated));
                    setIsSubmitting(false); setReportingTask(null); loadData();
                    alert("Tugas selesai dan dilaporkan ke sistem.");
                  }, 1500);
                }} className="w-full py-6 bg-emerald-600 text-white font-black text-xs uppercase rounded-[2.5rem] shadow-2xl flex items-center justify-center space-x-3 hover:bg-emerald-700 transition-all active:scale-95">
                   {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={20}/><span>Selesaikan Tugas Secara Permanen</span></>}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;