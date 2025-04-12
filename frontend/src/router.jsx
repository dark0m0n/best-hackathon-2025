import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import AddLocation from './pages/AddLocation';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/map" element={<MapPage />} />
    <Route path="/add" element={<AddLocation />} />
  </Routes>
);

export default AppRouter;
