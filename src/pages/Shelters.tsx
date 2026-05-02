import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for nearest shelter
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Shelter {
    id: number;
    name: string;
    address: string;
    capacity: number;
    occupancy: number;
    lat: number;
    lng: number;
}

const shelters: Shelter[] = [
    {
        id: 1,
        name: 'Community Center Shelter',
        address: '123 Main St, New York, NY',
        capacity: 100,
        occupancy: 45,
        lat: 40.7128,
        lng: -74.0060,
    },
    {
        id: 2,
        name: 'School Gymnasium',
        address: '456 Park Ave, New York, NY',
        capacity: 200,
        occupancy: 120,
        lat: 40.7200,
        lng: -73.9900,
    },
    {
        id: 3,
        name: 'Downtown Library',
        address: '789 Broadway, New York, NY',
        capacity: 150,
        occupancy: 140,
        lat: 40.7300,
        lng: -73.9950,
    }
];

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);
    return null;
}

export default function Shelters() {
    const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
    const [nearestShelter, setNearestShelter] = useState<number | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
    const [loadingLoc, setLoadingLoc] = useState(false);
    const [routes, setRoutes] = useState<Record<number, [number, number][]>>({});

    const handleGetLocation = () => {
        setLoadingLoc(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLoc([lat, lng]);
                    setMapCenter([lat, lng]);

                    // Find nearest
                    let minDist = Infinity;
                    let nearestId: number | null = null;
                    shelters.forEach(s => {
                        const dist = calculateDistance(lat, lng, s.lat, s.lng);
                        if (dist < minDist) {
                            minDist = dist;
                            nearestId = s.id;
                        }
                    });
                    setNearestShelter(nearestId);

                    // Fetch routing paths using public OSRM API
                    setRoutes({});
                    shelters.forEach(async (s) => {
                        try {
                            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${lng},${lat};${s.lng},${s.lat}?overview=full&geometries=geojson`);
                            const data = await res.json();
                            if (data.routes && data.routes.length > 0) {
                                // GeoJSON coordinates are [lng, lat], Leaflet polyline expects [lat, lng]
                                const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
                                setRoutes(prev => ({ ...prev, [s.id]: coords }));
                            }
                        } catch (err) {
                            console.error(`Error fetching route for shelter ${s.id}:`, err);
                        }
                    });

                    setLoadingLoc(false);
                },
                (error) => {
                    console.error('Error getting location', error);
                    alert('Could not get your location. Please check browser permissions.');
                    setLoadingLoc(false);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
            setLoadingLoc(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Emergency Shelters</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-start h-[500px] overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-[400] bg-white/50 p-1 rounded-md backdrop-blur-sm">
                        <button
                            onClick={handleGetLocation}
                            disabled={loadingLoc}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-70"
                        >
                            {loadingLoc ? 'Locating...' : 'Use My Location'}
                        </button>
                    </div>

                    <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={mapCenter} />

                        {userLoc && (
                            <Marker position={userLoc} icon={userIcon}>
                                <Popup>Your Location</Popup>
                            </Marker>
                        )}

                        {Object.entries(routes).map(([shelterId, coords]) => {
                            const isNearest = nearestShelter === Number(shelterId);
                            return (
                                <Polyline
                                    key={`route-${shelterId}`}
                                    positions={coords}
                                    color={isNearest ? '#22c55e' : '#94a3b8'}
                                    weight={isNearest ? 5 : 3}
                                    opacity={isNearest ? 0.9 : 0.6}
                                    dashArray={isNearest ? undefined : '5, 5'}
                                />
                            );
                        })}

                        {shelters.map(shelter => (
                            <Marker
                                key={shelter.id}
                                position={[shelter.lat, shelter.lng]}
                                icon={nearestShelter === shelter.id ? greenIcon : new L.Icon.Default()}
                            >
                                <Popup>
                                    <strong>{shelter.name}</strong><br />
                                    Capacity: {shelter.capacity}<br />
                                    Occupancy: {shelter.occupancy}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                    <h2 className="font-bold text-slate-800 text-lg">Nearby Shelters</h2>
                    <div className="space-y-4">
                        {shelters.map((shelter) => {
                            const isNearest = nearestShelter === shelter.id;
                            return (
                                <div
                                    key={shelter.id}
                                    className={`border rounded-lg p-4 shadow-sm transition-colors ${isNearest ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-semibold text-base ${isNearest ? 'text-green-800' : 'text-slate-800'}`}>
                                            {shelter.name}
                                        </h3>
                                        {isNearest && <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">Nearest</span>}
                                    </div>
                                    <div className={`space-y-1 text-sm ${isNearest ? 'text-green-700' : 'text-slate-600'}`}>
                                        <p>Address: {shelter.address}</p>
                                        <p>Capacity: {shelter.capacity}</p>
                                        <p>Current Occupancy: {shelter.occupancy}</p>
                                        <p>Available Space: {shelter.capacity - shelter.occupancy}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
