//імпорти
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MapPage.css';
import { Polyline } from 'react-leaflet';
//-----------



const MapPage = () => {
  //оголошення
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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: '' });
  const navigate = useNavigate();
//-------------------

  
  //запит: рейтинг і відгуки
  const fetchLocationDetails = async (locationId) => {
  try {
    const [reviewsRes, ratingRes] = await Promise.all([
      axios.get(`http://localhost:8000/api/location-reviews/?location=${locationId}`),
      axios.get(`http://localhost:8000/api/average-rating/${locationId}/`)
    ]);

    setActiveLocation((prev) => ({
      ...prev,
      reviews: reviewsRes.data,
      average_rating: ratingRes.data.average_rating,
    }));
  } catch (error) {
    console.error('Помилка при завантаженні деталей локації:', error);
  }
};
useEffect(() => {
  if (activeLocation?.id) {
    fetchLocationDetails(activeLocation.id);
  }
}, [activeLocation?.id]);
  //---------------------
  

  //запит: список локацій
  useEffect(() => {
    axios.get('http://localhost:8000/api/locations/')
      .then((res) => setLocations(res.data));
  }, []);
  //--------------

  //клік на локацію
  const handleLocationClick = (loc) => {
    setSelectedLocation(loc);
    setCenterLocation({ latitude: loc.latitude, longitude: loc.longitude });
    setIsSearching(false);
    setActiveLocation(loc);
  };
  //------------------

  //відправка відгуку
  const handleReviewSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:8000/api/reviews/', {
      location: activeLocation.id,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });

    alert('Відгук надіслано!');
    setReviewData({ rating: 0, comment: '' });

    await fetchLocationDetails(activeLocation.id);
  } catch (error) {
    console.error('Помилка при додаванні відгуку:', error);
    alert('Щось пішло не так при додаванні відгуку.');
  }
};
  //----------------

  //нова мітка
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setNewPosition({ lat, lng });
    setCenterLocation(null); // Скасовуємо фокус на попередню точку
  };
  //--------------

  //додавання нової локаціїї
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
  //---------------

  //фільтруємо
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters =
      (filters.has_ramp ? loc.has_ramp : true) &&
      (filters.has_toilet ? loc.has_adapted_toilet : true) &&
      (filters.has_tactile ? loc.has_tactile_elements : true);
    return matchesSearch && matchesFilters;
  });
  //-------------------

  //переміщуємо мапу до локації
  const MapCenter = ({ location }) => {
    const map = useMapEvents({});

    useEffect(() => {
  if (location) {
    map.setView([location.latitude, location.longitude], 16);
  }
}, [location, map]);

    return null;
  };
  //------------------------

  //шаблон для маршрутів
  const handleBuildRoute = async () => {
  if (!fromQuery || !toQuery) {
    alert("Введіть обидві точки маршруту.");
    return;
  }

  try {
    const response = await axios.post('http://localhost:8000/api/route/', {
      from: fromQuery,
      to: toQuery,
      filters: {
        has_ramp: filters.has_ramp,
        has_toilet: filters.has_toilet,
        has_tactile: filters.has_tactile,
      }
    });
    const routeCoords = response.data.coordinates; // очікується масив [ [lat, lng], [lat, lng], ... ]
    setRouteCoordinates(routeCoords);
    setRouteInfo(response.data.info);
  } catch (error) {
    console.error("Помилка при побудові маршруту:", error);
    alert("Не вдалося побудувати маршрут.");
  }
};
//------------------

  //створюємо маркер
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
  //-------------------------

  //колір рейтинга
  const getColor = (rating) => {
  if (rating >= 7) return 'green';
  if (rating >= 4) return 'gold';
  return 'red';
};
//----------------
 
  return (
    <div className="map-page-container">
          {/*Сайдбари */} 
      <div className="sidebar">
        {activeLocation ? (
    // Якщо вибрана локація, відображаємо новий сайдбар з деталями
    <div className="detailed-location-sidebar">
  <button onClick={() => setActiveLocation(null)} className="back-btn">
    ← Назад
  </button>
  <h2 className='Select-location-name'>{activeLocation.name}</h2>
  <p className='Select-location-desc'>{activeLocation.description}</p>
  <div className="tags">
  <div className="tag">
    {activeLocation.has_ramp ? '✅' : '❌'} Пандус
  </div>
  <div className="tag">
    {activeLocation.has_toilet ? '✅' : '❌'} Адаптований туалет
  </div>
  <div className="tag">
    {activeLocation.has_tactile_elements ? '✅' : '❌'} Тактильні елементи
  </div>
</div>

  {activeLocation.average_rating && (
    <div className="average-rating">
  <strong /*style={{ color: getColor(review.rating) }}*/>
    <span style={{ color: getColor(activeLocation.average_rating) }}>
      {activeLocation.average_rating}
    </span>
    <span style={{ color: 'gray' }}> / </span>
                  <span style={{ color: 'green' }}>10</span>
                  {/*{review.rating} / 10*/}
  </strong>
</div>
  )}

  {/* ======= Форма для залишення відгуку ======= */}
<form
  onSubmit={handleReviewSubmit}
  className={`review-form`}
>
  <label className='location-your-rating'>
    Оцінка (1-10):&nbsp;
    <input
      type="number"
      value={reviewData.rating}
      onChange={(e) =>
        setReviewData({ ...reviewData, rating: e.target.value })
      }
      min="1"
      max="10"
      required
    />
  </label>
  <br />
  <textarea className='location-your-comment'
    placeholder="Ваш коментар"
    value={reviewData.comment}
    onChange={(e) =>
      setReviewData({ ...reviewData, comment: e.target.value })
    }
    required
  ></textarea>
  <br />
  <button type="submit" className='com-btn'>Надіслати відгук</button>
            </form>
            {/*-----Відгуки-----*/}
            {activeLocation && activeLocation.reviews && (
  <div className="reviews-wrapper">
    <div className="reviews-list">
    <h3>Відгуки:</h3>
    {activeLocation.reviews.map((review) => (
      <div key={review.id} className="review-item">
        <div className="review-content">
          <div className="review-item-comment">
            {/* 
            <div className="review-item-username">
              {review.username}
            </div> 
            */}
            {review.comment}
          </div>
          <div className="review-meta">
            <div
              className="review-item-rating"
              /*style={{ color: getColor(review.rating) }}*/
            >
              {/*{review.rating} / 10*/}
              <span style={{ color: getColor(activeLocation.average_rating) }}>
      {activeLocation.average_rating}
    </span>
    <span style={{ color: 'gray' }}> / </span>
    <span style={{ color: 'green' }}>10</span>
            </div>
            <div className="review-item-date">
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
  </div>
)}
</div>

        ) : isSearching ? (
            //результати пошуку
          <>
            <button className="back-btn" onClick={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}>← Назад</button>

            <div className="search-results">
                <h3 className='Search-list-title'>Результати пошуку:</h3>
                
                <div className="search-list-wrapper">
              {filteredLocations.length === 0 ? (
                <p className='Search-list-item'>Нічого не знайдено</p>
              ) : (
                <ul className='Search-list-box'>
                  {filteredLocations.map((loc) => (
                    <li key={loc.id} onClick={() => handleLocationClick(loc)} className='Search-list-item'>
                      <strong>{loc.name}</strong><br />
                      <small>{loc.description?.slice(0, 50)}...</small>
                    </li>
                  ))}
                </ul>
                  )}
                  </div>
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
                              Тактильні елементи
                      </label>
                   </li>
               </ul>
            </div>
            </div>
          </>
          ) : (
              //стандартний сайдбар
          <>
            <div className="user-section">
              <button className="login-btn">Увійти</button>
            </div>

            <div className="route-inputs">
              <h2>Введіть маршрут</h2>
              <input
                 type="text"
                 placeholder="Звідки"
                 value={fromQuery}
                 onChange={(e) => setFromQuery(e.target.value)}
              />
              <input
                type="text"
                placeholder="Куди"
                 value={toQuery}
                 onChange={(e) => setToQuery(e.target.value)}
              />
              <button onClick={handleBuildRoute} className="build-route-btn">Побудувати маршрут</button>

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
                      Тактильні елементи
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
          {routeCoordinates.length > 0 && (
          <Polyline positions={routeCoordinates} color="blue" weight={6} />
          )}
          {routeInfo && (
            <div className="route-info-box">
            <p>Відстань: {routeInfo.distance}</p>
           <p>Час: {routeInfo.time}</p>
            </div>
            )}

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
