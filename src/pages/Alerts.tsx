import { useState } from 'react';
import { TriangleAlert, BellRing, Info } from 'lucide-react';
import { useDatabase } from '../contexts/DatabaseContext';

type Tab = 'All' | 'Emergencies' | 'Warnings' | 'Updates';

interface Alert {
    id: string;
    title: string;
    description: string;
    location: string;
    time: string;
    severity: 'High' | 'Medium' | 'Low';
    type: 'Emergency' | 'Warning' | 'Update';
}

export default function Alerts() {
    const { disasters } = useDatabase();
    const [activeTab, setActiveTab] = useState<Tab>('All');

    // Convert true disasters into the Alert format for the UI
    const dynamicAlerts: Alert[] = disasters.filter(d => d.active).map(d => ({
        id: d.id,
        title: d.title,
        description: `Official Broadcast: Active ${d.type} emergency reported. Please follow municipal safety guidelines.`,
        location: d.location ? `Lat: ${d.location.lat.toFixed(4)}, Lng: ${d.location.lng.toFixed(4)}` : 'General Broadcast',
        time: new Date(d.timestamp).toLocaleString(),
        severity: d.severity,
        type: d.severity === 'High' ? 'Emergency' : 'Warning',
    }));

    // Example mock update
    const mockUpdate: Alert = {
        id: 'u1',
        title: 'System Online',
        description: 'Disaster management portal is now receiving live updates.',
        location: 'Command Center',
        time: new Date().toLocaleString(),
        severity: 'Low',
        type: 'Update',
    };

    const alerts: Alert[] = [...dynamicAlerts, mockUpdate];

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'High':
                return { icon: <TriangleAlert className="w-5 h-5 text-red-500" strokeWidth={1.5} />, badge: 'bg-red-50 text-red-600' };
            case 'Medium':
                return { icon: <BellRing className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />, badge: 'bg-yellow-50 text-yellow-600' };
            case 'Low':
                return { icon: <Info className="w-5 h-5 text-green-500" strokeWidth={1.5} />, badge: 'bg-green-50 text-green-600' };
            default:
                return { icon: <Info className="w-5 h-5 text-blue-500" strokeWidth={1.5} />, badge: 'bg-blue-50 text-blue-600' };
        }
    };

    const tabs: Tab[] = ['All', 'Emergencies', 'Warnings', 'Updates'];

    const filteredAndSortedAlerts = alerts
        .filter(a => activeTab === 'All' ||
            (activeTab === 'Emergencies' && a.type === 'Emergency') ||
            (activeTab === 'Warnings' && a.type === 'Warning') ||
            (activeTab === 'Updates' && a.type === 'Update'))
        .sort((a, b) => {
            const weights = { High: 3, Medium: 2, Low: 1 };
            return (weights[b.severity] || 0) - (weights[a.severity] || 0);
        });

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Emergency Alerts</h1>
                <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                                    ? tab === 'Emergencies' ? 'bg-red-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredAndSortedAlerts.length > 0 ? filteredAndSortedAlerts.map((alert) => {
                    const { icon, badge } = getSeverityStyles(alert.severity);
                    return (
                        <div key={alert.id} className="bg-white p-6 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-slate-100 flex items-start gap-4 transition-all hover:shadow-md hover:border-slate-200">
                            <div className="mt-1">{icon}</div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="font-semibold text-slate-800 text-lg">{alert.title}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}>
                                        {alert.severity}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{alert.description}</p>
                                <p className="text-slate-400 text-xs pt-2 flex items-center gap-2">
                                    <span>{alert.location}</span>
                                    <span>&bull;</span>
                                    <span>{alert.time}</span>
                                </p>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-white p-6 rounded-xl border border-slate-100 text-slate-500 text-center">
                        No alerts found for this category.
                    </div>
                )}
            </div>
        </div>
    );
}
