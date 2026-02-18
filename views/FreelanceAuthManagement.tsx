
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, MapPin, Clock, CheckCircle2, XCircle, UserCheck, Handshake,
  ShieldAlert, User as UserIcon, FileText, RefreshCw, Trash2, AlertTriangle, Users, Save, Check
} from 'lucide-react';
import { User, FreelanceActivityLog, VehicleRecoveryTask, TaskStatus, UserRole } from '../types';

interface FreelanceAuthManagementProps {
  user: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const FreelanceAuthManagement: React.FC<FreelanceAuthManagementProps> = ({ user, users, setUsers }) => {
  const [logs, setLogs] = useState<FreelanceActivityLog[]>([]);
  const [taskRequests, setTaskRequests] = useState<VehicleRecoveryTask[]>([]);
  const [personnelRequests, setPersonnelRequests] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'FREELANCE' | 'SK_CHANGES' | 'USER_CHANGES'>('FREELANCE');

  const isHead = user.role === UserRole.HEAD;
  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const savedLogs = localStorage.getItem('kawitan_freelance_logs');
    if (savedLogs) {
      const allLogs: FreelanceActivityLog[] = JSON.parse(savedLogs);
      const filtered = allLogs.filter(l => {
        if (l.status !== 'PENDING') return false;
        return l.referralMemberId === user.id;
      });
      setLogs(filtered.reverse());
    }

    const savedTasks = localStorage.getItem('kawitan_tasks');
    if (savedTasks) {
      const allTasks: VehicleRecoveryTask[] = JSON.parse(savedTasks);
      setTaskRequests(allTasks.filter(t => t.status === TaskStatus.PENDING_EDIT || t.status === TaskStatus.PENDING_DELETE));
    }

    const savedUsers = localStorage.getItem('kawitan_users');
    if (savedUsers) {
      const allUsers: User[] = JSON.parse(savedUsers);
      setPersonnelRequests(allUsers.filter(u => u.status === 'waiting_auth' || u.status === 'pending_edit' || u.status === 'pending_delete'));
    }
  };

  const handleApproveFreelance = (log: FreelanceActivityLog, approved: boolean) => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const saved = localStorage.getItem('kawitan_freelance_logs');
      if (!saved) return;
      const allLogs: FreelanceActivityLog[] = JSON.parse(saved);
      
      const updatedLogs = allLogs.map(l => l.id === log.id ? { 
        ...l, 
        status: approved ? 'APPROVED' : 'REJECTED' as any, 
        approvalTime: new Date().toISOString(),
        approvalLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        referralMemberName: user.name 
      } : l);
      
      localStorage.setItem('kawitan_freelance_logs', JSON.stringify(updatedLogs));

      if (log.actionType === 'DOC_AUTH_SK' && approved && log.freelanceUserId) {
        const tasks: VehicleRecoveryTask[] = JSON.parse(localStorage.getItem('kawitan_tasks') || '[]');
        const updatedTasks = tasks.map(tk => {
          if (`${tk.platePrefix} ${tk.plateNumber} ${tk.plateSuffix}` === log.vehiclePlate) {
             const currentApproved = tk.approvedForFreelances || [];
             return { ...tk, approvedForFreelances: [...currentApproved, log.freelanceUserId!] };
          }
          return tk;
        });
        localStorage.setItem('kawitan_tasks', JSON.stringify(updatedTasks));
      }
      alert(approved ? "Otorisasi Mitra Berhasil." : "Permintaan Mitra Ditolak.");
      loadData();
    }, (err) => {
      alert("Izin lokasi diperlukan untuk memproses otorisasi ini.");
    });
  };

  const handleApproveTask = (task: VehicleRecoveryTask, approved: boolean) => {
    const saved = localStorage.getItem('kawitan_tasks');
    if (!saved) return;
    let allTasks: VehicleRecoveryTask[] = JSON.parse(saved);
    
    if (approved) {
      if (task.status === TaskStatus.PENDING_DELETE) {
        allTasks = allTasks.filter(t => t.id !== task.id);
      } else if (task.status === TaskStatus.PENDING_EDIT && task.pendingEdit) {
        allTasks = allTasks.map(t => t.id === task.id ? { ...t, ...task.pendingEdit, status: TaskStatus.IN_PROGRESS, pendingEdit: undefined } : t);
      }
    } else {
      allTasks = allTasks.map(t => t.id === task.id ? { ...t, status: TaskStatus.IN_PROGRESS, pendingEdit: undefined } : t);
    }
    
    localStorage.setItem('kawitan_tasks', JSON.stringify(allTasks));
    alert(approved ? "Perubahan SK Disetujui." : "Perubahan SK Ditolak.");
    loadData();
  };

  const handleApproveUser = (targetUser: User, approved: boolean) => {
    const savedUsers = localStorage.getItem('kawitan_users');
    if (!savedUsers) return;
    const allUsers: User[] = JSON.parse(savedUsers);

    const updatedUsers = allUsers.map(u => {
      if (u.id === targetUser.id) {
        if (approved) {
          if (u.status === 'pending_delete') return null;
          if (u.status === 'pending_edit' && u.pendingEdit) {
            return { ...u, ...u.pendingEdit, status: 'active', pendingEdit: undefined };
          }
          return { ...u, status: 'active' };
        } else {
          if (u.status === 'waiting_auth') return null;
          return { ...u, status: 'active', pendingEdit: undefined, pendingDelete: undefined };
        }
      }
      return u;
    }).filter(u => u !== null) as User[];

    localStorage.setItem('kawitan_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    alert(approved ? `Status ${targetUser.name} telah diaktifkan.` : `Permintaan untuk ${targetUser.name} telah ditolak.`);
    loadData();
  };

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden border-4 border-slate-800">
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10"><UserCheck size={26} className="text-emerald-400" /></div>
             <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Pusat Otoritas & Kendali Akun</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4">Pusat Otoritas.</h1>
          <p className="text-slate-400 font-bold text-lg max-w-2xl leading-relaxed">
            {isHead ? "Selamat datang Direktur Utama. Tinjau setiap perubahan krusial pada data perusahaan." : "Kelola permintaan akses dari mitra freelance Anda."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap p-2 bg-white rounded-[2rem] shadow-xl border border-slate-100 max-w-4xl">
         <button onClick={() => setActiveTab('FREELANCE')} className={`flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase transition-all flex items-center justify-center space-x-2 ${activeTab === 'FREELANCE' ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400'}`}>
            <Handshake size={14}/> <span>Permintaan Mitra ({logs.length})</span>
         </button>
         {(isHead || isAdmin) && (
           <>
             <button onClick={() => setActiveTab('SK_CHANGES')} className={`flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase transition-all flex items-center justify-center space-x-2 ${activeTab === 'SK_CHANGES' ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400'}`}><FileText size={14}/> <span>Data SK ({taskRequests.length})</span></button>
             <button onClick={() => setActiveTab('USER_CHANGES')} className={`flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase transition-all flex items-center justify-center space-x-2 ${activeTab === 'USER_CHANGES' ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400'}`}><Users size={14}/> <span>Personel ({personnelRequests.length})</span></button>
           </>
         )}
      </div>

      <div className="space-y-6">
        {activeTab === 'FREELANCE' && (
          <div className="grid grid-cols-1 gap-6">
            {logs.length === 0 ? (
              <EmptyState icon={ShieldCheck} text="Tidak ada antrean mitra." />
            ) : (
              logs.map(log => (
                <RequestCard 
                  key={log.id} 
                  icon={log.actionType === 'LOGIN_AUTH' ? UserIcon : FileText} 
                  title={log.freelanceName} 
                  subtitle={log.actionType.replace(/_/g, ' ')} 
                  info={log.vehiclePlate || "Akses Portal"} 
                  time={log.freelanceTime} 
                  onReject={() => handleApproveFreelance(log, false)} 
                  onApprove={() => handleApproveFreelance(log, true)} 
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'SK_CHANGES' && (
          <div className="grid grid-cols-1 gap-6">
            {taskRequests.length === 0 ? (
              <EmptyState icon={FileText} text="Tidak ada pengajuan data SK." />
            ) : (
              taskRequests.map(task => (
                <RequestCard 
                  key={task.id} 
                  icon={AlertTriangle} 
                  title={`${task.platePrefix} ${task.plateNumber} ${task.plateSuffix}`} 
                  subtitle={task.status === TaskStatus.PENDING_DELETE ? "PENGAJUAN HAPUS UNIT" : "PERUBAHAN DATA UNIT"} 
                  info={task.leasingName} 
                  time={task.createdAt} 
                  onReject={() => handleApproveTask(task, false)} 
                  onApprove={() => handleApproveTask(task, true)} 
                  color={task.status === TaskStatus.PENDING_DELETE ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"} 
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'USER_CHANGES' && (
          <div className="grid grid-cols-1 gap-6">
            {personnelRequests.length === 0 ? (
              <EmptyState icon={Users} text="Tidak ada antrean personel." />
            ) : (
              personnelRequests.map(u => (
                <RequestCard 
                  key={u.id} 
                  icon={UserIcon} 
                  title={u.name} 
                  subtitle={u.status === 'waiting_auth' ? 'PENDAFTARAN AKUN BARU' : u.status === 'pending_delete' ? 'PENGAJUAN HAPUS AKUN' : 'PERUBAHAN PROFIL'} 
                  info={`${u.role} (${u.phone || '-'})`} 
                  time={u.joinDate || new Date().toISOString()} 
                  onReject={() => handleApproveUser(u, false)} 
                  onApprove={() => handleApproveUser(u, true)} 
                  color={u.status === 'waiting_auth' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-rose-50 text-rose-700 border-rose-100"} 
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }: any) => (
  <div className="bg-white p-24 rounded-[4rem] border-4 border-dashed border-slate-100 text-center">
    <Icon size={64} className="text-slate-100 mx-auto mb-6" />
    <p className="text-slate-400 font-bold italic text-lg">{text}</p>
  </div>
);

const RequestCard = ({ icon: Icon, title, subtitle, info, time, onReject, onApprove, color }: any) => (
  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10 hover:border-emerald-200 transition-all">
    <div className="flex items-center space-x-8 flex-1">
      <div className={`p-8 rounded-[2.5rem] shrink-0 border-4 ${color || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
        <Icon size={32} />
      </div>
      <div>
        <span className="px-4 py-1 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">{subtitle}</span>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mt-2">{title}</h3>
        <p className="text-sm font-bold text-red-700 uppercase mt-1">{info}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center"><Clock size={12} className="mr-2"/> Dikirim: {new Date(time).toLocaleString()}</p>
      </div>
    </div>
    <div className="flex items-center space-x-4 shrink-0 w-full lg:w-auto">
      <button onClick={onReject} className="flex-1 lg:flex-none px-8 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black text-[11px] uppercase tracking-widest border border-slate-100 hover:bg-red-50 hover:text-red-700 transition-all">Tolak</button>
      <button onClick={onApprove} className="flex-1 lg:flex-none px-16 py-5 bg-emerald-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2">
        <Check size={16} /> <span>Setujui</span>
      </button>
    </div>
  </div>
);

export default FreelanceAuthManagement;