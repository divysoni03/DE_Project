import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { ShieldAlert, Users, Radio, Activity, Map, ArrowRight, CloudRain, Waves, Activity as SeismicActivity } from 'lucide-react';
import { predictRiskLevel } from '../lib/fakeAi';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const incidentIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Properly flies the map to a given latlng - must be INSIDE MapContainer
function FlyToLocation({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target && typeof target.lat === 'number' && typeof target.lng === 'number') {
      map.flyTo([target.lat, target.lng], 15);
    }
  }, [target, map]);
  return null;
}

export default function AdminDashboard() {
  const { disasters, reports, teams, assignTeam, updateReportStatus, addDisaster } = useDatabase();

  const [showManualAlertModal, setShowManualAlertModal] = useState(false);
  const [newDisaster, setNewDisaster] = useState<{
    title: string;
    type: 'Flood' | 'Earthquake' | 'Fire';
    severity: 'Low' | 'Medium' | 'High';
    location?: { lat: number; lng: number };
  }>({ title: '', type: 'Flood', severity: 'Medium' });

  const activeDisasters = disasters.filter(d => d.active);
  const pendingReports = reports.filter(r => r.status === 'Pending');

  // AI Sensor State
  const [simState, setSimState] = useState({ rain: 40, seismic: 2.1, water: 1.2 });
  const aiRisk = predictRiskLevel(simState.rain, simState.seismic, simState.water);
  const [showAiWarning, setShowAiWarning] = useState(false);

  // Panic Modal State
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicLocation, setPanicLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Persist acknowledged panics across sessions using localStorage
  const acknowledgedPanics = useRef<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('acknowledged_panics') ?? '[]'))
  );
  const markPanicAcknowledged = (id: string) => {
    acknowledgedPanics.current.add(id);
    localStorage.setItem('acknowledged_panics', JSON.stringify([...acknowledgedPanics.current]));
  };

  // Map fly-to target — changed when admin clicks Locate or Acknowledges a panic
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const latest = pendingReports.find(
      r => r.description.includes('Automated Panic Button Triggered') && !acknowledgedPanics.current.has(r.id)
    );
    if (latest) {
      markPanicAcknowledged(latest.id);
      setPanicLocation(latest.location ?? null);
      setShowPanicModal(true);
    }
  }, [pendingReports]);

  const handleAcknowledge = () => {
    setShowPanicModal(false);
    if (panicLocation) {
      setFlyTarget({ ...panicLocation }); // new object reference so useEffect re-fires
    }
  };

  const handleSimulateAiTrigger = () => {
    setSimState({ rain: 160, seismic: 6.5, water: 5.8 });
    setTimeout(() => {
      setShowAiWarning(true);
      setTimeout(() => setShowAiWarning(false), 8000);
    }, 500);
  };

  const handleCreateManualAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDisaster.title) {
      addDisaster({
        title: newDisaster.title,
        type: newDisaster.type,
        severity: newDisaster.severity,
        active: true,
        location: newDisaster.location,
      });
      setShowManualAlertModal(false);
      setNewDisaster({ title: '', type: 'Flood', severity: 'Medium' });
    }
  };

  return (
    <div className="space-y-6 relative">

      {/* =========================
          PANIC BUTTON MODAL
      ========================= */}
      {showPanicModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.4)] p-8 max-w-lg w-full mx-4 text-center">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-widest">New Emergency</h2>
            <p className="text-white mb-2">A Citizen has activated their Panic Button!</p>
            {panicLocation && (
              <p className="text-slate-400 text-sm mb-2">
                📍 Location: {panicLocation.lat.toFixed(5)}, {panicLocation.lng.toFixed(5)}
              </p>
            )}
            <p className="text-slate-500 text-xs mb-8">Immediate dispatch recommended.</p>
            <button
              onClick={handleAcknowledge}
              className="w-full bg-red-600 hover:bg-red-500 active:scale-95 text-white py-3 rounded-xl font-bold transition-all"
            >
              Acknowledge &amp; View on Map
            </button>
          </div>
        </div>
      )}

      {/* =========================
          MANUAL ALERT MODAL
      ========================= */}
      {showManualAlertModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-500 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] p-8 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Radio className="w-6 h-6 text-blue-500" /> Broadcast Alert
              </h2>
              <button
                onClick={() => {
                  setShowManualAlertModal(false);
                  setNewDisaster({ title: '', type: 'Flood', severity: 'Medium' });
                }}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateManualAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  required
                  value={newDisaster.title}
                  onChange={e => setNewDisaster({ ...newDisaster, title: e.target.value })}
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Flash Flood Evacuation"
                />
              </div>
              {newDisaster.location && (
                <div className="bg-slate-800 rounded-lg p-3 text-sm text-emerald-400 border border-emerald-500/30">
                  📍 Pre-filled from report: {newDisaster.location.lat.toFixed(5)}, {newDisaster.location.lng.toFixed(5)}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={newDisaster.type}
                  onChange={e => setNewDisaster({ ...newDisaster, type: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Flood">Flood</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Fire">Fire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Severity</label>
                <select
                  value={newDisaster.severity}
                  onChange={e => setNewDisaster({ ...newDisaster, severity: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Broadcast to All Citizens
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Warning Toast */}
      {showAiWarning && (
        <div className="fixed top-20 right-8 z-50 bg-red-900 border-l-4 border-red-500 p-4 rounded shadow-2xl max-w-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h4 className="font-bold text-red-100">AI WARNING</h4>
              <p className="text-sm text-red-200 mt-1">
                Critical danger predicted by environmental sensors. Recommend broadcasting a new disaster alert.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
          <div className="flex items-center gap-3 text-red-400 mb-2">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Active Disasters</h3>
          </div>
          <p className="text-3xl font-bold text-white">{activeDisasters.length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
          <div className="flex items-center gap-3 text-orange-400 mb-2">
            <Radio className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Pending Reports</h3>
          </div>
          <p className="text-3xl font-bold text-white">{pendingReports.length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Teams Available</h3>
          </div>
          <p className="text-3xl font-bold text-white">{teams.filter(t => t.status === 'Available').length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md flex items-center justify-center">
          <button
            onClick={() => setShowManualAlertModal(true)}
            className="w-full h-full min-h-[80px] bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-6 h-6" /> Create Alert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Map + Reports */}
        <div className="lg:col-span-2 space-y-6">

          {/* Admin Incident Map */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-md h-[420px] relative z-0">
            <MapContainer
              center={[23.0225, 72.5714]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              {/* Fly to target when admin acknowledges or locates a report */}
              <FlyToLocation target={flyTarget} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Active Alert Zones (admin-created with location) */}
              {activeDisasters
                .filter(d => d.location && typeof d.location.lat === 'number' && typeof d.location.lng === 'number')
                .map(d => (
                  <Circle
                    key={d.id}
                    center={[d.location!.lat, d.location!.lng]}
                    radius={1000}
                    pathOptions={{ fillColor: '#ef4444', fillOpacity: 0.3, color: '#ef4444', weight: 2 }}
                  >
                    <Tooltip sticky>
                      <div className="p-1">
                        <h3 className="font-bold text-red-600 border-b pb-1 mb-1">Generated Alert</h3>
                        <div className="text-slate-700 text-sm"><span className="font-semibold text-slate-500">Event:</span> {d.title}</div>
                        <div className="text-slate-500 text-xs mt-1">Generated: {new Date(d.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </Tooltip>
                  </Circle>
                ))}

              {/* Civilian Incident / Panic Report Markers */}
              {pendingReports
                .filter(r => r.location && typeof r.location.lat === 'number' && typeof r.location.lng === 'number')
                .map(report => (
                  <Marker
                    key={report.id}
                    position={[report.location.lat, report.location.lng]}
                    icon={incidentIcon}
                  >
                    <Popup>
                      <div className="font-bold text-red-600 mb-1 border-b pb-1">
                        {report.description.includes('Panic') ? '🚨 PANIC ALERT' : 'Civilian Report'}
                      </div>
                      <div className="text-sm">{report.description}</div>
                      <div className="text-xs text-slate-500 mt-2">{new Date(report.timestamp).toLocaleTimeString()}</div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          {/* Civilian Incident Reports List */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-md">
            <div className="p-4 bg-slate-900 border-b border-slate-700">
              <h2 className="text-lg font-bold">Civilian Incident Reports ({pendingReports.length})</h2>
            </div>
            <div className="divide-y divide-slate-700">
              {pendingReports.length > 0 ? pendingReports.map(report => {
                const availableTeam = teams.find(t => t.status === 'Available');
                const isPanic = report.description.includes('Automated Panic Button Triggered');
                return (
                  <div key={report.id} className={`p-4 transition-colors ${isPanic ? 'bg-red-900/20' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-slate-300 pr-4">{report.description}</p>
                      <span className={`shrink-0 px-2 py-1 text-xs font-semibold rounded border ${
                        isPanic
                          ? 'bg-red-600/30 text-red-300 border-red-500/50'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {isPanic ? '🚨 PANIC' : 'Urgent'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <Map className="w-4 h-4" />
                        {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
                        &nbsp;|&nbsp;
                        {new Date(report.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setFlyTarget({ ...report.location })}
                          className="px-3 py-1.5 text-sm bg-blue-700 hover:bg-blue-600 rounded transition-colors shrink-0 flex items-center gap-1"
                          title="Fly to on map"
                        >
                          <Map className="w-3.5 h-3.5" /> Locate
                        </button>
                        <button
                          onClick={() => updateReportStatus(report.id, 'Reviewed')}
                          className={`px-3 py-1.5 text-sm rounded transition-colors shrink-0 flex items-center gap-1 ${
                            report.status === 'Reviewed' || report.status === 'Action Taken'
                              ? 'bg-emerald-800 text-emerald-300 cursor-default'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                          disabled={report.status === 'Reviewed' || report.status === 'Action Taken'}
                        >
                          {report.status === 'Reviewed' || report.status === 'Action Taken' ? '✓ Read' : 'Mark Read'}
                        </button>
                        <button
                          onClick={() => {
                            setNewDisaster({ title: 'Incident Alert', type: 'Flood', severity: 'High', location: report.location });
                            setShowManualAlertModal(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-500 rounded transition-colors shrink-0"
                        >
                          Alert Citizens
                        </button>
                        <button
                          disabled={!availableTeam}
                          onClick={() => availableTeam && assignTeam(availableTeam.id, report.id)}
                          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 rounded transition-colors flex items-center gap-1 shrink-0"
                        >
                          {availableTeam ? `Dispatch ${availableTeam.name}` : 'No Teams'} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-slate-500">No pending reports.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Sensors + Active Broadcasts */}
        <div className="space-y-6">

          {/* AI Environmental Sensors */}
          <div className="bg-slate-800 rounded-2xl border border-blue-500/50 p-6 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[10px] text-blue-400/50 uppercase tracking-widest font-mono">Monitor Mode</div>
            <h3 className="font-bold text-white mb-4 text-lg">AI Environmental Sensors</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400">
                  <CloudRain className="w-5 h-5" />
                  <span className="font-semibold text-sm">Rainfall</span>
                </div>
                <span className={`font-mono font-bold ${aiRisk.level === 'Danger' && simState.rain > 100 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                  {simState.rain} mm/h
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Waves className="w-5 h-5" />
                  <span className="font-semibold text-sm">Water Level</span>
                </div>
                <span className={`font-mono font-bold ${aiRisk.level === 'Danger' && simState.water > 4.0 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                  {simState.water} m
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-orange-400">
                  <SeismicActivity className="w-5 h-5" />
                  <span className="font-semibold text-sm">Seismic</span>
                </div>
                <span className={`font-mono font-bold ${aiRisk.level === 'Danger' && simState.seismic > 5.0 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                  {simState.seismic} M
                </span>
              </div>
            </div>
            <button
              onClick={handleSimulateAiTrigger}
              className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/50 py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all"
            >
              Simulate Weather Spike
            </button>
          </div>

          {/* Active System Broadcasts */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-md">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" /> Active System Broadcasts
              </h2>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {activeDisasters.map(d => (
                <div key={d.id} className={`p-3 rounded border-l-4 ${
                  d.severity === 'High' ? 'bg-red-500/10 border-red-500 text-red-200' :
                  d.severity === 'Medium' ? 'bg-orange-500/10 border-orange-500 text-orange-200' :
                  'bg-yellow-500/10 border-yellow-500 text-yellow-200'
                }`}>
                  <h4 className="font-bold flex justify-between items-center">
                    {d.title}
                    <span className="text-xs uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/20">{d.severity}</span>
                  </h4>
                  <p className="text-xs mt-1 opacity-70">Dispatched: {new Date(d.timestamp).toLocaleTimeString()}</p>
                  {d.location && (
                    <p className="text-xs mt-1 opacity-60">📍 {d.location.lat.toFixed(4)}, {d.location.lng.toFixed(4)}</p>
                  )}
                </div>
              ))}
              {activeDisasters.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No active broadcasts.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
