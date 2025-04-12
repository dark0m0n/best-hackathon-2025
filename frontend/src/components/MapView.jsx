// Frontend: React (with Leaflet)
// File: MapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MapView() {
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/locations/')
      .then((res) => setLocations(res.data))
      .catch((err) => setError('Не вдалося завантажити дані'));
  }, []);
  console.log(locations)

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <MapContainer center={[49.8397, 24.0297]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
            <Popup>{loc.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
