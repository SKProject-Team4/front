import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // React Router 임포트
import AuthPage from './pages/AuthPage'; 
import MainPage from './pages/MainPage'; 
import StartPlanningPage from './pages/StartPlanningPage'; 

function App() {
  return (
    <Router> {/* BrowserRouter로 전체 앱을 감싸야 합니다! */}
      <Routes> {/* 모든 라우트 정의는 Routes 안에 있어야 합니다. */}
        {/* 루트 경로 '/'는 AuthPage */}
        <Route path="/" element={<AuthPage />} /> 
        {/* '/main' 경로는 MainPage */}
        <Route path="/main" element={<MainPage />} />
        {/* '/start-planning-page' 경로는 StartPlanningPage */}
        <Route path="/start-planning-page" element={<StartPlanningPage />} />
      </Routes>
    </Router>
  );
}

export default App;