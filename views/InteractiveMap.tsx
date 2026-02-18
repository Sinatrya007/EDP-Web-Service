
import React from 'react';
import { MapPin, Users, Navigation, Info, Radio } from 'lucide-react';
import { User, UserRole } from '../types';

interface InteractiveMapProps {
  agents: User[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ agents }) => {
  const activeAgents = agents.filter(a => a.role === UserRole.AGENT && a.status === 'active');

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Agent Tracking</h1>
          <p className="text-slate-500">Real-time GPS location of field personnel</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
          <Radio size={16} className="animate-pulse" />
          <span className="text-sm font-bold">System Online</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Map Area */}
        <div className="lg:col-span-3 bg-slate-200 rounded-[2rem] border border-slate-300 relative overflow-hidden shadow-inner flex items-center justify-center">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative w-full h-full p-12">
            <div className="w-full h-full bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center flex-col text-slate-400">
              <MapPin size={48} className="mb-4 opacity-50" />
              <p className="font-bold">Interactive Map Grid</p>
              <p className="text-sm">Pins represent live agent locations based on phone GPS</p>
            </div>

            {/* Simulated Agent Pins */}
            {activeAgents.map((agent, i) => (
              <div 
                key={agent.id}
                className="absolute transition-all duration-1000 group cursor-pointer"
                style={{ 
                  left: `${20 + (i * 15)}%`, 
                  top: `${30 + (i * 10)}%` 
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-25"></div>
                  <div className="relative bg-white p-1 rounded-full shadow-xl border-2 border-indigo-600">
                    <img src={agent.avatar} className="w-10 h-10 rounded-full" alt={agent.name} />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl">
                      {agent.name}
                      <div className="text-[10px] text-slate-400 font-medium">Lat: -6.214, Lng: 106.845</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
            <button className="p-3 bg-white text-slate-600 rounded-xl shadow-lg hover:bg-slate-50 border border-slate-100">+</button>
            <button className="p-3 bg-white text-slate-600 rounded-xl shadow-lg hover:bg-slate-50 border border-slate-100">-</button>
            <button className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 border border-indigo-500">
              <Navigation size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-y-auto">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center">
            <Users size={18} className="mr-2 text-indigo-500" />
            Field Units ({activeAgents.length})
          </h3>
          
          <div className="space-y-4">
            {activeAgents.map(agent => (
              <div key={agent.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <img src={agent.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{agent.name}</p>
                    <p className="text-[10px] font-black uppercase text-indigo-600">Active Duty</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-t border-slate-200 pt-3">
                  <span className="flex items-center">
                    <Radio size={10} className="mr-1 text-emerald-500" />
                    Last seen: 2m ago
                  </span>
                  <span className="text-indigo-600">ID: {agent.id.split('-')[1] || '001'}</span>
                </div>
              </div>
            ))}
            {activeAgents.length === 0 && (
              <div className="text-center p-8">
                <Info size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No agents currently broadcasting location</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
