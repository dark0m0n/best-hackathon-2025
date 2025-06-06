import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    is_disable: false,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Паролі не збігаються');
      return;
    }

    fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        is_disable: formData.is_disable,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          navigate('/login'); // після успішної реєстрації перенаправляємо на сторінку входу
        } else {
          setErrorMessage(data.error || 'Щось пішло не так');
        }
      })
      .catch((error) => {
        console.error('Registration error:', error);
        setErrorMessage('Сталася помилка при реєстрації');
      });
  };

  return (
    <div className="auth-page">
      <h2>Реєстрація</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div class="form-group">
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
        </div>
        <div class="form-group">
        <label>
          Ім'я
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </label>
        </div>
        <div class="form-group">
        <label>
          Прізвище
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </label>
        </div>
        <div class="form-group">
        <label>
          Електронна пошта
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        </div>
        <div class="form-group">
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
        </div>
        <div class="form-group">
        <label>
          Підтвердження пароля
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          </label>
          </div>
        <div class="form-group">
        <label>
          <input 
            type="checkbox"
            name="is_disable"
            checked={formData.is_disable}
            onChange={handleChange}
          />
          Ви є інвалідом?
          </label>
          </div>
        <button type="submit">Зареєструватися</button>
      </form>
      <p>
        Маєте акаунт? <a href="/login">Увійти</a>
      </p>
    </div>
  );
};

export default RegisterPage;
