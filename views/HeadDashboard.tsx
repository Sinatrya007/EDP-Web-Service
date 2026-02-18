
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, MapPin, Clock, Handshake, TrendingUp, History, Radio, ExternalLink, 
  User as UserIcon, Calendar, CheckCircle2, Download, UserCheck, FileText, Search,
  Car, Users, Activity, AlertTriangle, Navigation
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { FreelanceActivityLog, VehicleRecoveryTask, User, UserRole, TaskStatus } from '../types';

const chartData = [
  { name: 'Sen', recovery: 12 },
  { name: 'Sel', recovery: 18 },
  { name: 'Rab', recovery: 15 },
  { name: 'Kam', recovery: 25 },
  { name: 'Jum', recovery: 22 },
  { name: 'Sab', recovery: 30 },
  { name: 'Min', recovery: 28 },
];

const StatCard = ({ label, value, trend, icon: Icon, color, textColor }: any) => (
  <div className={`p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-between h-48 bg-white transition-all hover:scale-[1.02]`}>
    <div className="flex items-center justify-between">
      <div className={`p-4 rounded-2xl ${color} ${textColor} shadow-lg`}>
        <Icon size={24} />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
    <div className="flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full self-start">
      <TrendingUp size={12} className="mr-2" />
      {trend} Kenaikan Minggu Ini
    </div>
  </div>
);

const HeadDashboard: React.FC = () => {
  const [logs, setLogs] = useState<FreelanceActivityLog[]>([]);
  const [tasks, setTasks] = useState<VehicleRecoveryTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const savedLogs = localStorage.getItem('kawitan_freelance_logs');
    const savedTasks = localStorage.getItem('kawitan_tasks');
    const savedUsers = localStorage.getItem('kawitan_users');
    if (savedLogs) setLogs(JSON.parse(savedLogs).reverse());
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  };

  const stats = useMemo(() => {
    const totalUnit = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const personnel = users.filter(u => u.role !== UserRole.FREELANCE).length;
    const pendingRequests = tasks.filter(t => t.status === TaskStatus.PENDING_EDIT || t.status === TaskStatus.PENDING_DELETE).length;
    return { totalUnit, completed, personnel, pendingRequests };
  }, [tasks, users]);

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-500">
      <div className="bg-blue-950 p-14 rounded-[4rem] text-white shadow-2xl relative overflow-hidden border-4 border-blue-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <div className="flex items-center space-x-4 mb-6">
               <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10"><ShieldCheck size={26} className="text-amber-400" /></div>
               <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">Panel Kendali Eksekutif</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-4 leading-none">Ringkasan Operasional.</h1>
            <p className="text-blue-200 font-bold text-xl max-w-xl leading-relaxed">Monitoring performa penagihan terpadu Elkha Dena Perkasa.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Unit (SK)" value={stats.totalUnit} trend="+12%" icon={Car} color="bg-blue-50" textColor="text-blue-700" />
        <StatCard label="Penarikan Sukses" value={stats.completed} trend="+8%" icon={CheckCircle2} color="bg-emerald-50" textColor="text-emerald-700" />
        <StatCard label="Personel Kantor" value={stats.personnel} trend="+2%" icon={Users} color="bg-blue-50" textColor="text-blue-700" />
        <StatCard label="Pengajuan Pending" value={stats.pendingRequests} trend="Review" icon={AlertTriangle} color="bg-amber-50" textColor="text-amber-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl h-96">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={chartData}>
               <defs><linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15}/><stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/></linearGradient></defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
               <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
               <Area type="monotone" dataKey="recovery" stroke="#1d4ed8" fillOpacity={1} fill="url(#colorRecovery)" strokeWidth={4} />
             </AreaChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl flex flex-col h-96 border-4 border-slate-800">
           <h3 className="text-xl font-black mb-6 flex items-center tracking-tight"><Activity className="text-blue-500 mr-3" size={24} /> Laporan Terbaru</h3>
           <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {tasks.filter(t => t.progressLogs && t.progressLogs.length > 0).slice(0, 5).map((t, i) => (
                <div key={i} className="flex space-x-4 border-b border-white/5 pb-4 last:border-0">
                   <MapPin size={14} className="text-blue-500 mt-1 shrink-0" />
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(t.progressLogs![t.progressLogs!.length-1].timestamp).toLocaleTimeString()}</p>
                      <p className="text-xs font-bold text-slate-200 truncate">Unit {t.platePrefix} {t.plateNumber}</p>
                   </div>
                </div>
              ))}
           </div>
           <Link to="/unit-progress" className="mt-6 w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 text-center transition-all">Lihat Semua Progres</Link>
        </div>
      </div>

      <section className="space-y-8">
         <h2 className="text-2xl font-black text-slate-900 flex items-center tracking-tight px-6"><History className="text-blue-700 mr-4" size={28} /> Audit Aktivitas Kemitraan (Dual-Location)</h2>
         <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-900 text-amber-400">
                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Nama Mitra</th>
                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Aksi / Otoritas</th>
                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Unit / Plat</th>
                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-center">Lokasi Mitra</th>
                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-center">Lokasi Staff (Otor)</th>
                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Staff Referal</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-6">
                              <p className="font-black text-sm text-slate-900">{log.freelanceName}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-1">{new Date(log.freelanceTime).toLocaleString()}</p>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                                 log.actionType === 'LOGIN_AUTH' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                 log.actionType === 'DOC_DOWNLOAD' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                              }`}>{log.actionType.replace(/_/g, ' ')}</span>
                           </td>
                           <td className="px-8 py-6 font-black text-xs text-slate-600 uppercase">{log.vehiclePlate || 'LOGIN SESSION'}</td>
                           <td className="px-8 py-6 text-center">
                              <a href={`https://maps.google.com?q=${log.freelanceLocation.lat},${log.freelanceLocation.lng}`} target="_blank" className="inline-flex items-center space-x-2 text-blue-600 font-bold text-[10px] hover:underline">
                                 <Navigation size={12} /> <span>LIHAT MAPS</span>
                              </a>
                           </td>
                           <td className="px-8 py-6 text-center">
                              {log.approvalLocation ? (
                                 <a href={`https://maps.google.com?q=${log.approvalLocation.lat},${log.approvalLocation.lng}`} target="_blank" className="inline-flex items-center space-x-2 text-emerald-600 font-bold text-[10px] hover:underline">
                                    <MapPin size={12} /> <span>TERLOKASI</span>
                                 </a>
                              ) : (
                                 <span className="text-[10px] font-bold text-slate-300">OTORITAS ADMIN</span>
                              )}
                           </td>
                           <td className="px-8 py-6">
                              <p className="font-black text-xs text-slate-700">{log.referralMemberName}</p>
                              <p className="text-[9px] font-bold text-slate-400">ID: {log.referralMemberId.split('-')[1]}</p>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>
    </div>
  );
};

export default HeadDashboard;