import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MapPage.css';

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
  const [radius, setRadius] = useState(500); // в метрах
  const [loading, setLoading] = useState(false); // Стан для індикатора завантаження

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/locations/')
      .then((res) => setLocations(res.data));
  }, []);

  const handleLocationClick = (loc) => {
    setSelectedLocation(loc);
    navigate(`/location/${loc.id}`);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setNewPosition({ lat, lng });

    // Запит для фільтрації локацій поблизу
    axios
      .get('http://localhost:8000/api/locations/', {
        params: {
          latitude: lat,
          longitude: lng,
          radius: radius,
        },
      })
      .then((res) => {
        setNearbyLocations(res.data);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPosition) {
      alert('Оберіть точку на мапі!');
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description,
      has_ramp: formData.has_ramp,
      has_adapted_toilet: formData.has_toilet,
      has_tactile_elements: formData.has_tactile,
      coordinates: `SRID=4326;POINT (${newPosition.lng} ${newPosition.lat})`,
      category: 'default',
    };

    setLoading(true); // Початок завантаження

    try {
      await axios.post('http://localhost:8000/api/locations/', data);
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

      // Перезавантаження списку локацій
      const res = await axios.get('http://localhost:8000/api/locations/');
      setLocations(res.data);
    } catch (error) {
      console.error('Помилка при додаванні локації:', error);
      alert('Щось пішло не так при додаванні локації.');
    } finally {
      setLoading(false); // Завершення завантаження
    }
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
            <input
              className="location-name"
              type="text"
              name="name"
              placeholder="Назва"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <textarea
              className="location-desc"
              name="description"
              placeholder="Опис"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
            <ul className="location-filter-list">
              <li>
                <label>
                  <input
                    className="location-filter"
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
                  <input
                    className="location-filter"
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
                  <input
                    className="location-filter"
                    type="checkbox"
                    name="has_tactile"
                    checked={formData.has_tactile}
                    onChange={(e) => setFormData({ ...formData, has_tactile: e.target.checked })}
                  />
                  Тактильна навігація
                </label>
              </li>
            </ul>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Завантаження...' : 'Зберегти'}
            </button>
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
