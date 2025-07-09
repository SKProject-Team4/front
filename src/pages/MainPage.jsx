import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png'; // 배경 이미지
import logoImage from '../assets/logo.png'; // 로고 이미지
import './MainPage.css'; // CSS 파일 임포트
import Calendar from '../components/Calendar'; // Calendar 컴포넌트 임포트
import axios from 'axios'; // Axios 임포트

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 팝업 표시 여부를 관리하는 상태
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  // 달력에서 선택된 날짜 범위를 저장하는 상태 (시작일, 종료일)
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // 백엔드 API의 기본 URL을 여기에 설정해주세요!
  const API_BASE_URL = 'http://localhost:8080'; // 예시: 실제 백엔드 URL로 변경하세요.

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('userToken');

      // 임시 로그인 토큰 (개발용)
      const TEMP_LOGIN_TOKEN = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';

      if (token && token === TEMP_LOGIN_TOKEN) {
        // 임시 토큰인 경우 로그인된 것으로 간주
        setIsLoggedIn(true);
        console.log('로그인 상태 확인: 임시 토큰으로 로그인됨 (개발용)');
      } else if (token && token !== 'guest-planning-key-12345') { // 게스트 키가 아닌 경우 실제 로그인 체크
        try {
          console.log('로그인 상태 확인 API 호출 시도:', `${API_BASE_URL}/users/logincheck`);
          const response = await axios.get(`${API_BASE_URL}/users/logincheck`, {
            headers: {
              'Authorization': `Bearer ${token}`, // JWT 토큰 포함
              'Content-Type': 'application/json'
            }
          });

          // API 응답에 따라 로그인 상태 업데이트
          if (response.data.status === 'users' && response.data.code === 200 && response.data.login === true) {
            setIsLoggedIn(true);
            console.log('로그인 상태 확인: 사용자 로그인됨 (실제 토큰)');
          } else {
            // "Guest" 상태나 유효하지 않은 응답 시 로그아웃 처리
            setIsLoggedIn(false);
            localStorage.removeItem('userToken'); // 유효하지 않은 토큰 제거
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
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // '여행 계획 세우기' 버튼 클릭 핸들러
  const handleClick = async () => {
    const token = localStorage.getItem('userToken');
    
    // 로그인되었거나 유효한 게스트 키가 있는 경우에만 여행 계획 페이지로 이동
    if (isLoggedIn || (token && token === 'guest-planning-key-12345')) {
      console.log('이미 로그인 또는 게스트 모드. 여행 계획 페이지로 이동.');
      navigate('/start-planning');
    } else {
      // 로그인되지 않은 경우 로그인 페이지로 유도
      // alert('여행 계획을 세우려면 로그인이 필요합니다.'); // alert 대신 커스텀 모달 사용 권장
      navigate('/login'); // 로그인 페이지로 리다이렉트
    }
  };

  // 로그인/로그아웃 버튼 클릭 핸들러
  const handleAuthClick = async (e) => {
    e.preventDefault();

    if (isLoggedIn) { // 로그인 상태일 때만 로그아웃 처리
      const token = localStorage.getItem('userToken');
      const TEMP_LOGIN_TOKEN = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';

      if (token === TEMP_LOGIN_TOKEN) {
        // 임시 토큰이면 실제 API 호출 없이 로컬 스토리지에서만 제거
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        // alert('임시 로그아웃 되었습니다.'); // alert 대신 커스텀 모달 사용 권장
        console.log('MainPage에서 임시 토큰 로그아웃 처리');
        return;
      }

      if (token) {
        try {
          console.log('로그아웃 API 호출 시도...');
          const response = await axios.get(`${API_BASE_URL}/logout`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.status === 200 && response.data.status === 'success') {
            localStorage.removeItem('userToken');
            setIsLoggedIn(false);
            // alert('로그아웃 되었습니다.'); // alert 대신 커스텀 모달 사용 권장
          } else {
            // alert('로그아웃에 실패했습니다. 다시 시도해주세요.'); // alert 대신 커스텀 모달 사용 권장
            console.error('로그아웃 API 실패 응답:', response.data);
          }
        } catch (error) {
          console.error('로그아웃 API 호출 오류:', error, error.response);
          // alert('로그아웃 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.'); // alert 대신 커스텀 모달 사용 권장
        }
      } else {
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        // alert('이미 로그아웃 상태입니다.'); // alert 대신 커스텀 모달 사용 권장
      }
    } else {
      navigate('/login'); // 로그인 상태가 아니면 로그인 페이지로 이동
    }
  };

  // 마이페이지 버튼 클릭 핸들러
  const handleMyPageClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/mypage');
    } else {
      // alert('마이페이지에 접근하려면 로그인이 필요합니다. 로그인 페이지로 이동합니다.'); // alert 대신 커스텀 모달 사용 권장
      navigate('/login');
    }
  };

  // Calendar 컴포넌트에서 날짜 범위가 선택되었을 때 호출될 핸들러
  const handleDateSelect = (dateRange) => {
    // dateRange는 { start: Date객체, end: Date객체 } 형태
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
      // 선택된 날짜 범위 (selectedDateRange.start, selectedDateRange.end)를 사용하여
      // 다음 단계로 이동하거나 API 호출 등을 수행할 수 있습니다.
      console.log('선택된 날짜 범위:', selectedDateRange.start, selectedDateRange.end);
      // 예시: 선택된 날짜를 쿼리 파라미터로 넘겨주며 여행 계획 페이지로 이동
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
          {isLoggedIn ? '로그아웃' : '로그인'}
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

        {/* 로그인 상태에 따라 Calendar 컴포넌트 또는 로그인 유도 메시지 렌더링 */}
        {isLoggedIn ? (
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