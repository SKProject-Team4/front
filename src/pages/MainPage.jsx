import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png'; // 배경 이미지
import logoImage from '../assets/logo.png'; // 로고 이미지
import './MainPage.css'; // CSS 파일 임포트
import Calendar from '../components/Calendar'; // ★★★ Calendar 컴포넌트 임포트 ★★★
import axios from 'axios'; // Axios 임포트

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🚨 백엔드 API의 기본 URL을 여기에 설정해주세요!
  const API_BASE_URL = 'http://localhost:8080'; // 예시: 실제 백엔드 URL로 변경하세요.

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('userToken');

      if (token && token !== 'guest-planning-key-12345') { // 게스트 키가 아닌 경우에만 실제 로그인 체크 시도
        try {
          console.log('로그인 상태 확인 API 호출 시도:', `${API_BASE_URL}/users/logincheck`); //
          const response = await axios.get(`${API_BASE_URL}/users/logincheck`, { //
            headers: {
              'Authorization': `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 포함
              'Content-Type': 'application/json'
            }
          });

          // API 응답 명세에 따라 로그인 상태 업데이트
          if (response.data.status === 'users' && response.data.code === 200 && response.data.login === true) { //
            setIsLoggedIn(true);
            console.log('로그인 상태 확인: 사용자 로그인됨');
          } else {
            // "Guest" 상태나 다른 실패 응답이 오면 로그인되지 않은 것으로 간주
            setIsLoggedIn(false);
            localStorage.removeItem('userToken'); // 유효하지 않은 토큰은 제거
            console.log('로그인 상태 확인: 게스트 또는 유효하지 않은 토큰');
          }
        } catch (error) {
          console.error('로그인 상태 확인 API 호출 오류:', error);
          setIsLoggedIn(false); // 오류 발생 시 로그인되지 않은 상태로 설정
          localStorage.removeItem('userToken'); // 토큰 유효성 검사 실패로 간주하고 제거
          console.log('로그인 상태 확인: API 오류로 인한 로그아웃 처리');
        }
      } else {
        // 토큰이 없거나 게스트 키인 경우 로그인되지 않은 상태
        setIsLoggedIn(false);
        console.log('로그인 상태 확인: 토큰 없음 또는 게스트 모드');
      }
    };

    checkLoginStatus();
  }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

  const handleClick = async () => {
    const token = localStorage.getItem('userToken');
    
    // 토큰이 아예 없거나, 이전에 직접 설정했던 'guest-planning-key-12345'일 경우에만 새로운 게스트 키 발급
    if (!token || token === 'guest-planning-key-12345') { 
      try {
        console.log('임시 키 발급 API 호출 시도:', `${API_BASE_URL}/plans/start`); //
        const response = await axios.post(`${API_BASE_URL}/plans/start`, {}); //
        
        console.log('임시 키 발급 API 응답 데이터:', response.data); // 응답 데이터 전체 확인

        if (response.data.status === 'success' && response.data.guestKey) { //
          localStorage.setItem('userToken', response.data.guestKey); //
          alert('비회원용 임시 키가 발급되었습니다. 여행 계획 페이지로 이동합니다.');
          console.log('MainPage에서 임시 게스트 키 발급 성공:', response.data.guestKey);
          navigate('/start-planning'); // ★★★ 성공 시에만 페이지 이동 ★★★
        } else {
          // 응답은 왔지만 조건에 맞지 않는 경우 (e.g., status가 'success'가 아님)
          alert('임시 키 발급에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
          console.error('임시 키 발급 실패 응답 (MainPage - 조건 불일치):', response.data);
          // 실패 시 페이지 이동하지 않음
        }
      } catch (error) {
        console.error('임시 키 발급 API 호출 오류 (MainPage):', error);
        if (error.response) {
            console.error('API 오류 응답 데이터:', error.response.data); // 서버에서 보낸 에러 응답
            console.error('API 오류 응답 상태:', error.response.status); // HTTP 상태 코드
            alert('임시 키 발급 중 서버 오류가 발생했습니다: ' + (error.response.data.message || '알 수 없는 오류'));
        } else if (error.request) {
            console.error('API 요청 응답 없음:', error.request); // 요청은 보냈지만 응답을 받지 못함
            alert('임시 키 발급 중 네트워크 오류가 발생했습니다. 서버 연결을 확인해주세요.');
        } else {
            // 그 외 오류 (예: axios 설정 오류)
            alert('임시 키 발급 중 예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
        }
        // 실패 시 페이지 이동하지 않음
      }
    } else {
      console.log('이미 유효한 토큰이 존재합니다:', token);
      navigate('/start-planning'); // ★★★ 이미 토큰이 있을 경우 바로 페이지 이동 ★★★
    }
  };

  const handleAuthClick = async (e) => {
    e.preventDefault();

    if (isLoggedIn) { // 실제 로그인된 사용자일 경우에만 로그아웃 처리
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          console.log('로그아웃 API 호출 시도...'); //
          const response = await axios.get(`${API_BASE_URL}/logout`, { //
            headers: {
              'Authorization': `Bearer ${token}` //
            }
          });

          if (response.status === 200 && response.data.status === 'success') { //
            localStorage.removeItem('userToken'); //
            setIsLoggedIn(false);
            alert('로그아웃 되었습니다.'); //
          } else {
            alert('로그아웃에 실패했습니다. 다시 시도해주세요.'); //
            console.error('로그아웃 API 실패 응답:', response.data);
          }
        } catch (error) {
          console.error('로그아웃 API 호출 오류:', error, error.response); //
          alert('로그아웃 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        localStorage.removeItem('userToken'); 
        setIsLoggedIn(false);
        alert('이미 로그아웃 상태입니다.');
      }
    } else {
      navigate('/login'); 
    }
  };

  const handleMyPageClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
        navigate('/mypage'); 
    } else {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        navigate('/login'); 
    }
  };

  return (
    <div
      className="main-page-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="top-right-buttons-container">
        <button type="button" onClick={handleMyPageClick} className="top-bar-button">
          마이페이지
        </button>
        <button type="button" onClick={handleAuthClick} className="top-bar-button">
          {isLoggedIn ? '로그아웃' : '로그인'}
        </button>
      </div>

      <div className="logo-container">
        <img
          src={logoImage}
          alt="서비스 로고"
          className="main-page-logo"
        />
      </div>

      <div className="main-content">
        <p className="main-catchphrase-text title-text">"여행이 쉬워진다, AI와 함께라면."</p>

        {/* 로그인 상태에 따라 Calendar 컴포넌트를 조건부 렌더링 */}
        {isLoggedIn && (
            <Calendar /> 
        )}

        <p className="main-catchphrase-text subtitle-text">당신만의 맞춤 일정과 최고의 경로, 단 한 번의 클릭으로.</p>

        <button
          onClick={handleClick}
          className="plan-button"
        >
          여행 계획 세우기
        </button>
      </div>
    </div>
  );
};

export default MainPage;