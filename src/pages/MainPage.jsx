import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png'; // 배경 이미지
import logoImage from '../assets/logo.png'; // 로고 이미지
import './MainPage.css'; // CSS 파일 임포트
import Calendar from '../components/Calendar'; // Calendar 컴포넌트 임포트
import AuthService from '../services/AuthService'; // AuthService 임포트

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false); // 게스트 상태 추가
  // 팝업 표시 여부를 관리하는 상태
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  // 달력에서 선택된 날짜 범위를 저장하는 상태 (시작일, 종료일)
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      const result = await AuthService.checkLoginStatus();
      setIsLoggedIn(result.isLoggedIn);
      setIsGuest(result.isGuest || false); // isGuest 상태 업데이트
    };

    checkStatus();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // '여행 계획 세우기' 버튼 클릭 핸들러
  const handleClick = async () => {
    if (isLoggedIn || isGuest) { // 로그인되었거나 게스트인 경우
      console.log('이미 로그인 또는 게스트 모드. 여행 계획 페이지로 이동.');
      navigate('/start-planning');
    } else { // 로그인되지 않은 일반 사용자 (게스트 키도 없는 상태)
      console.log('로그인되지 않음. 게스트 임시 키 발급 시도...');
      AuthService.issueGuestKey(); // 게스트 임시 키 발급
      setIsGuest(true); // 게스트 상태로 변경 (UI 업데이트를 위해)
      alert('로그인 없이 여행을 시작합니다!'); // 사용자에게 알림
      navigate('/start-planning'); // 여행 계획 페이지로 이동
    }
  };

  // 로그인/로그아웃 버튼 클릭 핸들러
  const handleAuthClick = async (e) => {
    e.preventDefault();

    if (isLoggedIn || isGuest) { // 로그인 또는 게스트 상태일 때만 로그아웃 처리
      const result = await AuthService.logout();
      if (result.success) {
        setIsLoggedIn(false);
        setIsGuest(false); // 게스트 상태도 초기화
        alert(result.message); 
        console.log('MainPage에서 로그아웃 처리:', result.message);
      } else {
        alert(result.message); 
        console.error('MainPage에서 로그아웃 실패:', result.message);
      }
    } else {
      navigate('/login'); // 로그인 상태가 아니면 로그인 페이지로 이동
    }
  };

  // 마이페이지 버튼 클릭 핸들러
  const handleMyPageClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) { // 실제 로그인된 사용자만 마이페이지 접근 가능
      navigate('/mypage');
    } else {
      alert('마이페이지는 로그인한 사용자만 이용할 수 있습니다. 로그인 페이지로 이동합니다.'); 
      navigate('/login');
    }
  };

  // Calendar 컴포넌트에서 날짜 범위가 선택되었을 때 호출될 핸들러
  const handleDateSelect = (dateRange) => {
    setSelectedDateRange(dateRange); // 선택된 날짜 범위 저장
    setShowCalendarPopup(true); // 팝업 표시
  };

  // 팝업 닫기 핸들러
  const closeCalendarPopup = () => {
    setShowCalendarPopup(false);
    setSelectedDateRange(null); // 선택된 날짜 범위 초기화
  };

  // '확인' 버튼 클릭 시 실행될 함수 (예시)
  const handleConfirmDate = () => {
    if (selectedDateRange) {
      console.log('선택된 날짜 범위:', selectedDateRange.start, selectedDateRange.end);
      navigate(`/start-planning?startDate=${selectedDateRange.start.toISOString()}&endDate=${selectedDateRange.end.toISOString()}`);
    }
    closeCalendarPopup(); // 팝업 닫기
  };

  return (
    <div
      className="main-page-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* 상단 우측 버튼 컨테이너 */}
      <div className="top-right-buttons-container">
        <button type="button" onClick={handleMyPageClick} className="top-bar-button">
          마이페이지
        </button>
        <button type="button" onClick={handleAuthClick} className="top-bar-button">
          {isLoggedIn || isGuest ? '로그아웃' : '로그인'} {/* 버튼 텍스트 변경 */}
        </button>
      </div>

      {/* 로고 컨테이너 */}
      <div className="logo-container">
        <img
          src={logoImage}
          alt="서비스 로고"
          className="main-page-logo"
        />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="main-content">
        <p className="main-catchphrase-text title-text">"여행이 쉬워진다, AI와 함께라면."</p>

        {/* 로그인 또는 게스트 상태에 따라 Calendar 컴포넌트 또는 로그인 유도 메시지 렌더링 */}
        {(isLoggedIn || isGuest) ? ( // isGuest 상태도 포함하여 캘린더 표시 조건 변경
          // Calendar 컴포넌트에 날짜 선택 핸들러 prop 전달
          <Calendar onDateSelect={handleDateSelect} />
        ) : (
          // 로그인되지 않은 경우 표시될 메시지
          <p className="login-prompt-text">여행 계획을 세우려면 로그인해주세요.</p>
        )}

        <p className="main-catchphrase-text subtitle-text">당신만의 맞춤 일정과 최고의 경로, 단 한 번의 클릭으로.</p>

        <button
          onClick={handleClick}
          className="plan-button"
        >
          여행 계획 세우기
        </button>
      </div>

      {/* 팝업 UI 렌더링 */}
      {showCalendarPopup && selectedDateRange && (
        <div className="calendar-popup-overlay">
          <div className="calendar-popup-content">
            {/* 닫기 버튼 */}
            <button className="popup-close-button" onClick={closeCalendarPopup}>X</button>
            
            {/* 선택된 날짜 범위 표시 */}
            <div className="popup-date-range">
              {selectedDateRange.start.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })} ~ {selectedDateRange.end.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </div>
            
            {/* 팝업 메시지 */}
            <div className="popup-message">
              선택하신 날짜로 여행 계획을 생성하시겠습니까?
            </div>
            
            {/* 확인 버튼 */}
            <div className="popup-buttons">
              <button onClick={handleConfirmDate}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;