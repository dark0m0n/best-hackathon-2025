import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Перевірка, чи є автентифікація
    const token = localStorage.getItem('authToken'); // приклад перевірки через токен
    if (token) {
      // Якщо токен є, то перевіряємо дані користувача через API
      fetch('/api/current_user/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.is_authenticated) {
            setIsAuthenticated(true);
            setUserData(data.user);  // Зберігаємо дані користувача
          }
        })
        .catch(error => {
          console.log('Error fetching user data:', error);
        });
    }
  }, []);

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1 className="logo">Free2Go</h1>
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <div className="user-profile">
                <img src={userData.avatar} alt="User Avatar" className="user-avatar" />
                <span className="user-nickname">{userData.username}</span>
              </div>
              {userData.is_staff ? (
                <button onClick={() => navigate('/accessibility-levels')}>Рівні доступності</button>
              ) : (
                <button onClick={() => navigate('/user-level')}>Характеристика рівня</button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}>Увійти</button>
              <button onClick={() => navigate('/register')}>Зареєструватися</button>
            </>
          )}
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
