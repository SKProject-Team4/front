import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './AuthPage.css';
import logo from '../assets/logo.png';
import AuthService from '../services/AuthService';
import CustomAlert from '../components/CustomAlert';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [emailError, setEmailError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate();

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

    const result = await AuthService.checkEmailDuplicate(email);
    if (!result.success) {
      return result.message;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const result = await AuthService.login(formData.email, formData.password);

      if (result.success) {
        localStorage.setItem('userToken', result.token);
        setAlertMessage('로그인 성공! 메인 페이지로 이동합니다.');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setAlertMessage('로그인 실패: ' + result.message);
        console.error('로그인 실패 (AuthPage):', result.message);
      }
    } else {
      const { name, email, password, confirmPassword } = formData;

      if (password !== confirmPassword) {
        setAlertMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      const emailValidationMessage = await validateEmail(email);
      if (emailValidationMessage) {
        setEmailError(emailValidationMessage);
        return;
      }

      const registerResult = await AuthService.register(name, email, password);

      if (registerResult.success) {
        setAlertMessage('회원가입이 성공적으로 완료되었습니다! 이제 로그인할 수 있습니다.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        setAlertMessage('회원가입 실패: ' + registerResult.message);
        console.error('회원가입 실패 (AuthPage):', registerResult.message);
      }
    }
  };

  const handleTempLogin = () => {
    const tempToken = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';
    localStorage.setItem('userToken', tempToken);
    setAlertMessage('임시 로그인 성공! 메인 페이지로 이동합니다.');
    setTimeout(() => navigate('/'), 1000);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setEmailError('');
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
            <Link to="/">
              <img src={logo} alt="애플리케이션 로고" />
            </Link>
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

        {isLogin && (
          <button type="button" onClick={handleTempLogin} className="temp-login-btn">
            임시 로그인 (개발용)
          </button>
        )}

        <div className="toggle-section">
          <p>
            {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLogin ? '회원 가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>

      {/* 💡 커스텀 알림창 */}
      {alertMessage && (
        <CustomAlert message={alertMessage} onClose={() => setAlertMessage('')} />
      )}
    </div>
  );
}

export default AuthPage;
