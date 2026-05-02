import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import type { RescueTeam } from '../contexts/DatabaseContext';
import {
  Users, Plus, Trash2, RotateCcw, CheckCircle2,
  AlertTriangle, Clock, MapPin, Shield, Flame,
  Stethoscope, Search, ChevronDown, X
} from 'lucide-react';

// ─── Specialty config ────────────────────────────────────────────────────────
const SPECIALTY_CONFIG: Record<RescueTeam['specialty'], {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  'Water Rescue':     { icon: Shield,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  'Fire & Hazmat':    { icon: Flame,       color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Medical':          { icon: Stethoscope, color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30' },
  'Search & Rescue':  { icon: Search,      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  'General':          { icon: Users,       color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/30' },
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: RescueTeam['status'] }) {
  const map = {
    Available: { icon: CheckCircle2, label: 'Available', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    Deployed:  { icon: AlertTriangle,label: 'Deployed',  cls: 'text-red-400    bg-red-500/10    border-red-500/30'    },
    Standby:   { icon: Clock,        label: 'Standby',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${map.cls}`}>
      <Icon className="w-3.5 h-3.5" /> {map.label}
    </span>
  );
}

// ─── Blank form state ─────────────────────────────────────────────────────────
const BLANK_FORM = {
  name: '',
  specialty: 'General' as RescueTeam['specialty'],
  memberCount: 5,
  status: 'Available' as RescueTeam['status'],
  location: '',
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RescueTeams() {
  const { teams, reports, addTeam, removeTeam, recallTeam, updateTeamStatus } = useDatabase();

  const [showAddModal, setShowAddModal]     = useState(false);
  const [filterStatus, setFilterStatus]     = useState<'All' | RescueTeam['status']>('All');
  const [form, setForm]                     = useState(BLANK_FORM);
  const [confirmDelete, setConfirmDelete]   = useState<string | null>(null);

  // Stats
  const available = teams.filter(t => t.status === 'Available').length;
  const deployed  = teams.filter(t => t.status === 'Deployed').length;
  const standby   = teams.filter(t => t.status === 'Standby').length;

  const filtered = filterStatus === 'All' ? teams : teams.filter(t => t.status === filterStatus);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addTeam({ ...form });
    setForm(BLANK_FORM);
    setShowAddModal(false);
  };

  const getAssignedReport = (reportId?: string) =>
    reportId ? reports.find(r => r.id === reportId) : undefined;

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            Rescue Teams
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage, deploy, and monitor all active rescue units.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> Add Team
        </button>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Teams',  value: teams.length,  color: 'text-white',        bg: 'bg-slate-800' },
          { label: 'Available',    value: available,     color: 'text-emerald-400',  bg: 'bg-slate-800' },
          { label: 'Deployed',     value: deployed,      color: 'text-red-400',      bg: 'bg-slate-800' },
          { label: 'Standby',      value: standby,       color: 'text-yellow-400',   bg: 'bg-slate-800' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-700 p-5 shadow-md`}>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'Available', 'Deployed', 'Standby'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filterStatus === s
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 self-center">{filtered.length} team{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Team Grid ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center text-slate-500">
          No teams match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(team => {
            const spec   = SPECIALTY_CONFIG[team.specialty];
            const SpecIcon = spec.icon;
            const report = getAssignedReport(team.assignedReportId);

            return (
              <div
                key={team.id}
                className={`bg-slate-800 border rounded-2xl shadow-md overflow-hidden transition-shadow hover:shadow-lg hover:shadow-blue-500/5 ${
                  team.status === 'Deployed' ? 'border-red-500/40' : 'border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div className={`p-4 flex items-start justify-between ${spec.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${spec.bg} ${spec.border} border flex items-center justify-center`}>
                      <SpecIcon className={`w-5 h-5 ${spec.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{team.name}</h3>
                      <p className={`text-xs font-medium mt-0.5 ${spec.color}`}>{team.specialty}</p>
                    </div>
                  </div>
                  <StatusBadge status={team.status} />
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>{team.memberCount} members</span>
                  </div>
                  {team.location && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{team.location}</span>
                    </div>
                  )}

                  {/* Assignment info */}
                  {report && (
                    <div className="bg-red-950/40 border border-red-500/20 rounded-lg p-3 text-xs">
                      <p className="text-red-300 font-semibold mb-1">📋 Assigned Report</p>
                      <p className="text-slate-400 truncate">{report.description}</p>
                      <p className="text-slate-500 mt-1">
                        📍 {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
                      </p>
                    </div>
                  )}

                  {/* Status inline changer */}
                  <div className="relative">
                    <label className="text-xs text-slate-500 mb-1 block">Set Status</label>
                    <div className="relative">
                      <select
                        value={team.status}
                        onChange={e => updateTeamStatus(team.id, e.target.value as RescueTeam['status'])}
                        className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Available">Available</option>
                        <option value="Standby">Standby</option>
                        <option value="Deployed">Deployed</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  {team.status === 'Deployed' && (
                    <button
                      onClick={() => recallTeam(team.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-600/20 border border-yellow-500/30 hover:bg-yellow-600/40 text-yellow-400 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Recall
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(team.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-red-900/40 hover:border-red-500/30 border border-slate-600 text-slate-400 hover:text-red-400 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 bg-red-600/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Remove Team?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This will permanently remove{' '}
              <span className="text-white font-semibold">
                {teams.find(t => t.id === confirmDelete)?.name}
              </span>{' '}
              from the roster.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { removeTeam(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Team Modal ─────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-500/40 rounded-2xl shadow-2xl p-7 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> New Rescue Team
              </h2>
              <button onClick={() => { setShowAddModal(false); setForm(BLANK_FORM); }}
                className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Team Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Echo Squad"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Specialty</label>
                  <select
                    value={form.specialty}
                    onChange={e => setForm({ ...form, specialty: e.target.value as RescueTeam['specialty'] })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option>Water Rescue</option>
                    <option>Fire & Hazmat</option>
                    <option>Medical</option>
                    <option>Search & Rescue</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Members</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.memberCount}
                    onChange={e => setForm({ ...form, memberCount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as RescueTeam['status'] })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Standby">Standby</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Base Location</label>
                  <input
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. East Zone HQ"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setForm(BLANK_FORM); }}
                  className="flex-1 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
                >
                  Add Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
