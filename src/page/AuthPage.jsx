import { useState } from 'react'
import './AuthPage.css'
import logo from '../assets/logo.png';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLogin) {
      console.log('로그인 시도:', { email: formData.email, password: formData.password })
    } else {
      console.log('회원가입 시도:', formData)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <div className="logo-section">
           <div className="logo">
            <img src={logo} alt="애플리케이션 로고" /> {/* ✅ 임포트한 logo 변수 사용 */}
          </div>
          <h1 className="welcome-title">
            {isLogin ? '안녕하세요!' : '회원 가입'}
          </h1>
          <p className="subtitle">
            {isLogin ? '로그인 정보를 입력해주세요.' : '새로운 여행의 시작을 함께해요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="toggle-section">
          <p>
            {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLogin ? '회원 가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage