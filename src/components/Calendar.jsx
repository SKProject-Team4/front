// src/components/Calendar.jsx
import React, { useState, useRef, useEffect } from 'react'; // useRef와 useEffect 훅을 임포트합니다.
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

const Calendar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [chatContent, setChatContent] = useState('');
  // 드롭다운 메뉴 열림/닫힘 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // 드롭다운 버튼 요소를 참조하기 위한 ref
  const dropdownRef = useRef(null);
  // 드롭다운 메뉴 요소를 참조하기 위한 ref
  const menuRef = useRef(null);

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setChatContent("이곳은 '채팅 내역 보기'를 통해 표시될 AIChatpage의 채팅 내용입니다. 날짜에 해당하는 상세 기록이나 일정이 여기에 표시됩니다. 이 텍스트는 내용이 많아지면 스크롤됩니다. 사용자가 추가한 메모, 일기, 중요한 이벤트 등이 여기에 동적으로 로드됩니다. 예를 들어, '2025년 7월 9일에는 중요한 미팅이 있었습니다. 주요 논의 내용은 다음과 같습니다: ...' 이런 식으로 데이터가 표시될 수 있습니다. 길게 작성하여 스크롤 작동을 테스트해보세요. 줄바꿈이나 공백도 유지됩니다.");
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    setSelectedDate('');
    setChatContent(`클릭된 이벤트: ${info.event.title}`);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate('');
    setChatContent('');
    setIsDropdownOpen(false); // 모달 닫을 때 드롭다운도 닫기
  };

  // 드롭다운 버튼 클릭 핸들러
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // 드롭다운 메뉴 항목 클릭 핸들러
  const handleMenuItemClick = (functionName) => {
    alert(`${functionName} 기능이 실행되었습니다.`);
    setIsDropdownOpen(false); // 메뉴 항목 클릭 시 드롭다운 닫기
    // 실제 기능 구현:
    // if (functionName === '채팅 내역 보기') { /* 채팅 내역 상세 페이지로 이동 또는 추가 모달 */ }
    // else if (functionName === 'JPG 저장하기') { /* JPG 저장 로직 */ }
    // else if (functionName === 'PDF 저장하기') { /* PDF 저장 로직 */ }
    // else if (functionName === '일정 삭제하기') { /* 일정 삭제 로직 */ }
  };

  // 모달 외부 클릭 시 드롭다운 닫기 (useEffect를 사용하여 전역 클릭 이벤트 감지)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 드롭다운 버튼이나 메뉴 자체가 아닌 다른 곳을 클릭했을 때
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]); // isDropdownOpen 상태가 변경될 때마다 효과 재실행

  return (
    <div className="full-calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth',
        }}
        editable={true}
        selectable={true}
        locale="ko"
        height="auto"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={(info) => {
          console.log('이벤트 이동:', info.event.title, info.event.startStr);
        }}
      />

      {/* 모달 컴포넌트 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* X 닫기 버튼 */}
            <button className="modal-close-button" onClick={closeModal}>&times;</button>

            <h2>일정</h2>
            {selectedDate && (
              <p className="modal-date-display">
                {selectedDate}
              </p>
            )}

            {/* AIChatpage 채팅 내용 영역 */}
            <div className="modal-chat-content-area">
              <p>{chatContent}</p>
            </div>

            {/* 기능 메뉴 드롭다운 버튼 및 메뉴 */}
            <div className="action-dropdown-container">
              <button
                className="action-dropdown-button"
                onClick={toggleDropdown}
                ref={dropdownRef} // 버튼 ref 연결
              >
                더보기 
              </button>
              {isDropdownOpen && (
                <ul className="action-dropdown-menu" ref={menuRef}> {/* 메뉴 ref 연결 */}
                  <li onClick={() => handleMenuItemClick('채팅 내역 보기')}>
                    <span className="bullet-point"></span> 채팅 내역 보기
                  </li>
                  <li onClick={() => handleMenuItemClick('JPG 저장하기')}>
                    <span className="bullet-point"></span> JPG 저장하기
                  </li>
                  <li onClick={() => handleMenuItemClick('PDF 저장하기')}>
                    <span className="bullet-point"></span> PDF 저장하기
                  </li>
                  <li onClick={() => handleMenuItemClick('일정 삭제하기')}>
                    <span className="bullet-point"></span> 일정 삭제하기
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;