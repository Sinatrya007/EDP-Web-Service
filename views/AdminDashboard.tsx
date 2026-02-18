
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Users, Car, Clock, ChevronRight, ArrowUpRight,
  Calendar, CheckCircle2, FileText, AlertCircle, Activity, Plus, MapPin
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { VehicleRecoveryTask, TaskStatus, User, UserRole } from '../types';

const chartData = [
  { name: 'Sen', total: 10 },
  { name: 'Sel', total: 15 },
  { name: 'Rab', total: 12 },
  { name: 'Kam', total: 20 },
  { name: 'Jum', total: 18 },
  { name: 'Sab', total: 25 },
  { name: 'Min', total: 22 },
];

const StatCard = ({ label, value, subtext, icon: Icon, color, textColor }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-between h-44 hover:scale-[1.02] transition-all">
    <div className="flex items-center justify-between">
      <div className={`p-4 rounded-2xl ${color} ${textColor} shadow-lg shadow-current/10`}>
        <Icon size={24} />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">{subtext}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<VehicleRecoveryTask[]>([]);

  useEffect(() => {
    const load = () => {
      const t = localStorage.getItem('kawitan_tasks');
      if (t) setTasks(JSON.parse(t));
    };
    load();
    const int = setInterval(load, 3000);
    return () => clearInterval(int);
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const active = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ACCEPTED).length;
    const done = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    return { total, pending, active, done };
  }, [tasks]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ringkasan Operasional.</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Pusat Kendali Admin Elkha Dena Perkasa</p>
        </div>
        <Link to="/tasks" className="bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] shadow-xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center space-x-3">
          <Plus size={18} /> <span>Input SK Baru</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Unit Terdaftar" value={stats.total} subtext="Total seluruh database SK" icon={Car} color="bg-slate-100" textColor="text-slate-700" />
        <StatCard label="Antrean Tugas" value={stats.pending} subtext="Segera tugaskan ke personel" icon={Clock} color="bg-amber-50" textColor="text-amber-600" />
        <StatCard label="Sedang Diproses" value={stats.active} subtext="Unit dalam penanganan lapangan" icon={Activity} color="bg-blue-50" textColor="text-blue-600" />
        <StatCard label="Berhasil Tarik" value={stats.done} subtext="Total penyelesaian sukses" icon={CheckCircle2} color="bg-emerald-50" textColor="text-emerald-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl h-96">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={chartData}>
               <defs><linearGradient id="adminChart" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.1}/><stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/></linearGradient></defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: '800'}} />
               <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
               <Area type="monotone" dataKey="total" stroke="#1d4ed8" fillOpacity={1} fill="url(#adminChart)" strokeWidth={4} />
             </AreaChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl border-4 border-slate-800 flex flex-col h-96">
           <h3 className="text-lg font-black tracking-tight flex items-center mb-6"><Activity className="text-blue-500 mr-3" size={20} /> Aktivitas</h3>
           <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {tasks.filter(t => t.progressLogs?.length).slice(0, 5).map((log, i) => (
                <div key={i} className="flex space-x-4 border-b border-white/5 pb-4 last:border-0">
                  <MapPin size={14} className="text-blue-500 shrink-0" />
                  <p className="text-xs font-bold text-slate-200">Unit {log.platePrefix} {log.plateNumber}</p>
                </div>
              ))}
           </div>
           <Link to="/unit-progress" className="mt-6 w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 text-center transition-all">Lihat Semua Progres</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;