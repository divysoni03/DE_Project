import React, { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { UploadCloud, LocateFixed, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReportIncident() {
  const { addReport } = useDatabase();
  const { email } = useAuth();
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  // Auto-acquire GPS on mount
  useEffect(() => {
    handleLocate();
  }, []);

  const handleLocate = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsCoords(coords);
          setLocationStr(`${coords.lat.toFixed(6)}° N, ${coords.lng.toFixed(6)}° E (GPS Acquired)`);
          setLocating(false);
        },
        (err) => {
          console.warn('GPS unavailable, using fallback:', err);
          // Fallback to Ahmedabad center for demo
          const fallback = { lat: 23.0225, lng: 72.5714 };
          setGpsCoords(fallback);
          setLocationStr(`${fallback.lat}° N, ${fallback.lng}° E (Demo Location)`);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      const fallback = { lat: 23.0225, lng: 72.5714 };
      setGpsCoords(fallback);
      setLocationStr(`${fallback.lat}° N, ${fallback.lng}° E (Demo Location)`);
      setLocating(false);
    }
  };

  const MIN_DESC = 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpsCoords || description.trim().length < MIN_DESC) return;
    setLoading(true);
    setTimeout(() => {
      addReport({
        citizenId: email ?? `citizen_${Date.now()}`,
        description,
        location: gpsCoords,
        status: 'Pending'
      });
      navigate('/citizen/dashboard');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Civilian Incident Report</h1>
          <p className="text-blue-100 mt-2 text-sm max-w-md mx-auto">
            Your report — including your GPS location — is sent directly to the Emergency Command Center.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Incident Description <span className="text-red-500">*</span></label>
              <span className={`text-xs font-medium ${
                description.trim().length < MIN_DESC ? 'text-red-400' : 'text-emerald-600'
              }`}>
                {description.trim().length}/{MIN_DESC} min
              </span>
            </div>
            <textarea
              required
              minLength={MIN_DESC}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see clearly (e.g. Water level is chest high, tree fallen on road)"
              className={`w-full rounded-xl shadow-sm focus:ring focus:ring-blue-200 transition-all p-3 border ${
                description.trim().length > 0 && description.trim().length < MIN_DESC
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {description.trim().length > 0 && description.trim().length < MIN_DESC && (
              <p className="text-xs text-red-500">Please provide at least {MIN_DESC} characters.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Your GPS Location <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input 
                required
                type="text" 
                value={locating ? 'Acquiring GPS...' : locationStr}
                readOnly
                placeholder="Acquiring GPS location..."
                className={`flex-1 rounded-xl border shadow-sm bg-slate-50 transition-all p-3 text-slate-600 ${
                  gpsCoords ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-300'
                }`}
              />
              <button 
                type="button"
                onClick={handleLocate}
                disabled={locating}
                className="bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 px-4 rounded-xl flex items-center justify-center transition-colors"
                title="Re-acquire GPS"
              >
                {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
              </button>
            </div>
            {gpsCoords && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Location captured — will appear on Admin map
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Upload Media (Optional)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Click to upload an image or drag & drop</p>
              <p className="text-xs text-slate-400">JPG, PNG up to 10MB</p>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading || !gpsCoords || description.trim().length < MIN_DESC}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-4 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <><Send className="w-5 h-5" /> Submit Official Report</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
