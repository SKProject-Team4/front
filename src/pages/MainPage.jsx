import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png';
import logoImage from '../assets/logo.png';
import './MainPage.css';
import Calendar from '../components/Calendar';
import axios from 'axios';
import CustomAlert from '../components/CustomAlert'; // 💡 추가

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [alertMessage, setAlertMessage] = useState(''); // 💬 알림 메시지 상태

  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('userToken');
      const TEMP_LOGIN_TOKEN = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';

      if (token && token === TEMP_LOGIN_TOKEN) {
        setIsLoggedIn(true);
        console.log('로그인 상태 확인: 임시 토큰으로 로그인됨 (개발용)');
      } else if (token && token !== 'guest-planning-key-12345') {
        try {
          const response = await axios.get(`${API_BASE_URL}/users/logincheck`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.data.status === 'users' && response.data.code === 200 && response.data.login === true) {
            setIsLoggedIn(true);
            console.log('로그인 상태 확인: 사용자 로그인됨 (실제 토큰)');
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem('userToken');
            console.log('로그인 상태 확인: 게스트 또는 유효하지 않은 토큰');
          }
        } catch (error) {
          console.error('로그인 상태 확인 API 호출 오류:', error);
          setIsLoggedIn(false);
          localStorage.removeItem('userToken');
        }
      } else {
        setIsLoggedIn(false);
        console.log('로그인 상태 확인: 토큰 없음 또는 게스트 모드');
      }
    };

    checkLoginStatus();
  }, []);

  const handleClick = () => {
    const token = localStorage.getItem('userToken');

    if (isLoggedIn || (token && token === 'guest-planning-key-12345')) {
      navigate('/start-planning');
    } else {
      navigate('/start-planning');
    }
  };

  const handleAuthClick = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    const TEMP_LOGIN_TOKEN = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';

    if (isLoggedIn) {
      if (token === TEMP_LOGIN_TOKEN) {
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        setAlertMessage('임시 로그아웃 되었습니다.');
        return;
      }

      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/logout`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.status === 200 && response.data.status === 'success') {
            localStorage.removeItem('userToken');
            setIsLoggedIn(false);
            setAlertMessage('로그아웃 되었습니다.');
          } else {
            setAlertMessage('로그아웃에 실패했습니다. 다시 시도해주세요.');
          }
        } catch (error) {
          console.error('로그아웃 API 호출 오류:', error);
          setAlertMessage('로그아웃 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        setAlertMessage('이미 로그아웃 상태입니다.');
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
      setAlertMessage('마이페이지에 접근하려면 로그인이 필요합니다.');
      // navigate('/login');
    }
  };

  const handleDateSelect = (dateRange) => {
    setSelectedDateRange(dateRange);
    setShowCalendarPopup(true);
  };

  const closeCalendarPopup = () => {
    setShowCalendarPopup(false);
    setSelectedDateRange(null);
  };

  const handleConfirmDate = () => {
    if (selectedDateRange) {
      navigate(`/start-planning?startDate=${selectedDateRange.start.toISOString()}&endDate=${selectedDateRange.end.toISOString()}`);
    }
    closeCalendarPopup();
  };

  return (
    <div
      className="main-page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
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
        <img src={logoImage} alt="서비스 로고" className="main-page-logo" />
      </div>

      <div className="main-content">
        <p className="main-catchphrase-text title-text">"여행이 쉬워진다, AI와 함께라면."</p>

        {isLoggedIn ? (
          <Calendar onDateSelect={handleDateSelect} />
        ) : (
          <p className="login-prompt-text">여행 계획을 세우려면 로그인해주세요.</p>
        )}

        <p className="main-catchphrase-text subtitle-text">
          당신만의 맞춤 일정과 최고의 경로, 단 한 번의 클릭으로.
        </p>

        <button onClick={handleClick} className="plan-button">
          여행 계획 세우기
        </button>
      </div>

      {showCalendarPopup && selectedDateRange && (
        <div className="calendar-popup-overlay">
          <div className="calendar-popup-content">
            <button className="popup-close-button" onClick={closeCalendarPopup}>X</button>

            <div className="popup-date-range">
              {selectedDateRange.start.toLocaleDateString('ko-KR')} ~{' '}
              {selectedDateRange.end.toLocaleDateString('ko-KR')}
            </div>

            <div className="popup-message">
              선택하신 날짜로 여행 계획을 생성하시겠습니까?
            </div>

            <div className="popup-buttons">
              <button onClick={handleConfirmDate}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 💡 커스텀 알림창 */}
      {alertMessage && (
        <CustomAlert message={alertMessage} onClose={() => setAlertMessage('')} />
      )}
    </div>
  );
};

export default MainPage;
