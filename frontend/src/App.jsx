import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapView from './components/MapView';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
      </Routes>
    </Router>
  );
}
