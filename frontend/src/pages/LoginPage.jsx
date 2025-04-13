import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    fetch('http://localhost:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Неправильний логін або пароль');
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem('authToken', data.token);
        navigate('/');
      })
      .catch((error) => {
        setErrorMessage(error.message || 'Сталася помилка при вході');
      });
  };
  

  return (
    <div className="auth-page">
      <h2>Вхід</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Ім'я користувача
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Увійти</button>
      </form>
      <p>
        Немає акаунту? <a href="/register">Зареєструйтесь</a>
      </p>
    </div>
  );
};

export default LoginPage;
