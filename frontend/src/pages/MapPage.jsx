import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllLocations } from '../api/locationApi';
import './MapPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MapPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPosition, setNewPosition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    has_ramp: false,
    has_toilet: false,
    has_tactile: false,
  });
  const [nearbyLocations, setNearbyLocations] = useState([]); 
  const [radius, setRadius] = useState(500); 

  const navigate = useNavigate();

  // const getLocations = async () => {
  //   const data = await getAllLocations();
  //   setLocations(data || []);
  // };

  // useEffect(() => {
  //   getLocations();
  // }, []);
  useEffect(() => {
    axios
      .get('http://localhost:8000/api/locations/')
      .then((res) => setLocations(res.data))
  }, []);

  const handleLocationClick = (loc) => {
    setSelectedLocation(loc);
    navigate(`/location/${loc.id}`);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setNewPosition({ lat, lng });

    // Обчислюємо локації, які знаходяться в заданому радіусі від точки кліку
    const clickedLatLng = L.latLng(lat, lng);
    const nearby = locations.filter((loc) => {
      const locationLatLng = L.latLng(loc.latitude, loc.longitude);
      return clickedLatLng.distanceTo(locationLatLng) <= radius;
    });

    setNearbyLocations(nearby); // Оновлюємо список локацій поблизу
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPosition) {
      alert("Оберіть точку на мапі!");
      return;
    }

    const data = {
      ...formData,
      latitude: newPosition.lat,
      longitude: newPosition.lng,
    };

    console.log('Нова локація:', data);
    alert('Локацію додано!');
    setFormData({
      name: '',
      description: '',
      has_ramp: false,
      has_toilet: false,
      has_tactile: false,
    });
    setNewPosition(null);
    setShowAddForm(false);
  };

  const LocationMarker = () => {
    useMapEvents({
      click: handleMapClick,
    });

    return newPosition ? (
      <Marker
        position={newPosition}
        icon={new L.Icon({
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      >
        <Popup>
          <strong>Нова точка</strong><br />
          Широта: {newPosition.lat.toFixed(5)}, Довгота: {newPosition.lng.toFixed(5)}
        </Popup>
      </Marker>
    ) : null;
  };

  return (
    <div className="map-page-container">
      <div className="sidebar">
        <div className="user-section">
          <button className="login-btn">Увійти</button>
        </div>

        <div className="route-inputs">
          <h2>Введіть маршрут</h2>
          <input type="text" placeholder="Звідки" />
          <input type="text" placeholder="Куди" />
        </div>

        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Скасувати' : 'Додати локацію'}
        </button>

        {showAddForm && (
          <form className="location-form" onSubmit={handleSubmit}>
            <input className='location-name'
              type="text"
              name="name"
              placeholder="Назва"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <textarea className='location-desc'
              name="description"
              placeholder="Опис"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
            <ul className='location-filter-list'>
              <li>
                <label>
                  <input className='location-filter'
                    type="checkbox"
                    name="has_ramp"
                    checked={formData.has_ramp}
                    onChange={(e) => setFormData({ ...formData, has_ramp: e.target.checked })}
                  />
                  Є пандус
                </label>
              </li>
              <li>
                <label>
                  <input className='location-filter'
                    type="checkbox"
                    name="has_toilet"
                    checked={formData.has_toilet}
                    onChange={(e) => setFormData({ ...formData, has_toilet: e.target.checked })}
                  />
                  Адаптований туалет
                </label>
              </li>
              <li>
                <label>
                  <input className='location-filter'
                    type="checkbox"
                    name="has_tactile"
                    checked={formData.has_tactile}
                    onChange={(e) => setFormData({ ...formData, has_tactile: e.target.checked })}
                  />
                  Тактильна навігація
                </label>
              </li>
            </ul>
            <button type="submit" className='save-btn'>Зберегти</button>
            <p><small>📍 Натисніть на мапу для вибору точки</small></p>
          </form>
        )}

        <div className="extra-section">
          {nearbyLocations.length > 0 && (
            <div>
              <h3>Локації поблизу:</h3>
              <ul>
                {nearbyLocations.map((loc) => (
                  <li key={loc.id}>{loc.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="map-main">
        <div className="search-bar">
          <input type="text" placeholder="Пошук локації..." />
        </div>

        <MapContainer center={[50.45, 30.52]} zoom={13} className="leaflet-container">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />

          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={new L.Icon({
                iconUrl: require('leaflet/dist/images/marker-icon.png'),
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })}
              eventHandlers={{
                click: () => handleLocationClick(loc),
              }}
            >
              <Popup>
                <strong>{loc.name}</strong><br />
                <a href={`/location/${loc.id}`}>Детальніше →</a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
