
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ClipboardList, Users, LogOut, Bell, Menu, FileText, 
  ShieldCheck, Handshake, ShieldAlert, Clock, CheckCircle2, XCircle, 
  MapPin, ChevronRight, User as UserIcon, UserCheck, Loader2, Activity,
  Lock, UserPlus, Camera, ImageIcon, Send, ArrowLeft, KeyRound, ChevronDown, Loader,
  Layers, Info, Database, History
} from 'lucide-react';
import AdminDashboard from './views/AdminDashboard';
import HeadDashboard from './views/HeadDashboard';
import HeadProgressMonitor from './views/HeadProgressMonitor';
import AgentDashboard from './views/AgentDashboard';
import FreelanceDashboard from './views/FreelanceDashboard';
import TaskManagement from './views/TaskManagement';
import AgentsManagement from './views/AgentsManagement';
import FreelanceAuthManagement from './views/FreelanceAuthManagement';
import Attendance from './views/Attendance';
import DigitalAssetManagement from './views/DigitalAssetManagement';
import PartnershipAuditLog from './views/PartnershipAuditLog';
import { User, UserRole, Notification, FreelanceActivityLog, TaskStatus, VehicleRecoveryTask } from './types';
import { translations } from './translations';

const LanguageContext = createContext<{ lang: 'id'; t: any }>({ lang: 'id', t: translations.id });
export const useTranslation = () => useContext(LanguageContext);

const INITIAL_USERS: User[] = [
  { id: 'head-1', name: 'Bpk. Direktur Utama', username: 'direktur', password: '123', role: UserRole.HEAD, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Boss', status: 'active', address: 'Jakarta Central', phone: '0811223344' },
  { id: 'admin-1', name: 'Siti Admin', username: 'admin', password: '123', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti', status: 'active', address: 'Jakarta East', phone: '0812334455' },
  { id: 'agent-1', name: 'Rahmat Staff', username: 'rahmat', password: '123', role: UserRole.AGENT, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahmat', status: 'active', address: 'Depok', phone: '0813445566' },
  { id: 'agent-2', name: 'Budi Staff', username: 'budi', password: '123', role: UserRole.AGENT, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi', status: 'active', address: 'Bekasi', phone: '0814556677' }
];

const INITIAL_TASKS: VehicleRecoveryTask[] = [
  {
    id: 'task-1',
    leasingName: 'BCA Finance',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Avanza 1.5 G CVT',
    vehicleYear: '2022',
    vehicleColor: 'Hitam Metalik',
    platePrefix: 'B',
    plateNumber: '1234',
    plateSuffix: 'ABC',
    chassisNumber: 'MHF123...',
    engineNumber: '1NR456...',
    status: TaskStatus.IN_PROGRESS,
    assignedTo: 'agent-1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    debtorName: 'Andi Wijaya',
    documents: [],
    progressLogs: []
  }
];

const AppLayout: React.FC<{ children: React.ReactNode, user: User, onLogout: () => void }> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [];
  if (user.role === UserRole.HEAD) {
    menuItems.push(
      { icon: LayoutDashboard, label: 'Dashboard Utama', to: '/' },
      { icon: Activity, label: 'Monitor Lapangan', to: '/unit-progress' },
      { icon: FileText, label: 'Daftar Unit (SK)', to: '/tasks' },
      { icon: History, label: 'Audit Kemitraan', to: '/partnership-audit' },
      { icon: UserCheck, label: 'Pusat Otorisasi', to: '/auth-requests' },
      { icon: Users, label: 'Manajemen SDM', to: '/agents' }
    );
  } else if (user.role === UserRole.ADMIN) {
    menuItems.push(
      { icon: LayoutDashboard, label: 'Dashboard Admin', to: '/' },
      { icon: FileText, label: 'Input Unit (SK)', to: '/tasks' },
      { icon: UserCheck, label: 'Otorisasi Mitra', to: '/auth-requests' },
      { icon: Users, label: 'Manajemen Personel', to: '/agents' },
      { icon: ImageIcon, label: 'Digital Aset', to: '/digital-assets' }
    );
  } else if (user.role === UserRole.AGENT) {
    menuItems.push(
      { icon: LayoutDashboard, label: 'Dasbor Lapangan', to: '/' },
      { icon: UserCheck, label: 'Otorisasi Mitra', to: '/auth-requests' },
      { icon: Clock, label: 'Presensi / Absensi', to: '/attendance' }
    );
  } else if (user.role === UserRole.FREELANCE) {
    menuItems.push({ icon: LayoutDashboard, label: 'Kemitraan SK', to: '/' });
  }

  return (
    <div className="flex h-screen bg-[#fdfafb] overflow-hidden">
      <aside className={`fixed lg:static inset-y-0 left-0 bg-white border-r border-slate-100 z-50 transition-all w-72 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-blue-700 p-2.5 rounded-2xl text-white shadow-lg"><ClipboardList size={26} /></div>
            <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 leading-none">Elkha</span>
                <span className="text-sm font-black text-blue-700 tracking-tighter">Dena Perkasa</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-2 text-slate-400 hover:text-blue-700"><XCircle size={24} /></button>
          </div>
          <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={`flex items-center space-x-3 p-4 rounded-2xl font-black text-sm transition-all ${location.pathname === item.to ? 'bg-blue-700 text-white shadow-xl' : 'text-slate-500 hover:bg-blue-50'}`}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-50 pt-6">
            <div className="p-4 bg-slate-50 rounded-2xl mb-4 flex items-center space-x-3">
              <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm" alt="" />
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[8px] text-blue-700 font-black uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center space-x-3 w-full p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-black text-sm"><LogOut size={20} /> <span>Keluar</span></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-30 shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><Menu size={24} /></button>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ELKHA DENA PERKASA • SISTEM OPERASIONAL</h2>
          </div>
          <div className="flex items-center space-x-4">
             <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[9px] font-black uppercase tracking-widest">Server Online</span>
             </div>
             <button className="p-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all"><Bell size={20} /></button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#fdfafb]">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('kawitan_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('kawitan_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginMode, setLoginMode] = useState<'STAFF' | 'FREELANCE'>('STAFF');
  const [freelanceData, setFreelanceData] = useState({ name: '', referralId: '' });
  const [waitingLogId, setWaitingLogId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kawitan_users', JSON.stringify(users));
    if (localStorage.getItem('kawitan_tasks') === null) {
      localStorage.setItem('kawitan_tasks', JSON.stringify(INITIAL_TASKS));
    }
  }, [users]);

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('kawitan_users');
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        if (JSON.stringify(parsed) !== JSON.stringify(users)) {
          setUsers(parsed);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [users]);

  useEffect(() => {
    if (!waitingLogId) return;

    const interval = setInterval(() => {
      const logs: FreelanceActivityLog[] = JSON.parse(localStorage.getItem('kawitan_freelance_logs') || '[]');
      const currentLog = logs.find(l => l.id === waitingLogId);
      
      if (currentLog?.status === 'APPROVED') {
        const tempUser: User = {
          id: currentLog.id, 
          name: currentLog.freelanceName,
          username: currentLog.freelanceName.toLowerCase().replace(/\s/g, ''),
          role: UserRole.FREELANCE,
          referralId: currentLog.referralMemberId,
          status: 'active',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentLog.freelanceName}`
        };
        setCurrentUser(tempUser);
        sessionStorage.setItem('kawitan_current_user', JSON.stringify(tempUser));
        setWaitingLogId(null);
        clearInterval(interval);
      } else if (currentLog?.status === 'REJECTED') {
        alert("Akses Masuk Anda Ditolak oleh Staff Referal.");
        setWaitingLogId(null);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [waitingLogId]);

  const handleStaffLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const u = (fd.get('username') as string).toLowerCase();
    const p = fd.get('password') as string;

    const user = users.find(x => x.username.toLowerCase() === u && x.password === p && x.role !== UserRole.FREELANCE);
    if (user) {
      setCurrentUser(user); 
      sessionStorage.setItem('kawitan_current_user', JSON.stringify(user)); 
    } else {
      alert("Username atau Password salah.");
    }
  };

  const handleFreelanceLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelanceData.name || !freelanceData.referralId) {
      alert("Mohon masukkan Nama Terang dan pilih Referal Kantor.");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const logId = `log-login-${Date.now()}`;
      const staff = users.find(u => u.id === freelanceData.referralId);
      
      const newLog: FreelanceActivityLog = {
        id: logId,
        freelanceName: freelanceData.name,
        referralMemberId: freelanceData.referralId,
        referralMemberName: staff?.name || 'Staff',
        actionType: 'LOGIN_AUTH',
        freelanceLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        freelanceTime: new Date().toISOString(),
        status: 'PENDING'
      };

      const logs = JSON.parse(localStorage.getItem('kawitan_freelance_logs') || '[]');
      localStorage.setItem('kawitan_freelance_logs', JSON.stringify([...logs, newLog]));
      setWaitingLogId(logId);
    }, () => {
      alert("Izin GPS diperlukan untuk akses kemitraan.");
    });
  };

  const officeStaff = users.filter(u => u.role !== UserRole.FREELANCE);

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-700 p-6 relative">
       <div className="absolute inset-0 overflow-hidden opacity-10">
          <Database size={800} className="absolute -left-20 -bottom-20 text-white" />
       </div>

       <div className="bg-white p-14 rounded-[3.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-500 z-10">
          
          {waitingLogId ? (
            <div className="text-center space-y-8 py-10">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative p-8 bg-amber-50 text-amber-600 rounded-[3rem] border-2 border-amber-100">
                     <Clock size={64} className="animate-spin duration-[4000ms]" />
                  </div>
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Menunggu Otoritas Staff</h2>
                  <p className="text-slate-500 font-bold mt-2 text-sm max-w-xs mx-auto leading-relaxed">
                    Permintaan akses telah dikirim ke <span className="text-blue-700 font-black">{officeStaff.find(s => s.id === freelanceData.referralId)?.name}</span>. Dashboard akan terbuka otomatis saat disetujui.
                  </p>
                  <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3 text-left">
                     <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-1" />
                     <p className="text-[9px] font-bold text-slate-400 uppercase leading-normal">PENTING: Karena sistem menggunakan demo local-storage, Admin harus membuka aplikasi di BROWSER & PERANGKAT YANG SAMA untuk memproses permintaan ini.</p>
                  </div>
               </div>
               <button onClick={() => setWaitingLogId(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-700 transition-all">Batal & Kembali</button>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-4">
                  <ClipboardList className="text-blue-700" size={40} />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">
                  EDP<span className="text-blue-700">Web Service</span>
                </h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2">Sistem Operasional Debt Collector</p>
              </div>

              <div className="bg-slate-100 p-1.5 rounded-[2rem] flex mb-10 border border-slate-200">
                <button 
                  onClick={() => setLoginMode('STAFF')}
                  className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'STAFF' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}
                >
                  Staff Kantor
                </button>
                <button 
                  onClick={() => setLoginMode('FREELANCE')}
                  className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'FREELANCE' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}
                >
                  Mitra Freelance
                </button>
              </div>

              {loginMode === 'STAFF' ? (
                <form onSubmit={handleStaffLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Akses</label>
                      <div className="relative">
                        <input required name="username" type="text" placeholder="Masukkan Username..." className="w-full bg-slate-200/50 p-5 rounded-3xl border-2 border-transparent font-bold outline-none focus:border-blue-700 focus:bg-white transition-all text-center" />
                        <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Akses</label>
                      <div className="relative">
                        <input required name="password" type="password" placeholder="Masukkan Password..." className="w-full bg-slate-200/50 p-5 rounded-3xl border-2 border-transparent font-bold outline-none focus:border-blue-700 focus:bg-white transition-all text-center" />
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-700 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-3">
                    <KeyRound size={20}/>
                    <span>Masuk Sistem</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleFreelanceLogin} className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Nama Terang Sesuai Identitas</label>
                      <input 
                        required 
                        placeholder="Contoh: Andi Wijaya" 
                        className="w-full bg-slate-200/80 p-5 rounded-2xl border-2 border-transparent font-black text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all text-center"
                        value={freelanceData.name}
                        onChange={e => setFreelanceData({...freelanceData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Pilih Anggota Referal Kantor</label>
                      <div className="relative">
                        <select 
                          required
                          className="w-full bg-white p-5 rounded-2xl border-2 border-amber-500 font-bold text-slate-900 outline-none appearance-none cursor-pointer pr-12 text-center"
                          value={freelanceData.referralId}
                          onChange={e => setFreelanceData({...freelanceData, referralId: e.target.value})}
                        >
                          <option value="">-- Pilih Petugas Otoritas --</option>
                          {officeStaff.map(staff => (
                            <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" size={20} />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-3">
                    <ShieldCheck size={20}/>
                    <span>Minta Otoritas SK</span>
                  </button>
                </form>
              )}

              <div className="mt-10 p-5 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center space-x-4">
                 <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm"><Info size={18} /></div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-0.5">Demo Local Persistence</p>
                    <p className="text-[8px] font-bold text-blue-700 leading-relaxed uppercase opacity-80 text-justify">Data hanya tersinkron jika dicoba di browser yang sama. Hubungi Pengembang untuk integrasi Database Cloud.</p>
                 </div>
              </div>
            </>
          )}

          <div className="mt-12 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Elkha Dena Perkasa • Versi 2.1 (Dev Mode)</p>
          </div>
       </div>
    </div>
  );

  return (
    <LanguageContext.Provider value={{ lang: 'id', t: translations.id }}>
      <Router>
        <AppLayout user={currentUser} onLogout={() => { setCurrentUser(null); sessionStorage.clear(); }}>
          <Routes>
            <Route path="/" element={
               currentUser.role === UserRole.HEAD ? <HeadDashboard /> : 
               currentUser.role === UserRole.ADMIN ? <AdminDashboard /> : 
               currentUser.role === UserRole.FREELANCE ? <FreelanceDashboard user={currentUser} setNotifications={() => {}} /> :
               <AgentDashboard user={currentUser} />
            } />
            <Route path="/unit-progress" element={<HeadProgressMonitor />} />
            <Route path="/tasks" element={<TaskManagement user={currentUser} setNotifications={() => {}} />} />
            <Route path="/agents" element={<AgentsManagement users={users} setUsers={setUsers} currentUser={currentUser} />} />
            <Route path="/auth-requests" element={<FreelanceAuthManagement user={currentUser} setUsers={setUsers} users={users} />} />
            <Route path="/partnership-audit" element={<PartnershipAuditLog />} />
            <Route path="/attendance" element={<Attendance user={currentUser} />} />
            <Route path="/digital-assets" element={<DigitalAssetManagement user={currentUser} />} />
          </Routes>
        </AppLayout>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;