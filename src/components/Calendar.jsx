import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';
import CalendarService from '../services/CalendarService';
import CustomAlert from '../components/CustomAlert'; // ✅ 추가

const Calendar = ({ onNavigateToAIChat, isLoggedIn }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [chatContent, setChatContent] = useState('');
  const [isDropdownOpen, setIsDropdownGopen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

  const [alertMessage, setAlertMessage] = useState(''); // ✅ alert 상태

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const data = await CalendarService.getPlans(token);
        const formattedEvents = data.map(plan => ({
          id: plan.id,
          title: plan.title,
          start: plan.start,
          end: plan.end,
          extendedProps: {
            description: plan.message || ''
          }
        }));
        setPlans(formattedEvents);
      } catch (error) {
        console.error("여행 계획을 불러오는 데 실패했습니다:", error);
        setChatContent("여행 계획을 불러오는 데 실패했습니다.");
      }
    };

    fetchPlans();
  }, []);

  const fetchPlanDetails = async (planId) => {
    try {
      const data = await CalendarService.getPlanDetails(planId);
      setSelectedPlan({
        id: data.id,
        title: data.title,
        start: data.start,
        end: data.end,
        extendedProps: {
          description: data.message
        }
      });
      setPlanDetails(data.aiChatContent || []);
      console.log("플랜디테일 :", planDetails);
      console.log("디테일 :", data.aiChatContent);
    } catch (err) {
      console.error('세부 일정 로딩 실패:', err);
      setSelectedPlan(null);
    }
  };

  const handleDateClick = async (info) => {
    setSelectedDate(info.dateStr);
    const aiChat = await fetchAIChatContent(info.dateStr);
    setChatContent(aiChat);
    const plansOnDate = plans.filter(plan =>
      info.dateStr >= plan.start && info.dateStr <= (plan.end || plan.start)
    );
    if (plansOnDate.length > 0) {
      setSelectedPlan(plansOnDate[0]);
    } else {
      setSelectedPlan(null);
      setPlanDetails([]);
      if (aiChat === "선택된 날짜에 AI 채팅 기록이 없습니다.") {
        setChatContent(`선택된 날짜 (${info.dateStr})에 새로운 여행 계획을 추가하시겠습니까?`);
      }
    }
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();
    const clickedPlan = plans.find(plan => String(plan.id) === String(info.event.id));
    if (clickedPlan) {
      setSelectedPlan(clickedPlan);
      setSelectedDate(info.event.startStr);
      fetchPlanDetails(clickedPlan.id);
    }
    setIsModalOpen(true);
  };

  const fetchAIChatContent = async (date) => {
    const mockChatData = {
      '2025-07-09': "2025년 7월 9일에는 중요한 미팅이 있었습니다...",
      '2025-07-15': "2025년 7월 15일은 친구와 영화 본 날이에요!",
      '2025-07-20': "2025년 7월 20일은 기타 강습을 시작한 날이에요~"
    };
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockChatData[date] || "선택된 날짜에 AI 채팅 기록이 없습니다.");
      }, 300);
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate('');
    setChatContent('');
    setSelectedPlan(null);
    setPlanDetails([]);
    setIsDropdownGopen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownGopen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownGopen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDeletePlan = async (id) => {
    try {
      const result = await CalendarService.deletePlan(id);
      if (result.status === 'success') {
        setAlertMessage('삭제 완료!');
        setIsModalOpen(false);
        setSelectedPlan(null);
        setSelectedDate(null);
        setPlanDetails([]);

        // 🔁 plans 다시 불러오기
        const token = localStorage.getItem('userToken');
        const data = await CalendarService.getPlans(token);
        const formattedEvents = data.map(plan => ({
          id: plan.id,
          title: plan.title,
          start: plan.start,
          end: plan.end,
          extendedProps: {
            description: plan.message || ''
          }
        }));
        setPlans(formattedEvents);
      } else {
        setAlertMessage('삭제 실패: ' + result.message);
      }
    } catch (err) {
      console.error('삭제 중 에러:', err);
      setAlertMessage('삭제 중 오류가 발생했어요 😥');
    }
  };

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
        events={plans}
      />

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>&times;</button>
            <h2>{selectedPlan ? selectedPlan.title : '새로운 여행 계획'}</h2>
            {selectedDate && (
              <p className="modal-date-display">{selectedDate}</p>
            )}

            <div className="modal-chat-content-area">
              {selectedPlan ? (
                <>
                  <p>기간: {selectedPlan.start} ~ {selectedPlan.end || selectedPlan.start}</p>
                  <p>설명: {selectedPlan.extendedProps?.description || '설명이 없습니다.'}</p>
                  <h3>세부 일정</h3>
                  {planDetails.length > 0 ? (
                    <ul>
                      {planDetails.map(detail => (
                        <li key={detail.id}>
                          {detail.time ? `[${detail.time}] ` : ''} {detail.activity}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>등록된 세부 일정이 없습니다.</p>
                  )}
                </>
              ) : (
                <p>{chatContent}</p>
              )}
            </div>

            <div className="action-dropdown-container">
              <button
                className="action-dropdown-button"
                onClick={toggleDropdown}
                ref={dropdownRef}
              >
                더보기
              </button>
              {isDropdownOpen && (
                <ul className="action-dropdown-menu" ref={menuRef}>
                  <li onClick={() => onNavigateToAIChat && onNavigateToAIChat(selectedDate)}>
                    <span className="bullet-point"></span> 채팅 내역 보기
                  </li>
                  <li onClick={() => setAlertMessage('JPG 저장 기능은 아직 준비 중입니다.')}>
                    <span className="bullet-point"></span> JPG 저장하기
                  </li>
                  <li onClick={() => setAlertMessage('PDF 저장 기능은 아직 준비 중입니다.')}>
                    <span className="bullet-point"></span> PDF 저장하기
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmAlert(true);
                    }}
                    style={{ color: 'red', fontWeight: 'bold' }}
                  >
                    <span className="bullet-point"></span> 일정 삭제하기
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ 삭제 확인창 */}
      {showConfirmAlert && (
        <CustomAlert
          message="정말 이 일정을 삭제할까요? 🗑️"
          onClose={() => {
            handleDeletePlan(selectedPlan?.id);
            setShowConfirmAlert(false);
          }}
          onCancel={() => setShowConfirmAlert(false)}
        />
      )}

      {/* ✅ 일반 알림창 (JPG/PDF 등 메시지용) */}
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}
    </div>
  );
};

export default Calendar;
