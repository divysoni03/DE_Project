import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Building2, Plus, Trash2, MapPin, Users, Info } from 'lucide-react';

export default function AdminShelters() {
  const { shelters, addShelter, removeShelter } = useDatabase();
  const [showAddModal, setShowAddModal] = useState(false);

  // New shelter state
  const [name, setName] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [capacity, setCapacity] = useState<number | ''>('');

  const handleAddShelter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || lat === '' || lng === '' || capacity === '') return;

    addShelter({
      name,
      lat: Number(lat),
      lng: Number(lng),
      capacity: Number(capacity),
      currentOccupancy: 0
    });

    // Reset form
    setName('');
    setLat('');
    setLng('');
    setCapacity('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-500" />
            Shelter Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage emergency evacuation centers and capacities.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Shelter
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Shelters</p>
            <p className="text-2xl font-bold text-white">{shelters.length}</p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Capacity</p>
            <p className="text-2xl font-bold text-white">{shelters.reduce((acc, s) => acc + s.capacity, 0)}</p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 text-orange-400 rounded-lg">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Current Occupants</p>
            <p className="text-2xl font-bold text-white">{shelters.reduce((acc, s) => acc + s.currentOccupancy, 0)}</p>
          </div>
        </div>
      </div>

      {/* Shelters List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {shelters.map((shelter) => {
          const availabilityPercentage = ((shelter.capacity - shelter.currentOccupancy) / shelter.capacity) * 100;
          let statusColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
          if (availabilityPercentage < 20) statusColor = "text-red-400 bg-red-400/10 border-red-400/20";
          else if (availabilityPercentage < 50) statusColor = "text-orange-400 bg-orange-400/10 border-orange-400/20";

          return (
            <div key={shelter.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {shelter.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{shelter.lat.toFixed(4)}, {shelter.lng.toFixed(4)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this shelter?')) {
                        removeShelter(shelter.id);
                      }
                    }}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
                    title="Remove Shelter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Occupancy</span>
                    <span className="text-white font-medium">{shelter.currentOccupancy} / {shelter.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${availabilityPercentage < 20 ? 'bg-red-500' : availabilityPercentage < 50 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                      style={{ width: `${(shelter.currentOccupancy / shelter.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusColor}`}>
                  {availabilityPercentage.toFixed(0)}% Available
                </span>
                <span className="text-xs text-slate-500">ID: {shelter.id}</span>
              </div>
            </div>
          );
        })}
        {shelters.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
            No shelters registered in the system.
          </div>
        )}
      </div>

      {/* Add Shelter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Register New Shelter
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddShelter} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Shelter Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. City Hall Evacuation Center"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={lat}
                    onChange={e => setLat(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="23.0225"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={lng}
                    onChange={e => setLng(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="72.5714"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Maximum Capacity (People)</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={capacity}
                  onChange={e => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-colors"
                >
                  Register Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
