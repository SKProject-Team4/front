import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 임포트
import './AuthPage.css';
import logo from '../assets/logo.png';

// onGoToMain prop을 제거합니다.
function AuthPage() { 
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [emailError, setEmailError] = useState('');

  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email') {
      setEmailError('');
    }
  };

  const validateEmail = async (email) => {
    if (!email.includes('@') || !email.includes('.')) {
      return '유효한 이메일 형식이 아닙니다.';
    }

    try {
      const response = await fetch('/api/check-email-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return errorData.message || '이메일 중복 확인 중 오류가 발생했습니다.';
      }

      const data = await response.json(); 

      if (data.isDuplicate) {
        return '이미 등록된 이메일입니다.';
      }

      return '';
    } catch (error) {
      console.error('이메일 중복 확인 네트워크 오류:', error);
      return '네트워크 오류로 이메일 중복 확인에 실패했습니다.';
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();

    if (isLogin) {
      console.log('로그인 시도:', { email: formData.email, password: formData.password });
      // 로그인 성공 시 MainPage로 이동 (예시)
      // navigate('/main'); 
    } else {
      const { name, email, password, confirmPassword } = formData;

      if (password !== confirmPassword) {
        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      const error = await validateEmail(email);
      if (error) {
        setEmailError(error);
        return;
      }

      console.log('회원가입 시도:', formData);
      
      try {
        const registerResponse = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password 
          }),
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          alert('회원가입 실패: ' + (errorData.message || '알 수 없는 오류'));
          return;
        }

        alert('회원가입이 성공적으로 완료되었습니다!');
        setIsLogin(true); 
        setFormData({ name: '', email: '', password: '', confirmPassword: '' }); 
        // 회원가입 성공 후 MainPage로 이동 (선택 사항)
        // navigate('/main'); 

      } catch (error) {
        console.error('회원가입 네트워크 오류:', error);
        alert('회원가입 중 네트워크 오류가 발생했습니다.');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setEmailError('');
  };

  const goToMainPage = () => {
    navigate('/'); // React Router를 사용하여 '/main' 경로로 이동
  };

  return (
    <div className="auth-page">
      <div className="catchphrase-section">
        <h2 className="catchphrase-title">"여행이 쉬워진다, AI와 함께라면."</h2>
        <p className="catchphrase-subtitle">당신만의 맞춤 일정과 최고의 경로, 단 한 번의 클릭으로.</p>
      </div>
      <div className="auth-form-container">
        <div className="logo-section">
           <div className="logo">
            <img src={logo} alt="애플리케이션 로고" />
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
              <label>성함</label>
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
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {!isLogin && emailError && (
              <p className="error-message">{emailError}</p>
            )}
          </div>
          
          <div className="input-group">
            <label>비밀번호</label>
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
              <label>비밀번호 확인</label>
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

        {/* 메인 페이지로 이동 버튼 */}
        <div className="main-page-link-section">
          <button type="button" onClick={goToMainPage} className="go-to-main-btn">
            메인 페이지로 이동 (비회원)
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage;