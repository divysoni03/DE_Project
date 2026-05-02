import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ShieldCheck, Map, Navigation } from 'lucide-react';
import { generateSmartEvacuationRoute } from '../lib/fakeAi';

// Fix for default Leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const shelterIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function CitizenMap() {
  const { shelters, disasters } = useDatabase();
  const activeDisasters = disasters.filter(d => d.active);
  
  // Real Geolocation (with fallback)
  const [DEMO_USER_LOCATION, setUserLocation] = useState<{lat: number, lng: number}>({ lat: 23.0225, lng: 72.5714 });
  
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geolocation error, using fallback location", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);
  
  const [route, setRoute] = useState<any>(null);

  // Dynamic Active Risk Zones

  const handleEvacuate = async () => {
    const aiRoute = generateSmartEvacuationRoute(DEMO_USER_LOCATION, shelters);
    if (aiRoute) {
      try {
        // Fetch real road route using public OSRM API
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${DEMO_USER_LOCATION.lng},${DEMO_USER_LOCATION.lat};${aiRoute.shelter.lng},${aiRoute.shelter.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          // OSRM returns coordinates in [lng, lat], Leaflet needs [lat, lng]
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          setRoute({
            coordinates: coords,
            ...aiRoute
          });
          return;
        }
      } catch (err) {
        console.error("OSRM Routing failed", err);
      }
      
      // Fallback if API fails
      setRoute({
        coordinates: [
          [DEMO_USER_LOCATION.lat, DEMO_USER_LOCATION.lng],
          [aiRoute.shelter.lat, aiRoute.shelter.lng]
        ],
        ...aiRoute
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-t-2xl p-4 border border-slate-200 border-b-0 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-600" />
            Live Risk & Evacuation Map
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time danger zones and smart routing.</p>
        </div>
        
        <button 
          onClick={handleEvacuate}
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md active:scale-95"
        >
          <Navigation className="w-5 h-5" />
          {route ? 'Recalculate Route' : 'Find Evacuation Route'}
        </button>
      </div>
      
      {route && (
        <div className="bg-emerald-50 border-x border-b border-emerald-200 p-4 relative z-10 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-emerald-800">Route Found to {route.shelter.name}</p>
                <p className="text-xs text-emerald-700">Estimated Travel: {Math.max(5, Math.floor(route.estimatedTimeMinutes / 10))} mins | Status: {route.routeStatus}</p>
              </div>
            </div>
            <button 
              onClick={() => setRoute(null)}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Clear Route
            </button>
        </div>
      )}

      <div className="flex-1 bg-slate-100 relative rounded-b-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <MapContainer 
          center={[DEMO_USER_LOCATION.lat, DEMO_USER_LOCATION.lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater lat={DEMO_USER_LOCATION.lat} lng={DEMO_USER_LOCATION.lng} />

          {/* Active Alert Zones */}
          {activeDisasters
             .filter(d => d.location && typeof d.location.lat === 'number' && typeof d.location.lng === 'number')
             .map((d) => {
               const color = d.severity === 'High' ? '#ef4444' : d.severity === 'Medium' ? '#eab308' : '#3b82f6';
               return (
                <Circle
                  key={d.id}
                  center={[d.location!.lat, d.location!.lng]}
                  radius={1500}
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
          <Marker position={[DEMO_USER_LOCATION.lat, DEMO_USER_LOCATION.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>

          {/* Shelters */}
          {shelters.map((shelter) => (
            <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} icon={shelterIcon}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">{shelter.name}</h3>
                  <p className="text-sm">Occupancy: {shelter.currentOccupancy}/{shelter.capacity}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Route */}
          {route?.coordinates && (
            <Polyline 
              positions={route.coordinates} 
              pathOptions={{ color: '#2563eb', weight: 5, dashArray: '10, 10' }} 
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
