import { Link } from 'react-router-dom';
import { Map, Bell, Phone, Shield } from 'lucide-react';

export default function Home() {
    const cards = [
        {
            title: 'Find Shelters',
            description: 'Locate nearest emergency shelters',
            icon: Map,
            href: '/shelters',
            iconColor: 'text-blue-600',
        },
        {
            title: 'Emergency Alerts',
            description: 'View active alerts and warnings',
            icon: Bell,
            href: '/alerts',
            iconColor: 'text-red-500',
        },
        {
            title: 'Emergency Contacts',
            description: 'Important emergency numbers',
            icon: Phone,
            href: '#',
            iconColor: 'text-green-600',
        },
        {
            title: 'Safety Tips',
            description: 'Emergency preparedness guide',
            icon: Shield,
            href: '/safety',
            iconColor: 'text-purple-600',
        },
    ];

    return (
        <div className="flex flex-col items-center max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3 mt-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800">Emergency Alert System</h1>
                <p className="text-slate-500 text-base md:text-lg">Stay informed and find safety during emergencies</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {cards.map((card) => (
                    <Link
                        key={card.title}
                        to={card.href}
                        className="flex flex-col items-center bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all text-center space-y-4"
                    >
                        <card.icon className={`w-10 h-10 ${card.iconColor}`} strokeWidth={1.5} />
                        <div className="space-y-1">
                            <h3 className="font-semibold text-slate-800">{card.title}</h3>
                            <p className="text-sm text-slate-500">{card.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Emergency Information</h2>

                <div className="space-y-6">
                    <div className="pl-4 border-l-[3px] border-red-500">
                        <h4 className="font-medium text-slate-800">Active Alerts</h4>
                        <p className="text-sm text-slate-500">Check the alerts page for current emergency situations</p>
                    </div>

                    <div className="pl-4 border-l-[3px] border-blue-500">
                        <h4 className="font-medium text-slate-800">Shelter Status</h4>
                        <p className="text-sm text-slate-500">View real-time shelter availability and capacity</p>
                    </div>

                    <div className="pl-4 border-l-[3px] border-green-500">
                        <h4 className="font-medium text-slate-800">Emergency Services</h4>
                        <p className="text-sm text-slate-500">Access emergency services and support</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
