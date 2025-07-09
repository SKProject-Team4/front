import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './AuthPage.css';
import logo from '../assets/logo.png';
import axios from 'axios'; // axios 임포트

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

  // 🚨 백엔드 API의 기본 URL을 여기에 설정해주세요!
  const API_BASE_URL = 'http://localhost:8080'; // 예시: 실제 백엔드 URL로 변경하세요.

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

    // ★★★ 이메일 중복 확인 API 연동 시작 ★★★
    try {
      console.log('이메일 중복 확인 API 호출 시도:', `${API_BASE_URL}/users/check_username?email=${email}`);
      const response = await axios.get(`${API_BASE_URL}/users/check_username`, {
        params: { email: email }, // 쿼리 파라미터로 이메일 전송
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // API 명세에 따른 응답 처리
      if (response.data.status === 'success' && response.data.code === 200) {
        // "사용 가능한 아이디입니다." 메시지가 오면 중복 아님
        return ''; // 에러 없음
      } else if (response.data.status === 'error' && response.data.message === '이미 사용 중인 아이디입니다.') {
        return '이미 등록된 이메일입니다.'; // 중복됨
      } else {
        // 예상치 못한 응답
        console.error('이메일 중복 확인 실패 응답 (AuthPage):', response.data);
        return '이메일 중복 확인 중 알 수 없는 오류가 발생했습니다.';
      }
    } catch (error) {
      console.error('이메일 중복 확인 API 호출 오류 (AuthPage):', error);
      if (error.response) {
        // 서버에서 에러 응답을 보낸 경우 (HTTP 상태 코드 2xx 외)
        if (error.response.data.message === '이미 사용 중인 아이디입니다.') {
          return '이미 등록된 이메일입니다.'; // 서버에서 명시적으로 중복이라고 응답한 경우
        }
        return '이메일 중복 확인 중 서버 오류가 발생했습니다.';
      } else if (error.request) {
        // 요청이 전송되었지만 응답을 받지 못한 경우
        return '이메일 중복 확인 중 네트워크 오류가 발생했습니다.';
      } else {
        // 요청 설정 중 문제 발생
        return '이메일 중복 확인 중 오류가 발생했습니다.';
      }
    }
    // ★★★ 이메일 중복 확인 API 연동 끝 ★★★
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      console.log('로그인 시도:', { email: formData.email, password: formData.password });

      try {
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
          email: formData.email,
          password: formData.password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 'success' && response.data.data?.token) {
          localStorage.setItem('userToken', response.data.data.token);
          alert('로그인 성공! 메인 페이지로 이동합니다.');
          navigate('/');
        } else {
          alert('로그인 실패: ' + (response.data.message || '이메일 또는 비밀번호가 올바르지 않습니다.'));
          console.error('로그인 실패 응답 (AuthPage):', response.data);
        }
      } catch (error) {
        console.error('로그인 API 호출 오류 (AuthPage):', error);
        if (error.response) {
          alert('로그인 실패: ' + (error.response.data.message || '서버 오류가 발생했습니다.'));
          console.error('서버 응답 오류:', error.response.data);
        } else if (error.request) {
          alert('로그인 실패: 서버로부터 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.');
        } else {
          alert('로그인 실패: 요청을 보내는 중 오류가 발생했습니다.');
        }
      }

    } else { // 회원가입 로직
      const { name, email, password, confirmPassword } = formData;

      if (password !== confirmPassword) {
        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      // 회원가입 전에 이메일 유효성 및 중복 확인
      const error = await validateEmail(email);
      if (error) {
        setEmailError(error);
        return;
      }

      console.log('회원가입 시도:', formData);

      try {
        const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, {
          username: name, // formData.name을 username으로 매핑
          email: email,
          password: password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (registerResponse.data.status === 'success' && registerResponse.data.code === 200) {
          alert('회원가입이 성공적으로 완료되었습니다! 이제 로그인할 수 있습니다.');
          setIsLogin(true); // 회원가입 성공 후 로그인 모드로 전환
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        } else {
          alert('회원가입 실패: ' + (registerResponse.data.message || '알 수 없는 오류'));
          console.error('회원가입 실패 응답 (AuthPage):', registerResponse.data);
        }
      } catch (error) {
        console.error('회원가입 API 호출 오류 (AuthPage):', error);
        if (error.response) {
          alert('회원가입 실패: ' + (error.response.data.message || '서버 오류가 발생했습니다.'));
          console.error('서버 응답 오류:', error.response.data);
        } else if (error.request) {
          alert('회원가입 실패: 서버로부터 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.');
        } else {
          alert('회원가입 실패: 요청을 보내는 중 오류가 발생했습니다.');
        }
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