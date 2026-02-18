
import React, { useState, useEffect } from 'react';
import { 
  Car, FileText, Search, Download, ShieldCheck, ShieldAlert, Clock, Handshake, MapPin, RefreshCw, ChevronRight, Info, CheckCircle2, Loader2, Printer, FileArchive
} from 'lucide-react';
import { User, VehicleRecoveryTask, FreelanceActivityLog, Notification, DigitalAsset, UserRole } from '../types';

// Declare external libraries
declare const JSZip: any;
declare const jspdf: any;

interface FreelanceDashboardProps {
  user: User;
  setNotifications: any;
}

const FreelanceDashboard: React.FC<FreelanceDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<VehicleRecoveryTask[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestingTaskId, setRequestingTaskId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = () => {
    const saved = localStorage.getItem('kawitan_tasks');
    if (saved) setTasks(JSON.parse(saved));
  };

  const getImageType = (dataUrl: string): string => {
    if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG';
    if (dataUrl.includes('image/webp')) return 'WEBP';
    return 'PNG';
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
        doc.setFont("helvetica", "bold");
        doc.text("ELKHA DENA PERKASA", 105, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text("Sistem Manajemen Penagihan & Penarikan Unit", 105, 32, { align: 'center' });
      }

      const topMargin = kopSurat ? 65 : 45;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SURAT TUGAS MITRA LAPANGAN", 105, topMargin, { align: 'center' });
      doc.line(60, topMargin + 2, 150, topMargin + 2);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Nomor: ST-MITRA/${task.leasingName.toUpperCase()}/${task.plateNumber}/${new Date().getFullYear()}`, 105, topMargin + 8, { align: 'center' });

      doc.setFontSize(11);
      const content = `Dengan ini Direktur Utama Elkha Dena Perkasa memberikan tugas dan wewenang kepada mitra freelance di bawah ini untuk melakukan pemantauan, koordinasi, dan mediasi terhadap unit kendaraan yang memiliki tunggakan/piutang sesuai dengan penugasan sistem:`;
      const splitContent = doc.splitTextToSize(content, 170);
      doc.text(splitContent, 20, topMargin + 25);

      doc.setFont("helvetica", "bold");
      doc.text("Penerima Kuasa:", 20, topMargin + 45);
      doc.setFont("helvetica", "normal");
      doc.text(`Nama : ${latestUserData.name}`, 30, topMargin + 52);
      doc.text(`Status : Mitra Freelance (Terverifikasi)`, 30, topMargin + 58);
      doc.text(`Referal Kantor : ${users.find(u => u.id === user.referralId)?.name || 'Staff EDP'}`, 30, topMargin + 64);

      doc.setFont("helvetica", "bold");
      doc.text("Objek Kendaraan Penugasan:", 20, topMargin + 78);
      
      const vehicleTableY = topMargin + 85;
      doc.rect(20, vehicleTableY, 170, 45);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Klien / Leasing : ${task.leasingName}`, 25, vehicleTableY + 10);
      doc.text(`No. Polisi : ${task.platePrefix} ${task.plateNumber} ${task.plateSuffix}`, 25, vehicleTableY + 18);
      doc.text(`Merek / Tipe : ${task.vehicleBrand} ${task.vehicleModel}`, 25, vehicleTableY + 26);
      doc.text(`No. Rangka : ${task.chassisNumber || '-'}`, 25, vehicleTableY + 34);
      doc.text(`No. Mesin : ${task.engineNumber || '-'}`, 25, vehicleTableY + 42);

      doc.setFontSize(9);
      const footerText = "Mitra wajib mematuhi kode etik penagihan yang berlaku, dilarang melakukan tindakan anarkis atau intimidasi yang melanggar hukum. Segala tindakan di luar prosedur yang ditetapkan perusahaan menjadi tanggung jawab pribadi mitra. Surat tugas ini berlaku selama 7 (tujuh) hari sejak diterbitkan.";
      const splitFooter = doc.splitTextToSize(footerText, 170);
      doc.text(splitFooter, 20, vehicleTableY + 60);

      const sigY = vehicleTableY + 90;
      doc.setFontSize(10);
      const issuanceLocation = director?.address || latestUserData.address || 'Indonesia';
      doc.text(`${issuanceLocation}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 130, sigY - 5);

      doc.setFont("helvetica", "bold");
      doc.text("Pemberi Kuasa,", 20, sigY);
      doc.text("Direktur Utama", 20, sigY + 6);
      if (director?.signature) {
        doc.addImage(director.signature, getImageType(director.signature), 20, sigY + 10, 40, 20);
      }
      doc.text(`( ${director?.name || 'Direktur Utama'} )`, 20, sigY + 40);

      doc.text("Penerima Kuasa,", 130, sigY);
      doc.text("Mitra Freelance", 130, sigY + 6);
      if (latestUserData.signature) {
        doc.addImage(latestUserData.signature, getImageType(latestUserData.signature), 130, sigY + 10, 40, 20);
      }
      doc.text(`( ${latestUserData.name} )`, 130, sigY + 40);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Dokumen ini diterbitkan secara digital dan sah sebagai bukti penugasan lapangan.", 105, 285, { align: 'center' });

      doc.save(`SURAT_TUGAS_MITRA_${task.plateNumber}.pdf`);
      alert("Surat tugas berhasil dibuat.");
    } catch (err: any) {
      console.error(err);
      alert("Gagal membuat Surat Tugas: " + err.message);
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  const handleRequestDoc = (task: VehicleRecoveryTask) => {
    if (!user.referralId) {
      alert("Referal tidak ditemukan.");
      return;
    }

    setRequestingTaskId(task.id);
    navigator.geolocation.getCurrentPosition((pos) => {
      const logs: FreelanceActivityLog[] = JSON.parse(localStorage.getItem('kawitan_freelance_logs') || '[]');
      
      const newLog: FreelanceActivityLog = {
        id: `log-sk-${Date.now()}`,
        freelanceName: user.name,
        freelanceUserId: user.id,
        referralMemberId: user.referralId || '',
        referralMemberName: 'Menunggu Konfirmasi',
        actionType: 'DOC_AUTH_SK',
        vehiclePlate: `${task.platePrefix} ${task.plateNumber} ${task.plateSuffix}`,
        freelanceLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        freelanceTime: new Date().toISOString(),
        status: 'PENDING'
      };

      localStorage.setItem('kawitan_freelance_logs', JSON.stringify([...logs, newLog]));
      alert(`Permintaan akses berkas unit ${task.plateNumber} telah dikirim ke Referal.`);
    });
  };

  const handleDownloadAllAsZip = async (task: VehicleRecoveryTask) => {
    if (!task.documents || task.documents.length === 0) {
      alert("Admin belum mengunggah dokumen apapun untuk unit ini.");
      return;
    }

    setIsZipping(task.id);
    
    try {
      const JSZipLib = (window as any).JSZip;
      if (!JSZipLib) throw new Error("Library kompresi belum siap.");

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
      link.download = `BERKAS_EDP_${task.plateNumber}.zip`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error: any) {
      alert("Terjadi kesalahan saat mengompres berkas: " + error.message);
    } finally {
      setIsZipping(null);
    }
  };

  const isDocApproved = (task: VehicleRecoveryTask) => {
    return task.approvedForFreelances?.includes(user.id) || task.approvedForFreelances?.includes("all");
  };

  const filteredTasks = tasks.filter(t => 
    t.plateNumber.includes(searchTerm) || 
    t.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-24">
      <div className="bg-amber-600 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden border-4 border-amber-500">
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
             <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20"><Handshake size={24} /></div>
             <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-100">Portal Kemitraan SK</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4">Unit Penugasan, {user.name}</h1>
          <p className="text-amber-50 font-bold text-lg max-w-2xl leading-relaxed">
             Dapatkan akses seluruh paket berkas operasional (SK, STNK, BPKB, dll) serta Surat Tugas resmi untuk keperluan lapangan.
          </p>
        </div>
        <div className="absolute -right-24 -bottom-24 opacity-10 transform -rotate-12"><FileText size={400} /></div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
         <div className="flex items-center space-x-5 bg-slate-100 px-8 py-5 rounded-3xl flex-1 border border-transparent focus-within:border-amber-400 focus-within:bg-white transition-all">
            <Search size={22} className="text-slate-400" />
            <input 
              placeholder="Cari Plat Nomor Kendaraan..." 
              className="bg-transparent border-none outline-none font-black text-sm w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-24 rounded-[4rem] border-4 border-dashed border-slate-100 text-center">
             <Car size={64} className="text-slate-100 mx-auto mb-6" />
             <p className="text-slate-400 font-bold italic text-lg">Belum ada unit yang tersedia.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`bg-white p-10 rounded-[3.5rem] border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 transition-all ${isDocApproved(task) ? 'border-emerald-200 ring-4 ring-emerald-50' : 'border-slate-100'}`}>
               <div className="flex items-center space-x-8 w-full">
                  <div className={`p-8 rounded-[2.5rem] shrink-0 border-4 ${isDocApproved(task) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                     <Car size={40} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center space-x-3 mb-2">
                        <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg">{task.leasingName}</span>
                        {isDocApproved(task) && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Akses Terbuka</span>}
                     </div>
                     <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1 truncate">{task.platePrefix} {task.plateNumber} {task.plateSuffix}</h3>
                     <p className="text-lg font-bold text-slate-500 uppercase tracking-widest truncate">{task.vehicleBrand} {task.vehicleModel}</p>
                  </div>
               </div>
               
               <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-4">
                  {isDocApproved(task) ? (
                    <>
                      <button 
                        disabled={isGeneratingPDF === task.id}
                        onClick={() => generateAssignmentLetter(task)} 
                        className="flex-1 md:flex-none bg-blue-700 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                      >
                         {isGeneratingPDF === task.id ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                         <span>Surat Tugas</span>
                      </button>

                      <button 
                        disabled={isZipping === task.id}
                        onClick={() => handleDownloadAllAsZip(task)} 
                        className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                      >
                         {isZipping === task.id ? <Loader2 size={18} className="animate-spin" /> : <FileArchive size={18} />}
                         <span>Paket ZIP</span>
                      </button>
                    </>
                  ) : requestingTaskId === task.id ? (
                    <div className="flex items-center space-x-4 bg-amber-50 text-amber-700 px-12 py-6 rounded-[2.5rem] border-2 border-amber-200 font-black text-[12px] uppercase tracking-widest">
                       <RefreshCw size={20} className="animate-spin" />
                       <span>Menunggu Otoritas</span>
                    </div>
                  ) : (
                    <button onClick={() => handleRequestDoc(task)} className="w-full md:w-auto bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center space-x-4 active:scale-95">
                       <ShieldCheck size={24} />
                       <span>Minta Akses SK</span>
                    </button>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FreelanceDashboard;