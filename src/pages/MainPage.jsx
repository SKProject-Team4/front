import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png';
import logoImage from '../assets/logo.png';
import './MainPage.css';
import Calendar from '../components/Calendar';
import AuthService from '../services/AuthService';
import CustomAlert from '../components/CustomAlert';

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  const [alertMessage, setAlertMessage] = useState(''); // ✅ 알림 상태 추가
  const [redirectPath, setRedirectPath] = useState(null); // ✅ 알림 후 이동 경로 (선택)

  useEffect(() => {
    const checkStatus = async () => {
      const result = await AuthService.checkLoginStatus();
      setIsLoggedIn(result.isLoggedIn);
      setIsGuest(result.isGuest || false);
    };

    checkStatus();
  }, []);

  const handleClick = async () => {
    if (isLoggedIn || isGuest) {
      navigate('/start-planning');
    } else {
      AuthService.issueGuestKey();
      setIsGuest(true);
      setAlertMessage('로그인 없이 여행을 시작합니다!');
      setTimeout(() => navigate('/start-planning'), 1000); // 알림 후 이동
    }
  };

  const handleAuthClick = async (e) => {
    e.preventDefault();

    if (isLoggedIn || isGuest) {
      const result = await AuthService.logout();
      if (result.success) {
        setIsLoggedIn(false);
        setIsGuest(false);
        setAlertMessage(result.message);
      } else {
        setAlertMessage(result.message);
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
      setAlertMessage('마이페이지는 로그인한 사용자만 이용할 수 있습니다.');
      setRedirectPath('/login'); // 확인 누르면 로그인으로 이동
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
          {isLoggedIn || isGuest ? '로그아웃' : '로그인'}
        </button>
      </div>

      <div className="logo-container">
        <img src={logoImage} alt="서비스 로고" className="main-page-logo" />
      </div>

      <div className="main-content">
        <p className="main-catchphrase-text title-text">"여행이 쉬워진다, AI와 함께라면."</p>

        {(isLoggedIn || isGuest) ? (
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

      {/* ✅ CustomAlert 적용 */}
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => {
            setAlertMessage('');
            if (redirectPath) {
              navigate(redirectPath);
              setRedirectPath(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default MainPage;
