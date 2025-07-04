import MainPage from './pages/MainPage';
import StartPlanning from './pages/StartPlanningPage';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
     <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/start-planning-page" element={<StartPlanning />} />
      </Routes>
    </Router>
  );
}

export default App;