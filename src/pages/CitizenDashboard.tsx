import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { AlertCircle, Map, Target, ShieldPlus, TriangleAlert, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Marker, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIconDesktop = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapUpdater({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function CitizenDashboard() {
  const { disasters, addReport } = useDatabase();
  const activeDisasters = disasters.filter(d => d.active);

  const [panicSent, setPanicSent] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 23.0225, lng: 72.5714 });

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geolocation error, using fallback location"),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const handlePanic = () => {
    addReport({
      citizenId: 'c1',
      description: 'URGENT: Automated Panic Button Triggered. Immediate assistance required.',
      location: userLocation, // Use actual GPS location
      status: 'Pending'
    });
    setPanicSent(true);
    setTimeout(() => setPanicSent(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome, Citizen</h1>
            <p className="text-slate-500 flex items-center gap-1 mt-1 text-sm">
              <Target className="w-4 h-4" /> Detected Location: Ahmedabad (Safe Zone)
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Normal
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Alerts & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Alerts Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <BellRing className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Active Alerts</h2>
            </div>
            
            {activeDisasters.length > 0 ? (
              <div className="space-y-3">
                {activeDisasters.map((disaster) => (
                  <div key={disaster.id} className={`p-4 rounded-xl border flex items-start justify-between ${
                    disaster.severity === 'High' ? 'bg-red-50 border-red-200' :
                    disaster.severity === 'Medium' ? 'bg-orange-50 border-orange-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <TriangleAlert className={`w-5 h-5 mt-0.5 ${
                        disaster.severity === 'High' ? 'text-red-500' :
                        disaster.severity === 'Medium' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`} />
                      <div>
                        <h3 className="font-bold text-slate-800">{disaster.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">Severity: {disaster.severity} | Type: {disaster.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(disaster.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No active disasters reported in your area.</p>
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/citizen/map" className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-2xl transition-all hover:scale-105 hover:shadow-md">
              <Map className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm text-center">Find Safe Shelter</span>
            </Link>
            
            <Link to="/citizen/report" className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-2xl transition-all hover:scale-105 hover:shadow-md">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm text-center">Report Incident</span>
            </Link>
            
            <Link to="/citizen/safety" className="flex flex-col items-center justify-center p-6 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl transition-all hover:scale-105 hover:shadow-md">
              <ShieldPlus className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm text-center">Safety Guide</span>
            </Link>

            <button className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-2xl transition-all hover:scale-105 hover:shadow-md">
              <BellRing className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm text-center">Emergency Contacts</span>
            </button>
          </div>
        </div>

        {/* Right Column: Panic Button & Map Preview */}
        <div className="space-y-6">
          
          {/* MAP PREVIEW */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col h-64">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800">Live Risk Map</h2>
              <Link to="/citizen/map" className="text-sm text-blue-600 hover:underline">View Full</Link>
            </div>
            <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200 z-0">
               <MapContainer 
                  center={[userLocation.lat, userLocation.lng]} 
                  zoom={12} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <MapUpdater lat={userLocation.lat} lng={userLocation.lng} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Active Alert Zones */}
                  {activeDisasters
                     .filter(d => d.location && typeof d.location.lat === 'number' && typeof d.location.lng === 'number')
                     .map((d) => {
                       const color = d.severity === 'High' ? '#ef4444' : d.severity === 'Medium' ? '#eab308' : '#3b82f6';
                       return (
                        <Circle
                          key={d.id}
                          center={[d.location!.lat, d.location!.lng]}
                          radius={1000}
                          pathOptions={{ fillColor: color, fillOpacity: 0.2, color: color, weight: 1 }}
                        >
                          <Tooltip sticky>
                            <div className="p-1 min-w-[150px]">
                              <h3 className="font-bold flex items-center gap-1.5 border-b pb-1 mb-1" style={{ color: color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span> 
                                {d.severity} Alert Zone
                              </h3>
                              <div className="text-slate-700 text-sm"><span className="font-semibold text-slate-500">Event:</span> {d.title}</div>
                              <div className="text-slate-500 text-xs mt-0.5"><span className="font-semibold">Generated:</span> {new Date(d.timestamp).toLocaleTimeString()}</div>
                            </div>
                          </Tooltip>
                        </Circle>
                       );
                     })}
                  
                  {/* User Location */}
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIconDesktop} />
                </MapContainer>
            </div>
          </div>

          {/* PANIC BUTTON */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-center relative overflow-hidden">
            {/* Background pulse effect if panic sent */}
            {panicSent && (
              <div className="absolute inset-0 bg-red-600/20 animate-pulse"></div>
            )}
            
            <h2 className="text-red-400 font-bold mb-2 uppercase tracking-wider text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> Emergency Use Only
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Instantly broadcast your location to nearest rescue authorities.
            </p>
            
            <button 
              onClick={handlePanic}
              disabled={panicSent}
              className={`relative group mx-auto flex items-center justify-center w-36 h-36 rounded-full transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.4)] ${
                panicSent ? 'bg-red-800 scale-95 cursor-not-allowed shadow-none' : 'bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95'
              }`}
            >
              {/* Outer ring */}
              <div className={`absolute inset-0 rounded-full border-4 border-red-400/30 ${panicSent ? '' : 'group-hover:animate-ping'}`}></div>
              
              {/* Inner core */}
              <div className="relative z-10 flex flex-col items-center justify-center text-white">
                <ShieldPlus className="w-10 h-10 mb-1" />
                <span className="font-bold text-xl uppercase tracking-widest">{panicSent ? 'Sent!' : 'SOS'}</span>
              </div>
            </button>
            
            {panicSent && (
              <p className="mt-4 text-emerald-400 text-sm font-medium animate-fadeIn">
                Signal dispatched. Stay safe, help is being coordinated!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
