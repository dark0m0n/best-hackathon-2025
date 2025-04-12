// src/pages/LocationDetails.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react'; // Додаємо useCallback
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { getLocationById, postReview } from '../api/locationApi';
import './LocationDetails.css';

const LocationDetails = () => {
  const { id } = useParams();  // Отримуємо id з параметрів маршруту
  const [location, setLocation] = useState(null);  // Стан для локації
  const [username, setUsername] = useState('');  // Стан для імені користувача
  const [comment, setComment] = useState('');  // Стан для відгуку
  const [success, setSuccess] = useState(false);  // Стан для повідомлення про успішну відправку
  const [error, setError] = useState('');  // Стан для повідомлення про помилку

  // Використовуємо useCallback, щоб функція не змінювалась при кожному рендері
  const getLocation = useCallback(async () => {
    try {
      const data = await getLocationById(id);  // Отримуємо локацію за id
      setLocation(data);
    } catch (error) {
      setError('Не вдалося завантажити локацію');
    }
  }, [id]);

  useEffect(() => {
    getLocation();  // Завантажуємо дані локації при зміні id
  }, [getLocation]); // Тепер getLocation є залежністю

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !comment) {
      setError('Заповніть всі поля');
      return;
    }

    const result = await postReview(id, { username, comment });

    if (result) {
      setSuccess(true);
      setUsername('');
      setComment('');
      setError('');
      getLocation(); // Оновлюємо відгуки після надсилання нового
    } else {
      setError('Щось пішло не так');
    }
  };

  if (!location) return <p>Завантаження...</p>;

  return (
    <div className="location-details">
      <h2>{location.name}</h2>
      <p>{location.description}</p>

      <ul>
        {location.has_ramp && <li>✅ Є пандус</li>}
        {location.has_toilet && <li>🚻 Адаптований туалет</li>}
        {location.has_tactile && <li>👣 Тактильна навігація</li>}
      </ul>

      <div className="mini-map">
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={17}
          style={{ height: '200px', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={[location.latitude, location.longitude]}
            icon={new L.Icon({
              iconUrl: require('leaflet/dist/images/marker-icon.png'),
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          />
        </MapContainer>
      </div>

      <h3>Відгуки</h3>
      {location.reviews?.length ? (
        <ul>
          {location.reviews.map((r, i) => (
            <li key={i}>
              <strong>{r.username}</strong>: {r.comment}
            </li>
          ))}
        </ul>
      ) : (
        <p>Ще немає відгуків.</p>
      )}

      <button className="review-btn">Залишити відгук</button>
      <h3>Залишити відгук</h3>
      <form onSubmit={handleSubmit} className="review-form">
        <input
          type="text"
          placeholder="Ваше ім’я"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <textarea
          placeholder="Ваш відгук"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <button type="submit">Надіслати</button>
        {success && <p className="success-msg">Відгук надіслано ✅</p>}
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
};

export default LocationDetails;
