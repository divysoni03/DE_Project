import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Bump this whenever the data schema changes — forces a cache clear on first load
const SCHEMA_VERSION = '5';

// *** Synchronous cache invalidation — runs before any component mounts ***
(function clearStaleCache() {
  try {
    if (localStorage.getItem('schema_version') !== SCHEMA_VERSION) {
      localStorage.removeItem('disasters_db');
      localStorage.removeItem('reports_db');
      localStorage.setItem('schema_version', SCHEMA_VERSION);
    }
  } catch { /* ignore in SSR or restricted environments */ }
})();

// --- MOCK SCHEMA ---
// PRESENTATION NOTE: 
// In a full production environment, this context would be replaced by
// API calls to our Spring Boot backend (which is storing data in MySQL).
// For this demo, we're using React State to simulate database persistence 
// and ensure real-time UI interactivity during the presentation.
export interface Citizen {
  id: string;
  name: string;
  location: { lat: number, lng: number };
}

export interface Disaster {
  id: string;
  title: string;
  type: 'Flood' | 'Earthquake' | 'Fire';
  severity: 'Low' | 'Medium' | 'High';
  active: boolean;
  timestamp: string;
  location?: { lat: number, lng: number };
}

export interface Authority {
  id: string;
  department: string;
  contact: string;
}

export interface Sensor {
  id: string;
  type: string;
  value: number;
  location: { lat: number, lng: number };
}

export interface Report {
  id: string;
  citizenId: string;
  description: string;
  location: { lat: number, lng: number };
  imageMockUrl?: string;
  status: 'Pending' | 'Reviewed' | 'Action Taken';
  timestamp: string;
}

export interface RescueTeam {
  id: string;
  name: string;
  specialty: 'Water Rescue' | 'Fire & Hazmat' | 'Medical' | 'Search & Rescue' | 'General';
  memberCount: number;
  status: 'Available' | 'Deployed' | 'Standby';
  assignedReportId?: string;
  location?: string;
}

export interface EvacuationRoute {
  id: string;
  from: { lat: number, lng: number };
  toShelterId: string;
  status: 'Safe' | 'Blocked';
}

export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
}

// --- INITIAL DATA ---
const INITIAL_DISASTERS: Disaster[] = [
  { id: 'd1', title: 'Flash Flood Warning', type: 'Flood', severity: 'High', active: true, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'd2', title: 'Minor seismic activity', type: 'Earthquake', severity: 'Low', active: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
];

const INITIAL_REPORTS: Report[] = [
  { id: 'r1', citizenId: 'c1', description: 'Water level rising rapidly near Sabarmati Riverfront.', location: { lat: 23.0225, lng: 72.5714 }, status: 'Pending', timestamp: new Date().toISOString() }
];

const INITIAL_TEAMS: RescueTeam[] = [
  { id: 't1', name: 'Alpha Squad', specialty: 'Water Rescue', memberCount: 8, status: 'Available', location: 'Sabarmati Zone A' },
  { id: 't2', name: 'Bravo Squad', specialty: 'General', memberCount: 6, status: 'Deployed', assignedReportId: 'r1', location: 'Navrangpura' },
  { id: 't3', name: 'Charlie Unit', specialty: 'Medical', memberCount: 5, status: 'Standby', location: 'HQ Base' },
  { id: 't4', name: 'Delta Force', specialty: 'Fire & Hazmat', memberCount: 10, status: 'Available', location: 'Maninagar Station' },
];

const INITIAL_SHELTERS: Shelter[] = [
  { id: 's1', name: 'Sardar Patel Relief Center', lat: 23.0235, lng: 72.5724, capacity: 500, currentOccupancy: 120 },
  { id: 's2', name: 'Navrangpura High School Gym', lat: 23.0335, lng: 72.5824, capacity: 1000, currentOccupancy: 850 },
];

// --- CONTEXT ---
interface DatabaseContextType {
  disasters: Disaster[];
  reports: Report[];
  teams: RescueTeam[];
  shelters: Shelter[];
  addReport: (report: Omit<Report, 'id' | 'timestamp'>) => void;
  addDisaster: (disaster: Omit<Disaster, 'id' | 'timestamp'>) => void;
  updateReportStatus: (id: string, status: Report['status']) => void;
  assignTeam: (teamId: string, reportId: string) => void;
  recallTeam: (teamId: string) => void;
  addTeam: (team: Omit<RescueTeam, 'id'>) => void;
  removeTeam: (teamId: string) => void;
  updateTeamStatus: (teamId: string, status: RescueTeam['status']) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  // Clear localStorage if schema version has changed
  useEffect(() => {
    const storedVersion = localStorage.getItem('schema_version');
    if (storedVersion !== SCHEMA_VERSION) {
      localStorage.removeItem('disasters_db');
      localStorage.removeItem('reports_db');
      localStorage.setItem('schema_version', SCHEMA_VERSION);
      console.log('Schema updated — cache cleared');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [disasters, setDisasters] = useState<Disaster[]>(() => {
    try {
      const saved = localStorage.getItem('disasters_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && localStorage.getItem('schema_version') === SCHEMA_VERSION) {
          return parsed;
        }
      }
    } catch { /* ignore */ }
    return INITIAL_DISASTERS;
  });

  useEffect(() => {
    localStorage.setItem('disasters_db', JSON.stringify(disasters));
  }, [disasters]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'disasters_db' && e.newValue) {
        setDisasters(JSON.parse(e.newValue));
      }
      if (e.key === 'reports_db' && e.newValue) {
        setReports(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const saved = localStorage.getItem('reports_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && localStorage.getItem('schema_version') === SCHEMA_VERSION) {
          return parsed;
        }
      }
    } catch { /* ignore */ }
    return INITIAL_REPORTS;
  });

  useEffect(() => {
    localStorage.setItem('reports_db', JSON.stringify(reports));
  }, [reports]);
  const [teams, setTeams] = useState<RescueTeam[]>(INITIAL_TEAMS);
  const [shelters, _setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);

  // Load reports from Spring Boot backend (if running)
  useEffect(() => {
    fetch('http://localhost:8080/api/data/reports')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const fetchedReports: Report[] = data.map((r: any) => ({
             id: r.id.toString(),
             citizenId: r.citizenId || 'c1',
             description: r.description,
             location: { lat: r.lat ?? 23.0225, lng: r.lng ?? 72.5714 },
             status: r.status ?? 'Pending',
             timestamp: r.timestamp ?? new Date().toISOString()
          }));
          setReports(current => {
            // Merge backend reports with in-memory ones, deduplicate by id
            const ids = new Set(fetchedReports.map(r => r.id));
            const localOnly = current.filter(r => !ids.has(r.id));
            return [...fetchedReports, ...localOnly].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
        }
      })
      .catch(() => { /* backend offline, use local state */ });
  }, []);

  const addReport = async (report: Omit<Report, 'id' | 'timestamp'>) => {
    const optimisticReport = { ...report, id: `r${Date.now()}`, timestamp: new Date().toISOString() };
    
    // 1. Instantly update React State for responsive UI speed
    setReports(prev => [optimisticReport, ...prev]);

    // 2. Persist to real Spring Boot Backend Database
    try {
      await fetch('http://localhost:8080/api/data/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: report.citizenId,
          description: report.description,
          lat: report.location.lat,
          lng: report.location.lng,
          status: report.status
        })
      });
      console.log("Successfully persisted report to database.");
    } catch (err) {
      console.warn("Failed to persist report to backend database", err);
    }
  };

  const addDisaster = (disaster: Omit<Disaster, 'id' | 'timestamp'>) => {
    setDisasters(prev => [{ ...disaster, id: `d${Date.now()}`, timestamp: new Date().toISOString() }, ...prev]);
  };

  const updateReportStatus = (id: string, status: Report['status']) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const assignTeam = (teamId: string, reportId: string) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'Deployed', assignedReportId: reportId } : t));
    updateReportStatus(reportId, 'Action Taken');
  };

  const recallTeam = (teamId: string) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'Available', assignedReportId: undefined } : t));
  };

  const addTeam = (team: Omit<RescueTeam, 'id'>) => {
    setTeams(prev => [...prev, { ...team, id: `t${Date.now()}` }]);
  };

  const removeTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const updateTeamStatus = (teamId: string, status: RescueTeam['status']) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, status } : t));
  };

  return (
    <DatabaseContext.Provider value={{
      disasters, reports, teams, shelters,
      addReport, addDisaster, updateReportStatus, assignTeam,
      recallTeam, addTeam, removeTeam, updateTeamStatus
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within an DatabaseProvider');
  }
  return context;
}
