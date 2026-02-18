
import React, { useState, useEffect } from 'react';
import { 
  Activity, MapPin, Clock, Camera, Car, CheckCircle2, 
  ChevronRight, User as UserIcon, Calendar, Search, 
  ChevronDown, ExternalLink, ShieldCheck, FileText,
  Plus, History, X, MessageSquare, ArrowRight, Download
} from 'lucide-react';
import { VehicleRecoveryTask, User, TaskProgressLog, TaskStatus } from '../types';

const HeadProgressMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<VehicleRecoveryTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<VehicleRecoveryTask | null>(null);

  useEffect(() => {
    loadData();
    const int = setInterval(loadData, 5000);
    return () => clearInterval(int);
  }, []);

  const loadData = () => {
    const savedTasks = localStorage.getItem('kawitan_tasks');
    const savedUsers = localStorage.getItem('kawitan_users');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  };

  const filteredTasks = tasks.filter(t => 
    t.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.debtorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.leasingName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAgentName = (id?: string) => {
    if (!id) return "Unassigned";
    return users.find(u => u.id === id)?.name || "Petugas";
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700">
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border-4 border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-3">
               <div className="bg-emerald-500/20 p-2 rounded-xl"><Activity size={20} className="text-emerald-400" /></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Real-time Field Monitor</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Monitor Pergerakan Unit.</h1>
          </div>
          
          <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
             <div className="flex items-center space-x-3 px-4 py-2 bg-slate-100/10 rounded-xl">
                <Search className="text-slate-400" size={16} />
                <input 
                  placeholder="Cari Unit / Leasing / Debitur..." 
                  className="bg-transparent border-none outline-none font-bold text-xs w-48 text-white placeholder:text-slate-500" 
                  value={searchTerm} 
                  onChange={e=>setSearchTerm(e.target.value)} 
                />
             </div>
             <div className="hidden md:flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{filteredTasks.length} Unit Terdeteksi</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTasks.map(task => {
           const visitCount = task.progressLogs?.length || 0;
           const isDone = task.status === TaskStatus.COMPLETED;

           return (
            <div 
              key={task.id} 
              onClick={() => setSelectedTask(task)}
              className={`bg-white rounded-[2.5rem] p-6 border transition-all cursor-pointer group hover:shadow-2xl hover:-translate-y-1 relative flex flex-col justify-between h-full ${
                isDone ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 hover:border-blue-200 shadow-xl shadow-slate-200/50'
              }`}
            >
               <div className="absolute top-4 right-4 flex space-x-2">
                  {visitCount > 0 && (
                    <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center">
                      <History size={10} className="mr-1" /> {visitCount}
                    </span>
                  )}
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                    isDone ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-white border-slate-800'
                  }`}>
                    {task.status === TaskStatus.COMPLETED ? 'DONE' : task.status === TaskStatus.IN_PROGRESS ? 'PROG' : 'NEW'}
                  </span>
               </div>

               <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                      <Car size={18} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[100px]">{task.leasingName}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                    {task.platePrefix} {task.plateNumber} {task.plateSuffix}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase truncate">{task.vehicleModel}</p>
               </div>

               <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                     <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <UserIcon size={12} className="text-slate-400" />
                     </div>
                     <span className="text-[10px] font-black text-slate-600 truncate">{getAgentName(task.assignedTo).split(' ')[0]}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-700 transition-all group-hover:translate-x-1" />
               </div>
            </div>
           );
        })}

        {filteredTasks.length === 0 && (
           <div className="col-span-full bg-white p-24 rounded-[4rem] text-center border-4 border-dashed border-slate-100">
              <Activity className="text-slate-100 mx-auto mb-4" size={48} />
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Tidak ada data unit yang sesuai filter.</p>
           </div>
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-[300] flex items-center justify-end p-0 md:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedTask(null)} />
          
          <div className="relative bg-[#fdfafb] w-full max-w-2xl h-full md:h-[95vh] md:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
             <div className="p-8 md:p-10 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                         <Car size={24} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 leading-none">{selectedTask.platePrefix} {selectedTask.plateNumber} {selectedTask.plateSuffix}</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{selectedTask.vehicleModel} • {selectedTask.leasingName}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><X size={24}/></button>
                </div>

                <div className="flex items-center space-x-4">
                   <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-3">
                      <UserIcon size={16} className="text-blue-700" />
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Penanggung Jawab</p>
                        <p className="text-xs font-black text-slate-900">{getAgentName(selectedTask.assignedTo)}</p>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-3 px-6">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status Unit</p>
                        <p className="text-xs font-black text-slate-900">{selectedTask.status}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                <div className="flex items-center space-x-3 mb-8">
                   <History size={20} className="text-blue-700" />
                   <h4 className="text-lg font-black text-slate-900 tracking-tight">Kronologi Penanganan Lapangan</h4>
                </div>

                <div className="relative space-y-12">
                   <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200 rounded-full"></div>
                   
                   {selectedTask.status === TaskStatus.COMPLETED && (
                      <div className="relative pl-16 group">
                         <div className="absolute left-0 top-0 w-12 h-12 bg-emerald-600 rounded-2xl border-4 border-emerald-100 flex items-center justify-center text-white z-10 shadow-lg"><CheckCircle2 size={20}/></div>
                         <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl inline-block w-full">
                            <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest mb-1">UNIT TERESEKUSI</p>
                            <h5 className="text-xl font-black">{selectedTask.resolutionType === 'UNIT_HANDOVER' ? 'Penyerahan Unit (Tarik)' : 'Pelunasan Hutang'}</h5>
                            <p className="text-emerald-50 font-bold mt-4 italic text-sm leading-relaxed">"{selectedTask.resolutionChronology}"</p>
                            <div className="mt-6 w-full h-48 bg-white/20 rounded-[2rem] overflow-hidden border-2 border-white/20">
                               <img src={selectedTask.resolutionPhoto} className="w-full h-full object-cover" />
                            </div>
                         </div>
                      </div>
                   )}

                   {selectedTask.progressLogs?.slice().reverse().map((log, idx, arr) => (
                      <div key={log.id} className="relative pl-16 group">
                         <div className="absolute left-0 top-0 w-12 h-12 bg-white rounded-2xl border-2 border-slate-200 flex items-center justify-center text-blue-700 z-10 shadow-sm"><MapPin size={20}/></div>
                         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl inline-block w-full transition-all hover:border-blue-100">
                            <div className="flex flex-col gap-6">
                               <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                        <Clock size={10} className="mr-1" /> Kunjungan #{arr.length - idx} • {new Date(log.timestamp).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                                     </p>
                                     <a href={`https://maps.google.com?q=${log.location.lat},${log.location.lng}`} target="_blank" className="text-blue-600 hover:text-blue-800 transition-colors"><ExternalLink size={14} /></a>
                                  </div>
                                  <p className="text-slate-600 font-bold text-sm leading-relaxed">"{log.description}"</p>
                               </div>
                               <div className="w-full h-40 bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100">
                                  <img src={log.photo} className="w-full h-full object-cover" />
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}

                   <div className="relative pl-16 group">
                      <div className="absolute left-0 top-0 w-12 h-12 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center text-slate-400 z-10"><Plus size={20}/></div>
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm inline-block w-full">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                         <h5 className="text-sm font-black text-slate-900">Unit Didaftarkan Sistem</h5>
                         <p className="text-xs font-bold text-slate-500 mt-1">Berkas SK diterbitkan oleh Admin Kantor.</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                <button onClick={() => setSelectedTask(null)} className="px-8 py-4 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl">Tutup</button>
                <button className="px-10 py-4 bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 flex items-center space-x-2">
                   <Download size={14} />
                   <span>Export Report</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadProgressMonitor;