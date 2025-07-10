import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './AuthPage.css'; // AuthPage.css 파일의 경로가 AuthPage.jsx와 같은 폴더에 있다고 가정
import logo from '../assets/logo.png'; // src/pages/에서 봤을 때 src/assets/logo.png

// AuthService 임포트 경로 
import AuthService from '../services/AuthService'; 

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', // username 대신 name으로 사용 중
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [emailError, setEmailError] = useState('');

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email') {
      setEmailError(''); // 이메일 입력 시 오류 메시지 초기화
    }
  };

  const validateEmail = async (email) => {
    if (!email.includes('@') || !email.includes('.')) {
      return '유효한 이메일 형식이 아닙니다.';
    }

    // ★★★ 이메일 중복 확인 API 연동 - AuthService 사용 ★★★
    const result = await AuthService.checkEmailDuplicate(email);
    if (!result.success) {
      return result.message; // 에러 메시지 반환
    }
    return ''; // 에러 없음
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      console.log('로그인 시도:', { email: formData.email, password: formData.password });

      // ★★★ 로그인 API 연동 - AuthService 사용 ★★★
      const result = await AuthService.login(formData.email, formData.password);

      if (result.success) {
        localStorage.setItem('userToken', result.token);
        alert('로그인 성공! 메인 페이지로 이동합니다.');
        navigate('/');
      } else {
        alert('로그인 실패: ' + result.message);
        console.error('로그인 실패 (AuthPage):', result.message);
      }

    } else { // 회원가입 로직
      const { name, email, password, confirmPassword } = formData;

      if (password !== confirmPassword) {
        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      // 회원가입 전에 이메일 유효성 및 중복 확인
      const emailValidationMessage = await validateEmail(email);
      if (emailValidationMessage) {
        setEmailError(emailValidationMessage);
        return;
      }

      console.log('회원가입 시도:', formData);

      // ★★★ 회원가입 API 연동 - AuthService 사용 ★★★
      const registerResult = await AuthService.register(name, email, password);

      if (registerResult.success) {
        alert('회원가입이 성공적으로 완료되었습니다! 이제 로그인할 수 있습니다.');
        setIsLogin(true); // 회원가입 성공 후 로그인 모드로 전환
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        alert('회원가입 실패: ' + registerResult.message);
        console.error('회원가입 실패 (AuthPage):', registerResult.message);
      }
    }
  };

  // ★★★ 임시 로그인 함수 추가 ★★★
  const handleTempLogin = () => {
    // 실제 JWT 토큰이 아닌, 임시 값을 사용합니다.
    // 백엔드에서 유효한 토큰을 받아오거나, 임시로 설정한 토큰으로 대체하세요.
    const tempToken = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';
    localStorage.setItem('userToken', tempToken);
    alert('임시 로그인 성공! 메인 페이지로 이동합니다.');
    navigate('/');
  };
  // ★★★ 임시 로그인 함수 추가 끝 ★★★

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
                name="name" // username으로 사용될 필드
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

        {/* ★★★ 임시 로그인 버튼 추가 ★★★ */}
        {isLogin && (
          <button type="button" onClick={handleTempLogin} className="temp-login-btn">
            임시 로그인 (개발용)
          </button>
        )}
        {/* ★★★ 임시 로그인 버튼 추가 끝 ★★★ */}

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
  );
}

export default AuthPage;