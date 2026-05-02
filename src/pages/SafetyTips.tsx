import { useState } from 'react';
import { Shield, Droplet, Flame, Zap, CheckCircle2 } from 'lucide-react';

export default function SafetyTips() {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Flood' | 'Earthquake' | 'Fire'>('All');

  const categories = [
    { id: 'All', icon: Shield, label: 'General' },
    { id: 'Flood', icon: Droplet, label: 'Flood' },
    { id: 'Earthquake', icon: Zap, label: 'Earthquake' },
    { id: 'Fire', icon: Flame, label: 'Fire' },
  ] as const;

  const tips = [
    { type: 'Flood', text: 'Do not walk, swim or drive through flood waters. Turn Around, Don’t Drown!' },
    { type: 'Flood', text: 'Move to higher ground or a higher floor. Stay out of basements.' },
    { type: 'Earthquake', text: 'Drop, Cover, and Hold On. Protect your head and neck.' },
    { type: 'Earthquake', text: 'If outside, keep away from buildings, streetlights, and utility wires.' },
    { type: 'Fire', text: 'Crawl low under any smoke to your exit.' },
    { type: 'Fire', text: 'If your clothes catch fire, Stop, Drop, and Roll.' },
  ];

  const filteredTips = activeCategory === 'All' 
    ? tips 
    : tips.filter(t => t.type === activeCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Survival & Safety Guide</h1>
        <p className="text-slate-500 mt-2">Context-based life-saving actions to take during disasters.</p>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 justify-center">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.map((tip, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`p-2 rounded-lg shrink-0 ${
              tip.type === 'Flood' ? 'bg-blue-100 text-blue-600' :
              tip.type === 'Earthquake' ? 'bg-amber-100 text-amber-600' :
              'bg-orange-100 text-orange-600'
            }`}>
              {tip.type === 'Flood' && <Droplet className="w-6 h-6" />}
              {tip.type === 'Earthquake' && <Zap className="w-6 h-6" />}
              {tip.type === 'Fire' && <Flame className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">{tip.type} Protocol</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
         <div>
            <h3 className="font-bold text-blue-900 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Always remember:</h3>
            <p className="text-blue-800 text-sm mt-1">If circumstances endanger your life, use the Panic Button on your dashboard immediately.</p>
         </div>
         <button onClick={() => window.history.back()} className="shrink-0 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow flex items-center gap-2">
            Acknowledge
         </button>
      </div>

    </div>
  );
}
