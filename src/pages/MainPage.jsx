import React, { useState, useEffect } from 'react'; // useState와 useEffect 임포트
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png'; // 배경 이미지
import logoImage from '../assets/logo.png'; // 로고 이미지 (경로 확인 필요)
import './MainPage.css'; // CSS 파일 임포트

// FullCalendar 관련 임포트
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // 월별 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid'; // 주/일별 보기 플러그인
import interactionPlugin from '@fullcalendar/interaction'; // 날짜 클릭, 드래그 등 상호작용 플러그인


const MainPage = () => {
  const navigate = useNavigate();
  // 로그인 상태를 관리하는 state 추가 (초기값은 로그인 여부에 따라 설정)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 컴포넌트 마운트 시 로그인 상태 확인 (예: localStorage)
  useEffect(() => {
    // 실제 로그인 상태 확인 로직 (예: localStorage.getItem('authToken'))
    const token = localStorage.getItem('userToken'); // 예시: 'userToken'이라는 키로 토큰이 저장되어 있다고 가정
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleClick = () => {
    navigate('/start-planning-page'); // 여행 계획 페이지로 이동
  };

  // 로그인/로그아웃 처리 함수
  const handleAuthClick = (e) => {
    e.preventDefault(); // 기본 링크 동작(새로고침) 방지

    if (isLoggedIn) {
      // 로그아웃 로직:
      localStorage.removeItem('userToken'); // 로컬 스토리지에서 토큰 제거 (예시)
      setIsLoggedIn(false); // 로그인 상태 업데이트
      alert('로그아웃 되었습니다.');
      navigate('/'); // 로그인 페이지 경로 (AuthPage가 렌더링되는 경로)
    } else {
      // 로그인 페이지로 이동
      navigate('/'); // 로그인 페이지 경로
    }
  };

  const events = []; // 샘플 이벤트 데이터 (현재 비어있음)

  return (
    <div
      className="main-page-container" // 클래스 이름 적용
      style={{
        backgroundImage: `url(${backgroundImage})`, // 배경 이미지는 JS 로직으로 적용 (동적 값을 위해)
      }}
    >
      {/* ⬆️ 상단 바 */}
      <div className="top-bar">
        {/* 오른쪽: 로그인/로그아웃 링크 */}
        <div className="top-bar-right">
          <a href="#" onClick={handleAuthClick} className="top-bar-link">
            {isLoggedIn ? '로그아웃' : '로그인'}
          </a>
        </div>
      </div>

      {/* 로고 이미지 컨테이너 */}
      <div className="logo-container">
        <img
          src={logoImage} // 임포트한 로고 이미지 사용
          alt="서비스 로고"
          className="main-page-logo" // CSS 스타일링을 위한 클래스
        />
      </div>

      {/* ⬇️ 본문 내용 */}
      <div className="main-content">
        <p className="main-catchphrase-text title-text">"여행이 쉬워진다, AI와 함께라면."</p>

        {/* FullCalendar 삽입 */}
        <div className="full-calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth" // 초기 뷰를 월별로 설정
            headerToolbar={{ // 달력 상단 툴바 설정
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events} // 위에서 정의한 이벤트 데이터
            editable={true} // 이벤트 드래그&드롭, 리사이즈 가능하게
            selectable={true} // 날짜 선택 가능하게 (날짜 범위 등)
            locale="ko" // 한국어 설정
            height="auto" // 달력 높이 자동 조절
            // 날짜 클릭 시 이벤트 핸들러 (예시)
            dateClick={(info) => {
              alert('날짜 클릭: ' + info.dateStr);
            }}
            // 이벤트 클릭 시 핸들러 (예시)
            eventClick={(info) => {
              alert('이벤트 클릭: ' + info.event.title);
            }}
            // 이벤트 드롭(이동) 시 핸들러 (예시)
            eventDrop={(info) => {
              console.log('이벤트 이동:', info.event.title, info.event.startStr);
              // 여기에서 서버에 이벤트 변경 사항을 저장하는 로직을 추가할 수 있습니다.
            }}
          />
        </div>

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