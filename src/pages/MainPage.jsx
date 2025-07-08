import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png'; // 배경 이미지
// calendarIcon 임포트 제거됨
import logoImage from '../assets/logo.png'; // 로고 이미지
import './MainPage.css'; // CSS 파일 임포트

// FullCalendar 관련 임포트
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // 월별 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid'; // 주/일별 보기 플러그인
import interactionPlugin from '@fullcalendar/interaction'; // 날짜 클릭, 드래그 등 상호작용 플러그인


const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleClick = () => {
    navigate('/start-planning'); // 여행 계획 페이지로 이동
  };

  const handleAuthClick = (e) => {
    e.preventDefault();

    if (isLoggedIn) {
      localStorage.removeItem('userToken');
      setIsLoggedIn(false);
      alert('로그아웃 되었습니다.');
      navigate('/login'); // 로그인 페이지 경로
    } else {
      navigate('/login'); // 로그인 페이지 경로
    }
  };

  const handleMyPageClick = (e) => {
    e.preventDefault();
    navigate('/mypage'); // 마이페이지로 이동
  };

  const events = []; // 샘플 이벤트 데이터 (현재 비어있음)

  return (
    <div
      className="main-page-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* 상단 바 제거됨. 마이페이지/로그인 버튼만 별도로 배치 */}
      <div className="top-right-buttons-container">
        <button type="button" onClick={handleMyPageClick} className="top-bar-button">
          마이페이지
        </button>
        <button type="button" onClick={handleAuthClick} className="top-bar-button">
          {isLoggedIn ? '로그아웃' : '로그인'}
        </button>
      </div>

      {/* 로고 이미지 컨테이너 */}
      <div className="logo-container">
        <img
          src={logoImage}
          alt="서비스 로고"
          className="main-page-logo"
        />
      </div>

      {/* ⬇️ 본문 내용 */}
      <div className="main-content">
        <p className="main-catchphrase-text title-text">"여행이 쉬워진다, AI와 함께라면."</p>

        {/* FullCalendar 삽입 */}
        <div className="full-calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today', // 이전/다음/오늘 버튼은 왼쪽에 유지
              center: 'title', 
              right: 'dayGridMonth' // 월별 보기 버튼은 오른쪽에 유지
            }}
            events={events}
            editable={true}
            selectable={true}
            locale="ko"
            height="auto"
            dateClick={(info) => {
              alert('날짜 클릭: ' + info.dateStr);
            }}
            eventClick={(info) => {
              alert('이벤트 클릭: ' + info.event.title);
            }}
            eventDrop={(info) => {
              console.log('이벤트 이동:', info.event.title, info.event.startStr);
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