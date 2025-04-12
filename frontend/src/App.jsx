// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import LocationDetails from './pages/LocationDetails'; // 🆕

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/location/:id" element={<LocationDetails />} /> {/* 🆕 */}
      </Routes>
    </Router>
  );
}

export default App;
