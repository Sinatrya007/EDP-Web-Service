
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  PlusCircle, X, Car, UserPlus, FileUp, ChevronDown, RefreshCw, Hash, 
  CheckCircle2, FileSearch, Download, Search, Paperclip, ClipboardCheck, Wrench, Plus, Trash2, Edit,
  Briefcase, ChevronRight, AlertTriangle, User as UserIcon, FileText, Info,
  Clock, ClipboardList, Layers
} from 'lucide-react';
import { TaskStatus, VehicleRecoveryTask, User, UserRole, TaskDocument } from '../types';

// DATABASE KENDARAAN KOMPREHENSIF (MASIF)
const VEHICLE_DB: Record<string, string[]> = {
  'Toyota': [
    'Avanza 1.3 E M/T', 'Avanza 1.3 E A/T', 'Avanza 1.5 G M/T', 'Avanza 1.5 G CVT', 'Veloz 1.5 M/T', 'Veloz 1.5 Q CVT', 'Veloz 1.5 Q CVT TSS',
    'Innova Reborn 2.0 G M/T', 'Innova Reborn 2.0 G A/T', 'Innova Reborn 2.4 G Diesel M/T', 'Innova Reborn 2.4 G Diesel A/T', 'Innova Reborn 2.4 V Diesel A/T',
    'Innova Zenix 2.0 G CVT', 'Innova Zenix 2.0 V CVT', 'Innova Zenix 2.0 G Hybrid', 'Innova Zenix 2.0 V Hybrid', 'Innova Zenix 2.0 Q Hybrid TSS',
    'Fortuner 2.4 G Diesel M/T', 'Fortuner 2.4 VRZ Diesel A/T', 'Fortuner 2.7 SRZ A/T', 'Fortuner 2.8 VRZ Diesel A/T', 'Fortuner 2.8 GR Sport 4x4',
    'Rush 1.5 G M/T', 'Rush 1.5 G A/T', 'Rush 1.5 S M/T GR Sport', 'Rush 1.5 S A/T GR Sport',
    'Agya 1.2 G M/T', 'Agya 1.2 G CVT', 'Agya 1.2 GR Sport CVT',
    'Calya 1.2 E M/T', 'Calya 1.2 G M/T', 'Calya 1.2 G A/T',
    'Alphard 2.5 X CVT', 'Alphard 2.5 G CVT', 'Alphard 3.5 Q A/T', 'Alphard 2.5 Hybrid',
    'Vellfire 2.5 G CVT', 'Vellfire VIP',
    'Voxy 2.0 CVT', 'Corolla Cross Hybrid', 'Camry 2.5 V A/T', 'Camry Hybrid', 'Yaris 1.5 S M/T GR Sport', 'Yaris 1.5 S CVT GR Sport',
    'Hilux Single Cab', 'Hilux Double Cab 2.4 G 4x4', 'Hilux GR Sport', 'Land Cruiser 300 VX-R', 'Raize 1.0T G CVT', 'Raize 1.0T GR Sport TSS'
  ],
  'Honda': [
    'Brio Satya S M/T', 'Brio Satya E M/T', 'Brio Satya E CVT', 'Brio RS M/T', 'Brio RS CVT',
    'HR-V 1.5 S CVT', 'HR-V 1.5 E CVT', 'HR-V 1.5 SE CVT', 'HR-V 1.5 Turbo RS',
    'CR-V 2.0 i-VTEC', 'CR-V 1.5 Turbo', 'CR-V 1.5 Turbo Prestige', 'CR-V 2.0 Hybrid RS',
    'BR-V S M/T', 'BR-V E M/T', 'BR-V E CVT', 'BR-V Prestige CVT', 'BR-V Prestige CVT TSS (N7X)',
    'WR-V E M/T', 'WR-V E CVT', 'WR-V RS CVT', 'WR-V RS CVT TSS',
    'Mobilio S M/T', 'Mobilio E M/T', 'Mobilio E CVT', 'Mobilio RS CVT',
    'City Hatchback RS M/T', 'City Hatchback RS CVT', 'Civic RS 1.5 Turbo', 'Accord 1.5 Turbo', 'Accord Hybrid'
  ],
  'Mitsubishi': [
    'Xpander Exceed M/T', 'Xpander Exceed CVT', 'Xpander Sport M/T', 'Xpander Sport CVT', 'Xpander Ultimate CVT',
    'Xpander Cross M/T', 'Xpander Cross Premium CVT',
    'Pajero Sport Exceed 4x2 A/T', 'Pajero Sport Dakar 4x2 A/T', 'Pajero Sport Dakar Ultimate 4x2 A/T', 'Pajero Sport Dakar Ultimate 4x4 A/T',
    'L300 Pick Up Euro 4', 'Triton Single Cab', 'Triton Double Cab HDX', 'Triton Double Cab GLS', 'Triton Double Cab Exceed', 'Triton Double Cab Ultimate',
    'Outlander Sport PX', 'Mirage Exceed A/T'
  ],
  'Daihatsu': [
    'Xenia 1.3 M M/T', 'Xenia 1.3 R M/T', 'Xenia 1.3 R CVT', 'Xenia 1.5 R M/T', 'Xenia 1.5 R CVT ADS',
    'Terios X M/T', 'Terios X A/T', 'Terios R M/T', 'Terios R A/T Custom',
    'Sigra 1.0 D M/T', 'Sigra 1.0 M M/T', 'Sigra 1.2 X M/T', 'Sigra 1.2 X A/T', 'Sigra 1.2 R M/T', 'Sigra 1.2 R A/T Deluxe',
    'Ayla 1.0 M M/T', 'Ayla 1.0 X M/T', 'Ayla 1.2 R M/T', 'Ayla 1.2 R CVT ADS',
    'Gran Max Pick Up 1.3', 'Gran Max Pick Up 1.5 AC PS', 'Gran Max Blind Van', 'Gran Max MB 1.3 Face to Face',
    'Luxio 1.5 D M/T', 'Luxio 1.5 X M/T', 'Luxio 1.5 X A/T',
    'Sirion 1.3 X CVT', 'Sirion 1.3 R CVT', 'Rocky 1.2 M M/T', 'Rocky 1.2 X CVT', 'Rocky 1.0 R Turbo CVT ASA'
  ],
  'Suzuki': [
    'Ertiga GA M/T', 'Ertiga GL M/T', 'Ertiga GL A/T', 'Ertiga GX Hybrid M/T', 'Ertiga GX Hybrid A/T', 'Ertiga Cruise Hybrid',
    'XL7 Zeta M/T', 'XL7 Beta Hybrid A/T', 'XL7 Alpha Hybrid A/T',
    'Carry Pick Up Wide Deck', 'Carry Pick Up Flat Deck',
    'Baleno 1.5 A/T', 'Ignis GX A/T', 'S-Presso M/T', 'S-Presso AGS',
    'Jimny 1.5 M/T (3-Door)', 'Jimny 1.5 A/T (3-Door)', 'Jimny 1.5 A/T (5-Door)',
    'Grand Vitara GX Hybrid'
  ],
  'Hyundai': [
    'Stargazer Active M/T', 'Stargazer Trend CVT', 'Stargazer Style CVT', 'Stargazer Prime CVT', 'Stargazer X Prime',
    'Creta Active M/T', 'Creta Trend CVT', 'Creta Style CVT', 'Creta Prime CVT', 'Creta Alpha',
    'Ioniq 5 Prime Standard', 'Ioniq 5 Signature Long Range', 'Ioniq 6 Signature',
    'Palisade Prime', 'Palisade Signature 4x2', 'Palisade Signature 4x4',
    'Santa Fe Prime Diesel', 'Santa Fe Signature Gasoline', 'Staria Signature 7', 'Staria Signature 9'
  ],
  'Wuling': [
    'Air EV Lite', 'Air EV Standard Range', 'Air EV Long Range',
    'Binguo EV Long Range (333 KM)', 'Binguo EV Premium Range (410 KM)',
    'Cloud EV 460 KM',
    'Almaz 1.5T SE M/T', 'Almaz 1.5T EX CVT', 'Almaz RS Pro CVT', 'Almaz Hybrid',
    'Confero S 1.5 C M/T', 'Confero S 1.5 L M/T MY',
    'Cortez 1.5T CE CVT', 'Cortez 1.5T EX CVT', 'Formo S'
  ],
  'Mazda': [
    'Mazda 2 Hatchback GT', 'Mazda 2 Sedan', 'Mazda 3 Hatchback', 'Mazda 3 Sedan',
    'CX-3 1.5 Sport', 'CX-3 2.0 Pro', 'CX-30 GT', 'CX-5 Elite', 'CX-5 Kuro Edition',
    'CX-8 Elite', 'CX-9 Kuro Edition', 'CX-60 Elite', 'CX-60 Kuro'
  ],
  'BMW': [
    '218i Gran Coupe Sport', '320i Sport', '330i M Sport', '520i Luxury Line', '530i M Sport',
    '735i M Sport', 'X1 sDrive18i xLine', 'X3 sDrive20i', 'X5 xDrive40i xLine', 'X7 xDrive40i Opulence',
    'i4 eDrive40', 'iX xDrive40'
  ],
  'Mercedes-Benz': [
    'A200 Progressive Line', 'C200 Avantgarde Line', 'C300 AMG Line', 'E200 Avantgarde', 'E300 AMG Line',
    'S450 Luxury', 'GLA 200 AMG Line', 'GLB 200 Progressive Line', 'GLC 300 AMG Line', 'GLE 450 AMG Line', 'GLS 450 AMG Line',
    'EQE 350+ Electric', 'EQS 450+ Electric'
  ],
  'Nissan': [
    'Livina EL M/T', 'Livina VE CVT', 'Livina VL CVT',
    'Serena Highway Star (C27)', 'Serena e-Power (C28)',
    'Terra 2.5 VL 4x4', 'X-Trail 2.5 VL', 'Magnite Upper M/T', 'Magnite Premium CVT', 'Kicks e-Power'
  ],
  'Isuzu': [
    'Panther LV', 'Panther LS', 'Panther Grand Touring',
    'MU-X 1.9 4x4 A/T', 'Traga Pick Up', 'Traga Box', 'D-Max Single Cab', 'D-Max Double Cab Rodeo',
    'Elf NLR', 'Elf NMR', 'Giga FVR'
  ],
  'Kia': [
    'Sonet Premiere IVT', 'Seltos EXP', 'Carens 1.5 Premiere', 'Grand Carnival Premiere (11-Seater)',
    'EV6 GT-Line', 'EV9 GT-Line'
  ],
  'Chery': [
    'Tiggo 7 Pro Comfort', 'Tiggo 7 Pro Luxury', 'Tiggo 8 Pro Luxury', 'Tiggo 8 Pro Premium',
    'Omoda 5 Z', 'Omoda 5 RZ', 'Omoda 5 GT AWD', 'Omoda E5 (Electric)'
  ],
  'MG': [
    'MG ZS Activate', 'MG ZS Ignite', 'MG HS Activate', 'MG HS Magnify', 'MG 4 EV Magnify', 'MG 5 GT Magnify'
  ],
  'Ford': [
    'Ranger Base 4x4', 'Ranger XLT', 'Ranger Wildtrak 4x4', 'Ranger Raptor', 'Everest Titanium 4x4'
  ],
  'Chevrolet': [
    'Captiva 2.0 Diesel A/T', 'Trax 1.4 Turbo', 'Trailblazer 2.5 LTZ', 'Orlando 2.4 A/T', 'Aveo 1.4'
  ],
  'Subaru': [
    'Forester S EyeSight', 'XV S EyeSight', 'BRZ M/T', 'BRZ A/T', 'WRX Sedan tS EyeSight'
  ],
  'Lainnya': []
};

const COLORS_DB = ['Hitam Metalik', 'Putih Mutiara', 'Silver', 'Abu-abu Metalik', 'Merah Solid', 'Biru Tua', 'Coklat Metalik', 'Kuning', 'Hijau Army', 'Orange'];
const YEARS_DB = Array.from({ length: 26 }, (_, i) => (2025 - i).toString());
const LEASING_DB = ['BCA Finance', 'Adira Finance', 'FIF Group', 'ACC (Astra Credit)', 'Mandiri Utama Finance', 'OTO Finance', 'Clipan Finance', 'CIMB Niaga Auto', 'Maybank Finance', 'Mega Auto Finance', 'Buana Finance', 'SMS Finance'];

const SearchableDropdown: React.FC<{ 
  label: string, 
  options: string[], 
  value: string, 
  onChange: (val: string) => void,
  placeholder?: string,
  icon?: any
}> = ({ label, options, value, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${isOpen ? 'bg-white border-blue-700 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-100 font-bold'}`}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          {Icon && <Icon size={18} className="text-slate-400" />}
          <span className="truncate">{value || placeholder || 'Pilih...'}</span>
        </div>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[350] top-full mt-2 w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-50 flex items-center space-x-2 bg-slate-50">
            <Search size={14} className="text-slate-400" />
            <input 
              autoFocus
              placeholder="Cari atau ketik lainnya..." 
              className="bg-transparent border-none outline-none text-xs font-bold w-full"
              value={search}
              // Fixed: setSearch instead of undefined setSearchTerm
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filtered.map(opt => (
              <div 
                key={opt} 
                onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                className="px-6 py-3.5 hover:bg-blue-50 hover:text-blue-700 text-sm font-bold cursor-pointer"
              >
                {opt}
              </div>
            ))}
            {search && !options.some(o => o.toLowerCase() === search.toLowerCase()) && (
              <div 
                onClick={() => { onChange(search); setIsOpen(false); setSearch(''); }}
                className="px-6 py-4 bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest cursor-pointer"
              >
                + Tambah "{search}" (Lainnya)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TaskManagement: React.FC<{ user: User, setNotifications: any }> = ({ user, setNotifications }) => {
  const [tasks, setTasks] = useState<VehicleRecoveryTask[]>([]);
  const [operatives, setOperatives] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<VehicleRecoveryTask | null>(null);
  const [assigningTask, setAssigningTask] = useState<VehicleRecoveryTask | null>(null);
  const [viewingTaskDocs, setViewingTaskDocs] = useState<VehicleRecoveryTask | null>(null);
  // Added missing search state
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({ 
    leasingName: '', vehicleBrand: '', vehicleModel: '', vehicleYear: '', vehicleColor: '',
    platePrefix: '', plateNumber: '', plateSuffix: '', chassisNumber: '', engineNumber: ''
  });

  const INITIAL_DOC_GROUPS = [
    { id: 'sk', category: 'Surat Kuasa Penarikan', files: [], isMandatory: true },
    { id: 'bpkb', category: 'Fotocopy BPKB', files: [], isMandatory: true },
    { id: 'stnk', category: 'Fotocopy STNK', files: [], isMandatory: true },
    { id: 'fidusia', category: 'Sertifikat Fidusia', files: [], isMandatory: true },
    { id: 'history', category: 'History Payment', files: [], isMandatory: true },
    { id: 'other-1', category: 'Berkas Tambahan 1', files: [], isMandatory: false },
    { id: 'other-2', category: 'Berkas Tambahan 2', files: [], isMandatory: false },
    { id: 'other-3', category: 'Berkas Tambahan 3', files: [], isMandatory: false },
    { id: 'other-4', category: 'Berkas Tambahan 4', files: [], isMandatory: false },
    { id: 'other-5', category: 'Berkas Tambahan 5', files: [], isMandatory: false },
  ];

  const [docGroups, setDocGroups] = useState(INITIAL_DOC_GROUPS);

  const isHead = user.role === UserRole.HEAD;

  useEffect(() => {
    loadData();
    const int = setInterval(loadData, 3000);
    return () => clearInterval(int);
  }, []);

  const loadData = () => {
    const t = localStorage.getItem('kawitan_tasks');
    const u = localStorage.getItem('kawitan_users');
    if (t) setTasks(JSON.parse(t));
    if (u) setOperatives(JSON.parse(u).filter((x: User) => x.role !== UserRole.HEAD && x.status === 'active'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, groupId: string) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDoc: TaskDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: file.type,
          data: event.target?.result as string,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.name,
          category: docGroups.find(g => g.id === groupId)?.category || 'Lainnya'
        };

        setDocGroups(prev => prev.map(group => 
          group.id === groupId ? { ...group, files: [...group.files, newDoc] } : group
        ));
      };
      reader.readAsDataURL(file);
    });
  };

  const addOtherDocSlot = () => {
    setDocGroups(prev => {
      const currentOthersCount = prev.filter(g => g.id.startsWith('other')).length;
      const newGroup = { 
        id: `other-${Date.now()}`, 
        category: `Berkas Tambahan ${currentOthersCount + 1}`, 
        files: [], 
        isMandatory: false 
      };
      return [...prev, newGroup];
    });
  };

  const removeDocSlot = (groupId: string) => {
    const groupToRemove = docGroups.find(g => g.id === groupId);
    if (!groupToRemove || groupToRemove.isMandatory) return;
    
    if (window.confirm(`Hapus kolom "${groupToRemove.category}"?`)) {
      setDocGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  const handleSave = () => {
    if (!formData.plateNumber || !formData.leasingName) return alert("Leasing dan Plat Nomor wajib diisi.");
    const allDocs = docGroups.flatMap(g => g.files);
    
    let updatedTasks: VehicleRecoveryTask[];
    if (editingTask) {
      if (isHead) {
        // Direktur Utama langsung update data live
        updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...t, ...formData, documents: allDocs } : t);
      } else {
        // Admin mengajukan perubahan (data asli tetap dipertahankan, perubahan masuk ke pendingEdit)
        updatedTasks = tasks.map(t => t.id === editingTask.id ? { 
          ...t, 
          status: TaskStatus.PENDING_EDIT, 
          pendingEdit: { ...formData, documents: allDocs } 
        } : t);
      }
      alert(isHead ? "Data unit telah diperbarui." : "Perubahan data unit telah diajukan kepada Direktur.");
    } else {
      // Pendaftaran Baru
      const newTask: VehicleRecoveryTask = { 
        id: `task-${Date.now()}`, ...formData, status: TaskStatus.PENDING, 
        createdAt: new Date().toISOString(), documents: allDocs, progressLogs: [] 
      };
      updatedTasks = [newTask, ...tasks];
      alert("Unit berhasil didaftarkan.");
    }
    
    localStorage.setItem('kawitan_tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (task: VehicleRecoveryTask) => {
    const message = task.status === TaskStatus.PENDING || isHead 
      ? `Hapus unit ${task.plateNumber} secara permanen?` 
      : `Ajukan penghapusan unit ${task.plateNumber} ke Direktur?`;

    if (window.confirm(message)) {
      let updated: VehicleRecoveryTask[];
      if (task.status === TaskStatus.PENDING || isHead) {
        updated = tasks.filter(t => t.id !== task.id);
        alert("Unit berhasil dihapus.");
      } else {
        updated = tasks.map(t => t.id === task.id ? { ...t, status: TaskStatus.PENDING_DELETE } : t);
        alert("Permintaan penghapusan unit telah dikirim ke Direktur.");
      }
      localStorage.setItem('kawitan_tasks', JSON.stringify(updated));
      setTasks(updated);
    }
  };

  const resetForm = () => {
    setFormData({ leasingName: '', vehicleBrand: '', vehicleModel: '', vehicleYear: '', vehicleColor: '', platePrefix: '', plateNumber: '', plateSuffix: '', chassisNumber: '', engineNumber: '' });
    setDocGroups(INITIAL_DOC_GROUPS);
    setEditingTask(null);
  };

  const currentModels = useMemo(() => {
    return VEHICLE_DB[formData.vehicleBrand] || [];
  }, [formData.vehicleBrand]);

  // Unified logic for task list rendering with search support
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leasingName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pusat Data Unit & SK</h1>
          <p className="text-slate-500 font-bold mt-1">Sistem Administrasi Piutang Kendaraan Elkha Dena Perkasa</p>
        </div>
        {!isHead && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] shadow-xl font-black text-xs uppercase tracking-widest active:scale-95 flex items-center space-x-3 transition-transform">
            <PlusCircle size={20} /> <span>Daftarkan Unit Baru</span>
          </button>
        )}
      </div>

      {/* Added Main Search Interface */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            placeholder="Cari Unit, Plat Nomor, atau Leasing..." 
            className="w-full bg-slate-50 p-5 pl-16 rounded-[2rem] border-2 border-transparent focus:border-blue-700 focus:bg-white outline-none font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-amber-400">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Objek Unit</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Leasing & Instansi</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-24 text-center text-slate-400 font-bold italic">Belum ada unit yang terdaftar.</td></tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-sm"><Car size={24} /></div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase">{task.platePrefix} {task.plateNumber} {task.plateSuffix}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{task.vehicleBrand} {task.vehicleModel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-bold text-slate-900">{task.leasingName}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{task.vehicleYear || '-'} • {task.vehicleColor || '-'}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                         task.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 
                         task.status === TaskStatus.PENDING_DELETE ? 'bg-red-100 text-red-700 animate-pulse' : 
                         task.status === TaskStatus.PENDING_EDIT ? 'bg-amber-100 text-amber-700 animate-pulse' :
                         'bg-slate-100 text-slate-500'
                       }`}>
                         {task.status.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex items-center justify-center space-x-1">
                          <button onClick={(e) => { e.stopPropagation(); setViewingTaskDocs(task); }} className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors"><FileSearch size={20}/></button>
                          {!isHead && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setAssigningTask(task); }} className="p-2.5 text-slate-400 hover:text-blue-700 transition-colors"><UserPlus size={20} /></button>
                              <button onClick={(e) => { 
                                e.stopPropagation();
                                setEditingTask(task); 
                                setFormData({...task}); 
                                setDocGroups(INITIAL_DOC_GROUPS.map(g => ({...g, files: task.documents.filter(f => f.category === g.category)}))); 
                                setShowModal(true); 
                              }} className="p-2.5 text-slate-400 hover:text-amber-600 transition-colors"><Edit size={20}/></button>
                              
                              <button 
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation(); 
                                  handleDelete(task); 
                                }} 
                                className="p-2.5 text-slate-400 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={20}/>
                              </button>
                            </>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col min-h-fit animate-in zoom-in-95 my-auto">
             
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-blue-700 text-white shrink-0 sticky top-0 z-10">
                <div className="flex items-center space-x-6">
                   <div className="p-3 bg-white/10 rounded-2xl"><ClipboardList size={32}/></div>
                   <div>
                      <h3 className="text-2xl font-black tracking-tight">{editingTask ? 'Edit Data Unit Penugasan' : 'Pendaftaran Unit Penugasan Baru'}</h3>
                      <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1">Elkha Dena Perkasa • Operational Management System</p>
                   </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={32}/></button>
             </div>

             <div className="p-12 space-y-16">
                <section className="space-y-8">
                   <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center"><Briefcase size={20}/></div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">I. Informasi Klien & Leasing</h4>
                   </div>
                   <div className="max-w-xl">
                      <SearchableDropdown label="PILIH NAMA LEASING / INSTANSI" options={LEASING_DB} value={formData.leasingName} onChange={v => setFormData({...formData, leasingName: v})} icon={Briefcase} />
                   </div>
                </section>

                <section className="space-y-10">
                   <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center"><Car size={20}/></div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">II. Identitas Fisik Kendaraan</h4>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <SearchableDropdown label="MEREK KENDARAAN" options={Object.keys(VEHICLE_DB)} value={formData.vehicleBrand} onChange={v => setFormData({...formData, vehicleBrand: v, vehicleModel: ''})} icon={Car} />
                      <SearchableDropdown label="TIPE / MODEL" options={currentModels} value={formData.vehicleModel} onChange={v => setFormData({...formData, vehicleModel: v})} icon={Search} placeholder={formData.vehicleBrand ? "Pilih Tipe..." : "Pilih Merek Dulu"} />
                      <SearchableDropdown label="WARNA" options={COLORS_DB} value={formData.vehicleColor} onChange={v => setFormData({...formData, vehicleColor: v})} icon={RefreshCw} />
                      <SearchableDropdown label="TAHUN" options={YEARS_DB} value={formData.vehicleYear} onChange={v => setFormData({...formData, vehicleYear: v})} icon={Clock} />
                   </div>

                   <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-12">
                      <div className="space-y-4 text-center">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block w-full">NOMOR PLAT KENDARAAN (BARIS MANDIRI)</label>
                         <div className="flex space-x-4 justify-center">
                            <input placeholder="B" className="w-24 bg-white p-6 rounded-3xl border-2 border-slate-200 font-black text-center uppercase text-2xl shadow-md outline-none focus:border-blue-700" value={formData.platePrefix} onChange={e=>setFormData({...formData, platePrefix: e.target.value.toUpperCase()})} maxLength={2} />
                            <input placeholder="1234" className="w-48 bg-white p-6 rounded-3xl border-2 border-slate-200 font-black text-center text-2xl shadow-md outline-none focus:border-blue-700" value={formData.plateNumber} onChange={e=>setFormData({...formData, plateNumber: e.target.value})} maxLength={5} />
                            <input placeholder="ABC" className="w-32 bg-white p-6 rounded-3xl border-2 border-slate-200 font-black text-center uppercase text-2xl shadow-md outline-none focus:border-blue-700" value={formData.plateSuffix} onChange={e=>setFormData({...formData, plateSuffix: e.target.value.toUpperCase()})} maxLength={4} />
                         </div>
                      </div>

                      <div className="border-t border-slate-200 pt-10 grid grid-cols-1 gap-10">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NOMOR MESIN (NOSIN) - BARIS MANDIRI</label>
                            <div className="relative">
                               <input placeholder="KETIK NOMOR MESIN..." className="w-full bg-white p-6 rounded-3xl border-2 border-slate-200 font-black outline-none focus:border-blue-700 pl-16 text-xl shadow-md uppercase tracking-widest" value={formData.engineNumber} onChange={e=>setFormData({...formData, engineNumber: e.target.value.toUpperCase()})} />
                               <Wrench className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NOMOR RANGKA (NOKA) - BARIS MANDIRI</label>
                            <div className="relative">
                               <input placeholder="KETIK NOMOR RANGKA..." className="w-full bg-white p-6 rounded-3xl border-2 border-slate-200 font-black outline-none focus:border-blue-700 pl-16 text-xl shadow-md uppercase tracking-widest" value={formData.chassisNumber} onChange={e=>setFormData({...formData, chassisNumber: e.target.value.toUpperCase()})} />
                               <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                            </div>
                         </div>
                      </div>
                   </div>
                </section>

                <section className="space-y-10">
                   <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center"><FileUp size={20}/></div>
                         <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">III. Berkas Dokumen & Lampiran SK</h4>
                      </div>
                      <button onClick={addOtherDocSlot} className="text-blue-700 font-black text-[10px] uppercase tracking-widest flex items-center bg-blue-50 px-6 py-3 rounded-full hover:bg-blue-100 transition-all">
                        <Plus size={16} className="mr-2"/> Tambah Lampiran Lainnya
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                      {docGroups.map((group) => (
                        <div key={group.id} className="relative group/doc bg-white border-2 border-dashed rounded-[3rem] p-8 flex flex-col items-center justify-center space-y-5 transition-all hover:bg-slate-50 cursor-pointer min-h-[220px]">
                           
                           {!group.isMandatory && (
                             <button 
                               type="button"
                               onMouseDown={(e) => { 
                                 e.preventDefault();
                                 e.stopPropagation(); 
                                 removeDocSlot(group.id); 
                               }}
                               className="absolute -top-3 -right-3 w-10 h-10 bg-blue-700 text-white rounded-full shadow-2xl border-4 border-white flex items-center justify-center z-[100] transition-all scale-90 hover:scale-110 active:scale-95 pointer-events-auto"
                               title="Hapus Kolom Lampiran Ini"
                             >
                               <Trash2 size={18} />
                             </button>
                           )}

                           {group.files.length > 0 ? (
                             <>
                               <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg"><CheckCircle2 size={32}/></div>
                               <div className="text-center">
                                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-tighter leading-tight mb-2">{group.category}</p>
                                  <span className="bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase">SUDAH TERISI ({group.files.length})</span>
                               </div>
                               <div className="absolute inset-0 bg-white/95 rounded-[3rem] flex flex-col items-center justify-center space-y-3 opacity-0 group-hover/doc:opacity-100 transition-opacity z-[40]">
                                  <label className="cursor-pointer bg-blue-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-blue-800 transition-all flex items-center">
                                     <RefreshCw size={14} className="mr-2"/> Ganti / Tambah
                                     <input type="file" multiple hidden onChange={(e) => handleFileUpload(e, group.id)} />
                                  </label>
                                  <button onMouseDown={(e) => { e.stopPropagation(); setDocGroups(prev => prev.map(g => g.id === group.id ? {...g, files: []} : g)); }} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-700">Kosongkan Berkas</button>
                               </div>
                             </>
                           ) : (
                             <>
                               <Paperclip size={36} className="text-slate-200" />
                               <div className="text-center">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight mb-3">{group.category}</p>
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${group.isMandatory ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                     {group.isMandatory ? 'Wajib/Informatif' : 'Opsional'}
                                  </span>
                               </div>
                               <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-[10]" onChange={(e) => handleFileUpload(e, group.id)} />
                               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border-2 border-slate-100"><Plus size={18}/></div>
                             </>
                           )}
                        </div>
                      ))}
                   </div>
                   
                   <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-100 flex items-start space-x-6">
                      <div className="p-4 bg-white text-amber-600 rounded-2xl shadow-sm border border-amber-100"><Info size={28}/></div>
                      <div>
                         <p className="text-sm font-black text-amber-800 uppercase tracking-widest mb-1">Catatan Dokumen</p>
                         <p className="text-xs font-bold text-amber-700 leading-relaxed uppercase opacity-80 text-justify">Dokumen yang bertanda "Wajib/Informatif" sebaiknya segera dilengkapi agar petugas lapangan memiliki kekuatan hukum yang sah saat menjalankan tugas penarikan. Gunakan tombol biru di pojok kanan atas setiap kartu lampiran tambahan untuk menghapusnya.</p>
                      </div>
                   </div>
                </section>
             </div>

             <div className="p-10 border-t border-slate-50 bg-slate-50 flex justify-end space-x-6 shrink-0 sticky bottom-0 z-10">
                <button onClick={() => setShowModal(false)} className="px-12 py-5 bg-white text-slate-400 font-black text-xs uppercase rounded-[2rem] border-2 border-slate-100 transition-all hover:bg-slate-50 shadow-sm">Batal</button>
                <button onClick={handleSave} className="px-24 py-6 bg-blue-700 text-white font-black text-sm uppercase rounded-[2.5rem] shadow-2xl flex items-center space-x-5 transition-all hover:bg-blue-800 active:scale-95 ring-4 ring-blue-100">
                   <ClipboardCheck size={28}/> <span>{editingTask ? 'Simpan Perubahan Unit' : 'Daftarkan & Kirim SK'}</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {viewingTaskDocs && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8">
             <div className="p-10 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Arsip Berkas Digital</h3>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Unit: {viewingTaskDocs.platePrefix} {viewingTaskDocs.plateNumber} {viewingTaskDocs.plateSuffix}</p>
                </div>
                <button onClick={() => setViewingTaskDocs(null)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all"><X size={32}/></button>
             </div>
             <div className="flex-1 overflow-y-auto p-12 bg-slate-50 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {viewingTaskDocs.documents.map(d => (
                     <div key={d.id} className="bg-white p-6 rounded-[3rem] shadow-xl border border-slate-100 group relative">
                       <img src={d.data} className="aspect-[4/3] w-full rounded-[2.5rem] object-contain bg-slate-900 mb-6 border-2 border-slate-100 shadow-inner" alt={d.name} />
                       <div className="px-2">
                         <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full mb-3 inline-block">{d.category}</span>
                         <p className="text-sm font-bold text-slate-900 truncate">{d.name}</p>
                         <div className="mt-6 flex items-center justify-between">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(d.uploadedAt).toLocaleDateString()}</p>
                            <a href={d.data} download={d.name} className="flex items-center text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"><Download size={14} className="mr-2"/> Unduh</a>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {assigningTask && (
        <div className="fixed inset-0 z-[510] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="relative bg-white w-full max-w-md rounded-[4rem] p-12 shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95">
            <h3 className="text-3xl font-black text-slate-900 mb-10 text-center shrink-0 tracking-tight">Pilih Personel</h3>
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {operatives.map(agent => (
                <button key={agent.id} onClick={() => {
                  const updated = tasks.map(t => t.id === assigningTask.id ? { ...t, assignedTo: agent.id, status: TaskStatus.ASSIGNED } : t);
                  localStorage.setItem('kawitan_tasks', JSON.stringify(updated));
                  setTasks(updated);
                  setAssigningTask(null);
                  alert(`Unit ${assigningTask.plateNumber} ditugaskan ke ${agent.name}.`);
                }} className="w-full flex items-center p-6 bg-slate-50 rounded-[2.5rem] hover:bg-blue-700 hover:text-white border-2 border-transparent transition-all text-left group">
                  <img src={agent.avatar} className="w-14 h-14 rounded-2xl mr-6 shadow-sm bg-white" alt="" />
                  <div className="flex-1">
                    <span className="font-black text-slate-900 block text-lg group-hover:text-white">{agent.name}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-200">{agent.role}</span>
                  </div>
                  <ChevronRight size={24} className="text-slate-300 group-hover:text-white" />
                </button>
              ))}
            </div>
            <button onClick={() => setAssigningTask(null)} className="mt-8 w-full py-5 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-blue-700 transition-colors">Batal</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
