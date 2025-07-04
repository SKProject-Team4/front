import { useState } from 'react'
import AuthPage from './components/AuthPage'
import HomePage from './components/HomePage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('auth') // 'auth' 또는 'home'

  const renderPage = () => {
    switch(currentPage) {
      case 'auth':
        return <AuthPage />
      case 'home':
        return <HomePage />
      default:
        return <AuthPage />
    }
  }

  return (
    <div className="app">
      {/* 페이지 전환을 위한 간단한 네비게이션 (개발용) */}
      <div className="nav-buttons">
        <button 
          onClick={() => setCurrentPage('auth')}
          className={currentPage === 'auth' ? 'active' : ''}
        >
          로그인 페이지
        </button>
        <button 
          onClick={() => setCurrentPage('home')}
          className={currentPage === 'home' ? 'active' : ''}
        >
          홈 페이지
        </button>
      </div>
      
      {renderPage()}
    </div>
  )
}

export default App