// src/api/locationApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api'; // змінити на свій бекенд

export const getLocations = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/locations/`);
    return res.data;
  } catch (err) {
    console.error('Помилка при завантаженні локацій', err);
    return [];
  }
};

export const addLocation = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/locations/`, data);
    return res.data;
  } catch (err) {
    console.error('Помилка при створенні локації', err);
    return null;
  }
};

export const getLocationById = async (id) => {
  try {
    const response = await fetch(`/api/locations/${id}/`);
    return await response.json();
  } catch (error) {
    console.error("Помилка при завантаженні локації:", error);
    return null;
  }
};

export const postReview = async (locationId, reviewData) => {
  try {
    const response = await fetch(`/api/locations/${locationId}/reviews/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      throw new Error('Не вдалося надіслати відгук');
    }

    return await response.json();
  } catch (error) {
    console.error("Помилка відправки відгуку:", error);
    return null;
  }
};

export const getAllLocations = async () => {
  try {
    const response = await fetch('API_URL'); // Замість 'API_URL' вказати вашу реальну URL адресу
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();  // Переконатися, що сервер повертає JSON
    return data;
  } catch (error) {
    console.error('Помилка при отриманні локацій:', error);
    return []; // Повертаємо порожній масив у разі помилки
  }
};

