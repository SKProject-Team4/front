import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png';
import logoImage from '../assets/logo.png';
import './MainPage.css';

// FullCalendar 관련 임포트
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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
    navigate('/start-planning-page'); // 여행 계획 페이지로 이동
  };

  const handleAuthClick = (e) => {
    e.preventDefault();

    if (isLoggedIn) {
      localStorage.removeItem('userToken');
      setIsLoggedIn(false);
      alert('로그아웃 되었습니다.');
      navigate('/'); // ★ '/auth' 대신 '/' 로 변경
    } else {
      navigate('/'); // ★ '/auth' 대신 '/' 로 변경
    }
  };

  const events = [];

  return (
    <div
      className="main-page-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
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
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
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