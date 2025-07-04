import { useState } from 'react'
import './AuthPage.css'

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
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-form">
            <div className="logo-section">
              <h1 className="logo">AI 여행 추천</h1>
              <h2 className="welcome-title">
                {isLogin ? '안녕하세요' : '회원 가입'}
              </h2>
              <p className="subtitle">
                {isLogin ? '로그인하여 맞춤형 여행을 추천받아보세요' : '새로운 여행의 시작을 함께해요'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="form">
              {!isLogin && (
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="이름"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {!isLogin && (
                <div className="input-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="비밀번호 확인"
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
                  {isLogin ? '회원가입' : '로그인'}
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="hero-image">
            <img 
              src="https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="비행기"
            />
            <div className="hero-overlay">
              <h3>새로운 여행의 시작</h3>
              <p>AI가 추천하는 맞춤형 여행으로 특별한 경험을 만들어보세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage