import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1 className="logo">Free2Go</h1>
        <div className="auth-buttons">
          <button onClick={() => alert('Login functionality coming soon')}>Увійти</button>
          <button onClick={() => alert('Register functionality coming soon')}>Зареєструватися</button>
        </div>
      </header>

      <main className="homepage-main">
        <h2>Вітаємо у Free2Go</h2>
        <p>
          Free2Go — це сервіс для пошуку доступних локацій для людей з інвалідністю та маломобільних
          груп. Ми допомагаємо знаходити місця з пандусами, адаптованими туалетами та тактильною навігацією.
        </p>

        <button className="map-button" onClick={() => navigate('/map')}>
          Переглянути мапу
        </button>
      </main>

      <footer className="homepage-footer">
        <p>© 2025 Free2Go. Всі права захищено.</p>
      </footer>
    </div>
  );
};

export default HomePage;