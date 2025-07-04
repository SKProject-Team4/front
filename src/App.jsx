import { useState } from 'react'
import AuthPage from './page/AuthPage'

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
      {renderPage()}
    </div>
  )
}

export default App