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
  const [centerLocation, setCenterLocation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPosition, setNewPosition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    has_ramp: false,
    has_toilet: false,
    has_tactile: false,
  });
  const [filters, setFilters] = useState({
    has_ramp: false,
    has_toilet: false,
    has_tactile: false,
  });
  const [radius, setRadius] = useState(500);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/locations/')
      .then((res) => setLocations(res.data));
  }, []);

  const handleLocationClick = (loc) => {
    setSelectedLocation(loc);
    setCenterLocation({ latitude: loc.latitude, longitude: loc.longitude });
    setIsSearching(false);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setNewPosition({ lat, lng });
    setCenterLocation(null); // Скасовуємо фокус на попередню точку
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

    setLoading(true);

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

      const res = await axios.get('http://localhost:8000/api/locations/');
      setLocations(res.data);
    } catch (error) {
      console.error('Помилка при додаванні локації:', error);
      alert('Щось пішло не так при додаванні локації.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters =
      (filters.has_ramp ? loc.has_ramp : true) &&
      (filters.has_toilet ? loc.has_adapted_toilet : true) &&
      (filters.has_tactile ? loc.has_tactile_elements : true);
    return matchesSearch && matchesFilters;
  });

  const MapCenter = ({ location }) => {
    const map = useMapEvents({});

    useEffect(() => {
      if (location) {
        map.setView([location.latitude, location.longitude], 16);
      }
    }, [location]);

    return null;
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
        {isSearching ? (
          <>
            <button className="back-btn" onClick={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}>← Назад</button>

            <div className="search-results">
              <h3>Результати пошуку:</h3>
              {filteredLocations.length === 0 ? (
                <p>Нічого не знайдено</p>
              ) : (
                <ul>
                  {filteredLocations.map((loc) => (
                    <li key={loc.id} onClick={() => handleLocationClick(loc)}>
                      <strong>{loc.name}</strong><br />
                      <small>{loc.description?.slice(0, 50)}...</small>
                    </li>
                  ))}
                </ul>
              )}
              <div className="filter-section">
                <h3>Фільтри доступності</h3>
                    <ul className="location-filter-list">
                      <li>
                        <label>
                          <input
                            className="location-filter"
                            type="checkbox"
                            name="has_ramp"
                            checked={filters.has_ramp}
                            onChange={(e) => setFilters({ ...filters, has_ramp: e.target.checked })}
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
                              checked={filters.has_toilet}
                              onChange={(e) => setFilters({ ...filters, has_toilet: e.target.checked })}
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
                                    checked={filters.has_tactile}
                                     onChange={(e) => setFilters({ ...filters, has_tactile: e.target.checked })}
                                  />
                              Тактильна навігація
                      </label>
                   </li>
               </ul>
            </div>
            </div>
          </>
        ) : (
          <>
            <div className="user-section">
              <button className="login-btn">Увійти</button>
            </div>

            <div className="route-inputs">
              <h2>Введіть маршрут</h2>
              <input
                type="text"
                 placeholder="Звідки"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
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
          </>
        )}
      </div>

      <div className="map-main">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук локації..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearching(true)}
          />
        </div>

        <MapContainer center={[50.45, 30.52]} zoom={13} className="leaflet-container">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          <MapCenter location={centerLocation} />

          {(isSearching ? filteredLocations : locations).map((loc) => (
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

          {selectedLocation && !isSearching && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
              icon={new L.Icon({
                iconUrl: require('leaflet/dist/images/marker-icon.png'),
                iconSize: [30, 50],
                iconAnchor: [15, 50],
              })}
            >
              <Popup open>
                <strong>{selectedLocation.name}</strong><br />
                {selectedLocation.description?.slice(0, 100)}...
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
