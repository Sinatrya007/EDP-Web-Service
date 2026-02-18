
import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  MapPin, 
  LogIn, 
  LogOut, 
  Calendar as CalendarIcon,
  Loader2,
  ShieldCheck,
  Camera,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  RefreshCcw,
  Activity,
  Power,
  History
} from 'lucide-react';
import { User, AttendanceRecord } from '../types';

const Attendance: React.FC<{ user: User }> = ({ user }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('kawitan_attendance');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLoc, setCurrentLoc] = useState<{lat: number, lng: number} | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'IN' | 'OUT' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isOnDuty, setIsOnDuty] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error("GPS Error", err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    checkDutyStatus();
  }, [records, user.id]);

  useEffect(() => {
    localStorage.setItem('kawitan_attendance', JSON.stringify(records));
  }, [records]);

  const checkDutyStatus = () => {
    const userRecords = records.filter(r => r.userId === user.id);
    if (userRecords.length === 0) {
      setIsOnDuty(false);
      return;
    }
    setIsOnDuty(userRecords[0].type === 'IN');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (mode: 'user' | 'environment') => {
    if (!window.isSecureContext) {
      alert("Akses kamera membutuhkan koneksi aman (HTTPS).");
      return;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const constraintOptions = [
      { video: { facingMode: { exact: mode } }, audio: false },
      { video: { facingMode: mode }, audio: false },
      { video: true, audio: false }
    ];

    let successfulStream = null;
    let finalMode = mode;

    for (const constraints of constraintOptions) {
      try {
        successfulStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (successfulStream) break;
      } catch (err) {
        console.warn(`Attempt failed for mode ${mode}:`, err);
      }
    }

    if (!successfulStream) {
      const fallbackMode = mode === 'user' ? 'environment' : 'user';
      try {
        successfulStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: fallbackMode }, audio: false });
        finalMode = fallbackMode;
      } catch (err) {
        console.error("Critical: All camera access failed", err);
      }
    }

    if (successfulStream) {
      streamRef.current = successfulStream;
      setFacingMode(finalMode);
      if (videoRef.current) {
        videoRef.current.srcObject = successfulStream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.error("Play error:", e);
        }
      }
      setIsCameraActive(true);
    } else {
      alert("Tidak dapat mengakses kamera. Harap periksa izin browser Anda.");
    }
  };

  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  };

  const handleActionClick = () => {
    const type = isOnDuty ? 'OUT' : 'IN';
    setAttendanceType(type);
    startCamera('user');
  };

  const captureAndSubmit = () => {
    if (!videoRef.current || !canvasRef.current || !attendanceType) return;
    
    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = 480;
    canvas.height = 640;

    ctx.save();
    if (facingMode === 'user') {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px sans-serif';
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const locStr = currentLoc ? `Lokasi: ${currentLoc.lat.toFixed(6)}, ${currentLoc.lng.toFixed(6)}` : 'Lokasi: Tidak Terdeteksi';

    ctx.fillText(`ABSENSI ${attendanceType === 'IN' ? 'MULAI TUGAS' : 'SELESAI TUGAS'}`, 20, canvas.height - 85);
    ctx.font = '14px sans-serif';
    ctx.fillText(dateStr, 20, canvas.height - 60);
    ctx.fillText(timeStr, 20, canvas.height - 40);
    ctx.fillText(locStr, 20, canvas.height - 20);

    const photoData = canvas.toDataURL('image/jpeg', 0.8);

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      timestamp: now.toISOString(),
      type: attendanceType,
      location: currentLoc || { lat: 0, lng: 0 },
      photo: photoData
    };

    setTimeout(() => {
      const updatedRecords = [newRecord, ...records];
      setRecords(updatedRecords);
      localStorage.setItem('kawitan_attendance', JSON.stringify(updatedRecords));
      stopCamera();
      setAttendanceType(null);
      setIsProcessing(false);
      alert(`Berhasil: Status Anda kini ${newRecord.type === 'IN' ? 'Aktif Bertugas' : 'Selesai Tugas'}`);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Status Kehadiran Personel</h1>
        <p className="text-slate-500 font-bold mt-2">Sistem Operasional 24 Jam Tanpa Batas Tanggal</p>
      </div>

      {!isCameraActive ? (
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-red-900/5 flex flex-col items-center">
          
          <div className={`mb-10 px-8 py-3 rounded-full border-2 flex items-center space-x-3 transition-all ${isOnDuty ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className={`w-3 h-3 rounded-full ${isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-sm font-black uppercase tracking-widest">
              {isOnDuty ? 'Anda Sedang Bertugas' : 'Status: Standby / Off Duty'}
            </span>
          </div>

          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-red-700 mb-6 border-4 border-white shadow-inner">
            <Clock size={48} />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h2>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs mt-2">
              Waktu Server Real-time
            </p>
          </div>

          <div className="flex items-center space-x-2 mb-12 bg-slate-50 px-6 py-2.5 rounded-full border border-slate-100">
            <ShieldCheck size={16} className={currentLoc ? "text-emerald-500" : "text-amber-500 animate-pulse"} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {currentLoc ? `GPS SIAP: ${currentLoc.lat.toFixed(4)}, ${currentLoc.lng.toFixed(4)}` : 'Mendeteksi Lokasi...'}
            </span>
            {!currentLoc && <button onClick={() => window.location.reload()} className="ml-2 text-red-700"><RefreshCw size={12} /></button>}
          </div>

          <div className="w-full max-w-sm">
            <button 
              disabled={!currentLoc}
              onClick={handleActionClick}
              className={`w-full group flex flex-col items-center space-y-4 p-10 rounded-[2.5rem] transition-all shadow-2xl active:scale-95 border-4 ${
                isOnDuty 
                ? 'bg-slate-900 border-slate-800 text-white hover:bg-red-700 hover:border-red-600 shadow-slate-200' 
                : 'bg-red-700 border-red-600 text-white hover:bg-red-800 shadow-red-100'
              } disabled:cursor-not-allowed`}
            >
              {isOnDuty ? <Power size={48} /> : <LogIn size={48} />}
              <div className="text-center">
                <span className="font-black text-2xl uppercase tracking-widest block">
                  {isOnDuty ? 'Selesai Tugas' : 'Mulai Tugas'}
                </span>
                <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1 block">
                  {isOnDuty ? 'Klik untuk Log Out Shift' : 'Klik untuk Verifikasi Kehadiran'}
                </span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[3.5rem] p-4 shadow-2xl overflow-hidden relative border-4 border-red-700 max-w-md mx-auto">
          <div className="relative aspect-[3/4] bg-black rounded-[2.5rem] overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
            />
            
            <div className="absolute top-6 left-6 bg-red-700 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg animate-pulse uppercase">
              {attendanceType === 'IN' ? 'VERIFIKASI MASUK' : 'VERIFIKASI KELUAR'}
            </div>

            <button 
              onClick={toggleCamera}
              className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/40 transition-all border border-white/20"
              title="Ganti Kamera"
            >
              <RefreshCcw size={20} />
            </button>
          </div>

          <div className="mt-8 mb-4 flex flex-col items-center space-y-6">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Posisikan wajah di tengah bingkai</p>
             
             <div className="flex items-center space-x-10">
                <button 
                  onClick={() => { stopCamera(); setAttendanceType(null); }}
                  className="p-4 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-all active:scale-90"
                >
                  <RotateCcw size={24} />
                </button>

                <button 
                  disabled={isProcessing}
                  onClick={captureAndSubmit}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-white/10 active:scale-90 transition-transform group disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 size={32} className="text-red-700 animate-spin" />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-4 border-slate-900 group-hover:bg-slate-50 transition-colors"></div>
                  )}
                </button>

                <div className="w-14"></div> 
             </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* History Log */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-red-900/5 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History size={20} className="text-red-700" />
            <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs tracking-[0.2em]">Log Aktivitas Shift Terakhir</h3>
          </div>
          <CalendarIcon size={20} className="text-slate-300" />
        </div>
        <div className="divide-y divide-slate-50">
          {records.filter(r => r.userId === user.id).length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <p className="font-bold italic">Belum ada catatan aktivitas shift dalam sistem.</p>
            </div>
          ) : (
            records.filter(r => r.userId === user.id).slice(0, 5).map(record => (
              <div key={record.id} className="p-8 flex items-center justify-between hover:bg-rose-50/20 transition-colors">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-20 rounded-2xl overflow-hidden border-2 border-white bg-slate-100 shrink-0 shadow-md">
                    <img src={record.photo} className="w-full h-full object-cover" alt="Verification" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                       <p className={`font-black text-sm ${record.type === 'IN' ? 'text-emerald-600' : 'text-slate-900'}`}>
                         {record.type === 'IN' ? 'START DUTY' : 'END DUTY'}
                       </p>
                       <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-1">{new Date(record.timestamp).toLocaleString('id-ID')}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase flex items-center mt-1">
                      <MapPin size={10} className="mr-1" /> {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
