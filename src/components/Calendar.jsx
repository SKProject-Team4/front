// src/components/Calendar.jsx
import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

// onNavigateToAIChat prop을 추가하여 부모 컴포넌트로부터 페이지 전환 함수를 받습니다.
// isLoggedIn prop을 추가하여 로그인 상태를 확인합니다.
const Calendar = ({ onNavigateToAIChat, isLoggedIn }) => {
  // 모달 열림/닫힘 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 달력에서 선택된 날짜 (새 계획 추가 시 사용)
  const [selectedDate, setSelectedDate] = useState('');
  // 모달 내 AIChatpage 채팅 내용 영역에 표시될 내용
  const [chatContent, setChatContent] = useState('');
  // 드롭다운 메뉴 열림/닫힘 상태
  const [isDropdownOpen, setIsDropdownGopen] = useState(false);
  // 드롭다운 버튼 요소를 참조하기 위한 ref
  const dropdownRef = useRef(null);
  // 드롭다운 메뉴 요소를 참조하기 위한 ref
  const menuRef = useRef(null);

  // 모든 여행 계획 데이터를 저장할 상태 (FullCalendar events prop에 사용)
  const [plans, setPlans] = useState([]);
  // 모달에 표시될 현재 선택된 여행 계획 객체
  const [selectedPlan, setSelectedPlan] = useState(null);
  // 선택된 여행 계획의 세부 일정 목록
  const [planDetails, setPlanDetails] = useState([]);

  // 컴포넌트 마운트 시 전체 여행 계획 불러오기
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // 실제 API 엔드포인트로 변경하세요. 예: 'http://localhost:8080/plans'
        const response = await fetch('/plans'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // FullCalendar events 형식에 맞게 데이터 변환
        const formattedEvents = data.map(plan => ({
          id: plan.id, // 여행 계획의 고유 ID (필수)
          title: plan.name, // 여행 계획 이름 (캘린더에 표시될 제목)
          start: plan.startDate, // 여행 시작일
          end: plan.endDate, // 여행 종료일 (FullCalendar는 종료일 전날까지 표시하므로, 실제 종료일을 포함하려면 하루 더 추가해야 할 수 있습니다.)
          // allDay: true, // 하루 종일 이벤트인 경우 (옵션)
          extendedProps: {
            description: plan.description // 추가적인 정보 (옵션)
          }
        }));
        setPlans(formattedEvents);
      } catch (error) {
        console.error("여행 계획을 불러오는 데 실패했습니다:", error);
        setChatContent("여행 계획을 불러오는 데 실패했습니다.");
      }
    };

    fetchPlans();
  }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행됨

  // 선택된 여행 계획의 세부 일정을 불러오는 함수
  const fetchPlanDetails = async (planId) => {
    try {
      // 실제 API 엔드포인트로 변경하세요. 예: `http://localhost:8080/plans/${planId}/details`
      const response = await fetch(`/plans/${planId}/details`); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPlanDetails(data);
      // 세부 일정을 기반으로 chatContent 구성
      let detailsContent = data.length > 0 ? '--- 세부 일정 ---\n' : '등록된 세부 일정이 없습니다.\n';
      data.forEach(detail => {
        // detail 객체에 'time'과 'activity' 필드가 있다고 가정
        detailsContent += `- ${detail.time ? `[${detail.time}] ` : ''}${detail.activity}\n`; 
      });
      setChatContent(detailsContent);
    } catch (error) {
      console.error(`세부 일정을 불러오는 데 실패했습니다 (planId: ${planId}):`, error);
      setChatContent('세부 일정을 불러오는 데 실패했습니다.');
      setPlanDetails([]);
    }
  };

  // 특정 날짜에 대한 AI 채팅 내용을 불러오는 모의 함수
  // 실제 구현에서는 백엔드 API를 호출하여 해당 날짜의 채팅 기록을 가져와야 합니다.
  const fetchAIChatContent = async (date) => {
    // 예시 데이터: 특정 날짜에 대한 모의 채팅 내용
    const mockChatData = {
      '2025-07-09': "2025년 7월 9일에는 중요한 미팅이 있었습니다. 주요 논의 내용은 다음과 같습니다:\n- 프로젝트 A 진행 상황 보고\n- 다음 스프린트 계획 수립\n- 팀 빌딩 활동 제안\n\n추가적으로, 점심 식사로 김치찌개를 먹었습니다. 날씨는 맑았고 기분 좋은 하루였습니다.",
      '2025-07-15': "2025년 7월 15일은 친구와 함께 영화를 보러 간 날입니다. '인셉션'을 다시 봤는데 여전히 명작이더군요. 저녁에는 맛있는 파스타를 먹었습니다.",
      '2025-07-20': "2025년 7월 20일은 새로운 취미를 시작한 날입니다. 기타 강습을 처음 들었는데, 생각보다 어렵지만 재미있네요. 꾸준히 연습해야겠습니다.",
      // 다른 날짜에 대한 데이터 추가 가능
    };
    
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockChatData[date] || "선택된 날짜에 AI 채팅 기록이 없습니다.");
      }, 300); // 0.3초 지연
    });
  };

  // 날짜 클릭 핸들러
  const handleDateClick = async (info) => { // async 키워드 추가
    setSelectedDate(info.dateStr);
    
    // 1. AI 채팅 기록 먼저 불러오기
    const aiChat = await fetchAIChatContent(info.dateStr);
    setChatContent(aiChat);

    // 2. 클릭된 날짜에 해당하는 기존 여행 계획이 있는지 확인 (선택 사항)
    const plansOnDate = plans.filter(plan =>
      info.dateStr >= plan.start && info.dateStr <= (plan.end || plan.start)
    );

    if (plansOnDate.length > 0) {
      // 해당 날짜에 여행 계획이 있다면, 첫 번째 계획의 상세 정보를 보여주는 것으로 예시
      setSelectedPlan(plansOnDate[0]);
      // fetchPlanDetails(plansOnDate[0].id); // 필요하다면 채팅 내용과 함께 세부 일정도 로드
      // setChatContent(`'${plansOnDate[0].title}' 계획의 상세 내용을 불러옵니다.\n\n${aiChat}`); // AI 채팅과 계획 내용 함께 표시
    } else {
      // 해당 날짜에 여행 계획이 없다면, 새로운 여행 계획 생성 모드로 전환
      setSelectedPlan(null);
      setPlanDetails([]);
      // AI 채팅 내용이 없다면, 새 여행 계획 메시지 표시
      if (aiChat === "선택된 날짜에 AI 채팅 기록이 없습니다.") {
        setChatContent(`선택된 날짜 (${info.dateStr})에 새로운 여행 계획을 추가하시겠습니까?`);
      }
    }
    setIsModalOpen(true);
  };

  // 이벤트 클릭 핸들러
  const handleEventClick = (info) => {
    const planId = info.event.id; // 클릭된 이벤트의 ID (여행 계획 ID)
    const clickedPlan = plans.find(plan => plan.id === planId);

    if (clickedPlan) {
      setSelectedPlan(clickedPlan);
      setSelectedDate(info.event.startStr); // 이벤트의 시작 날짜를 표시
      fetchPlanDetails(planId); // 해당 여행 계획의 세부 일정 불러오기
    } else {
      setChatContent("이벤트를 찾을 수 없습니다.");
      setSelectedPlan(null);
      setPlanDetails([]);
    }
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate('');
    setChatContent('');
    setSelectedPlan(null);
    setPlanDetails([]);
    setIsDropdownGopen(false); // 모달 닫을 때 드롭다운도 닫기
  };

  // 드롭다운 버튼 클릭 핸들러
  const toggleDropdown = () => {
    setIsDropdownGopen(prev => !prev);
  };

  // 드롭다운 메뉴 항목 클릭 핸들러
  const handleMenuItemClick = async (functionName) => {
    setIsDropdownGopen(false); // 메뉴 항목 클릭 시 드롭다운 닫기

    if (functionName === '새 여행 계획 추가') {
      // 게스트는 이 기능을 사용할 수 없습니다.
      if (!isLoggedIn) {
        alert("로그인 상태에서만 여행 계획을 추가할 수 있습니다.");
        return;
      }
      // POST /plans API 호출
      const newPlanName = prompt('새로운 여행 계획 이름을 입력하세요:');
      if (newPlanName) {
        try {
          // 실제 API 엔드포인트로 변경하세요. 예: 'http://localhost:8080/plans'
          const response = await fetch('/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newPlanName,
              startDate: selectedDate, // 모달이 띄워진 날짜를 시작일로 사용
              endDate: selectedDate, // 일단 시작일과 동일하게 설정 (나중에 수정 가능)
              description: '새롭게 추가된 여행 계획입니다.'
            })
          });
          if (!response.ok) throw new Error('여행 계획 추가 실패');
          const addedPlan = await response.json();
          // FullCalendar 이벤트를 업데이트
          setPlans(prevPlans => [...prevPlans, {
            id: addedPlan.id,
            title: addedPlan.name,
            start: addedPlan.startDate,
            end: addedPlan.endDate,
            extendedProps: { description: addedPlan.description }
          }]);
          alert('여행 계획이 추가되었습니다!');
          closeModal(); // 모달 닫기
        } catch (error) {
          console.error('여행 계획 추가 중 오류:', error);
          alert('여행 계획 추가에 실패했습니다.');
        }
      }
    } else if (functionName === '여행 계획 수정') {
      // 게스트는 이 기능을 사용할 수 없습니다.
      if (!isLoggedIn) {
        alert("로그인 상태에서만 여행 계획을 수정할 수 있습니다.");
        return;
      }
      // PUT /plans/:id API 호출
      if (selectedPlan) {
        const updatedName = prompt('여행 계획의 새로운 이름을 입력하세요:', selectedPlan.title);
        if (updatedName) {
          try {
            // 실제 API 엔드포인트로 변경하세요. 예: `http://localhost:8080/plans/${selectedPlan.id}`
            const response = await fetch(`/plans/${selectedPlan.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: updatedName,
                // 다른 필드도 수정할 수 있도록 추가 (예: startDate, endDate, description)
              })
            });
            if (!response.ok) throw new Error('여행 계획 수정 실패');
            const updatedPlanData = await response.json();
            // FullCalendar 이벤트 및 selectedPlan 상태 업데이트
            setPlans(prevPlans => prevPlans.map(p =>
              p.id === selectedPlan.id ? { 
                ...p, 
                title: updatedPlanData.name, 
                start: updatedPlanData.startDate || p.start, 
                end: updatedPlanData.endDate || p.end,
                extendedProps: { ...p.extendedProps, description: updatedPlanData.description || p.extendedProps.description }
              } : p
            ));
            setSelectedPlan(prev => ({ 
              ...prev, 
              title: updatedPlanData.name,
              start: updatedPlanData.startDate || prev.start,
              end: updatedPlanData.endDate || prev.end,
              extendedProps: { ...prev.extendedProps, description: updatedPlanData.description || prev.extendedProps.description }
            }));
            alert('여행 계획이 수정되었습니다!');
          } catch (error) {
            console.error('여행 계획 수정 중 오류:', error);
            alert('여행 계획 수정에 실패했습니다.');
          }
        }
      }
    } else if (functionName === '여행 계획 삭제') {
      // 게스트는 이 기능을 사용할 수 없습니다.
      if (!isLoggedIn) {
        alert("로그인 상태에서만 여행 계획을 삭제할 수 있습니다.");
        return;
      }
      // DELETE /plans/:id API 호출
      if (selectedPlan && window.confirm(`'${selectedPlan.title}' 여행 계획을 삭제하시겠습니까?`)) {
        try {
          // 실제 API 엔드포인트로 변경하세요. 예: `http://localhost:8080/plans/${selectedPlan.id}`
          const response = await fetch(`/plans/${selectedPlan.id}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('여행 계획 삭제 실패');
          // FullCalendar 이벤트에서 삭제된 계획 제거
          setPlans(prevPlans => prevPlans.filter(p => p.id !== selectedPlan.id));
          alert('여행 계획이 삭제되었습니다!');
          closeModal(); // 모달 닫기
        } catch (error) {
          console.error('여행 계획 삭제 중 오류:', error);
          alert('여행 계획 삭제에 실패했습니다.');
        }
      }
    } else if (functionName === '세부 일정 추가') {
      // 게스트는 이 기능을 사용할 수 없습니다.
      if (!isLoggedIn) {
        alert("로그인 상태에서만 세부 일정을 추가할 수 있습니다.");
        return;
      }
      // POST /plans/:planId/details API 호출
      if (selectedPlan) {
        const activity = prompt('추가할 세부 일정을 입력하세요 (예: 10:00 공항 도착):');
        if (activity) {
          try {
            // 실제 API 엔드포인트로 변경하세요. 예: `http://localhost:8080/plans/${selectedPlan.id}/details`
            const response = await fetch(`/plans/${selectedPlan.id}/details`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                activity: activity,
                planId: selectedPlan.id,
                // time: '10:00' (사용자로부터 입력받거나 선택받도록 확장 가능)
              })
            });
            if (!response.ok) throw new Error('세부 일정 추가 실패');
            const addedDetail = await response.json();
            setPlanDetails(prevDetails => [...prevDetails, addedDetail]); // 모달의 세부 일정 목록 업데이트
            alert('세부 일정이 추가되었습니다!');
            fetchPlanDetails(selectedPlan.id); // 세부 일정 목록 새로고침 (chatContent 업데이트)
          } catch (error) {
            console.error('세부 일정 추가 중 오류:', error);
            alert('세부 일정 추가에 실패했습니다.');
          }
        }
      } else {
        alert('먼저 여행 계획을 선택해주세요.');
      }
    } else if (functionName === '채팅 내역 보기') {
      // 로그인 상태를 확인하고 AI 채팅 페이지로 이동합니다.
      if (isLoggedIn && onNavigateToAIChat) {
        onNavigateToAIChat(selectedDate);
        closeModal(); // 모달 닫기
      } else if (!isLoggedIn) {
        alert("로그인 상태에서만 채팅 내역을 볼 수 있습니다. 먼저 로그인해주세요.");
      } else {
        alert("AI 채팅 페이지로 이동하는 기능이 설정되지 않았습니다.");
      }
    } else if (functionName === 'JPG 저장하기') {
      alert("JPG 저장 기능이 실행되었습니다.");
      // TODO: JPG 저장 로직 구현
    } else if (functionName === 'PDF 저장하기') {
      alert("PDF 저장 기능이 실행되었습니다.");
      // TODO: PDF 저장 로직 구현
    }
  };

  // 모달 외부 클릭 시 드롭다운 닫기 (useEffect를 사용하여 전역 클릭 이벤트 감지)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 드롭다운 버튼이나 메뉴 자체가 아닌 다른 곳을 클릭했을 때
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
        editable={true} // 이벤트 드래그앤드롭 가능
        selectable={true} // 날짜 범위 선택 가능 (현재는 dateClick만 사용)
        locale="ko"
        height="auto"
        dateClick={handleDateClick} // 날짜 클릭 시
        eventClick={handleEventClick} // 이벤트 클릭 시
        events={plans} // FullCalendar에 여행 계획 데이터를 이벤트로 전달
        eventDrop={async (info) => { // 이벤트 드롭 시 (날짜 변경)
          console.log('이벤트 이동:', info.event.title, info.event.startStr, info.event.endStr);
          // TODO: PUT /plans/:id API를 호출하여 여행 계획 날짜 업데이트
          // info.event.id, info.event.start, info.event.end 등을 사용하여 백엔드에 업데이트 요청
          // 게스트는 이 기능을 사용할 수 없습니다.
          if (!isLoggedIn) {
            alert("로그인 상태에서만 여행 계획 날짜를 변경할 수 있습니다.");
            info.revert(); // 변경 취소
            return;
          }
          try {
            const response = await fetch(`/plans/${info.event.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                startDate: info.event.startStr,
                endDate: info.event.endStr || info.event.startStr, // 종료일이 없으면 시작일과 동일
                // 다른 필드는 유지하거나 필요한 경우 함께 업데이트
              })
            });
            if (!response.ok) throw new Error('여행 계획 날짜 업데이트 실패');
            alert('여행 계획 날짜가 업데이트되었습니다!');
            // FullCalendar는 이미 UI를 업데이트했으므로, 상태만 동기화하면 됩니다.
            setPlans(prevPlans => prevPlans.map(p =>
              p.id === info.event.id ? { ...p, start: info.event.startStr, end: info.event.endStr || info.event.startStr } : p
            ));
          } catch (error) {
            console.error('여행 계획 날짜 업데이트 중 오류:', error);
            alert('여행 계획 날짜 업데이트에 실패했습니다.');
            info.revert(); // 오류 발생 시 이벤트 원래 위치로 되돌리기
          }
        }}
      />

      {/* 모달 컴포넌트 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* X 닫기 버튼 */}
            <button className="modal-close-button" onClick={closeModal}>&times;</button>

            <h2>
              {selectedPlan ? selectedPlan.title : '새로운 여행 계획'} {/* 선택된 계획 이름 또는 '새로운 여행 계획' */}
            </h2>
            {selectedDate && (
              <p className="modal-date-display">
                {selectedDate}
              </p>
            )}

            {/* 여행 계획 상세 정보 및 세부 일정 표시 영역 */}
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
                          {/* 세부 일정 수정/삭제 버튼을 여기에 추가할 수 있습니다. */}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>등록된 세부 일정이 없습니다.</p>
                  )}
                </>
              ) : (
                // 새 여행 계획 생성 메시지 또는 폼
                <p>{chatContent}</p> 
                // 여기에 실제 여행 계획 생성 폼을 넣을 수 있습니다.
              )}
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
                  {/* 로그인 상태일 때만 여행 계획 관련 옵션 표시 */}
                  {isLoggedIn && selectedPlan ? ( 
                    <>
                      <li onClick={() => handleMenuItemClick('여행 계획 수정')}>
                        <span className="bullet-point"></span> 여행 계획 수정
                      </li>
                      <li onClick={() => handleMenuItemClick('여행 계획 삭제')}>
                        <span className="bullet-point"></span> 여행 계획 삭제
                      </li>
                      <li onClick={() => handleMenuItemClick('세부 일정 추가')}>
                        <span className="bullet-point"></span> 세부 일정 추가
                      </li>
                    </>
                  ) : isLoggedIn && !selectedPlan ? ( // 로그인 상태이고 새 계획일 때만 새 계획 추가 옵션 보이기
                    <li onClick={() => handleMenuItemClick('새 여행 계획 추가')}>
                      <span className="bullet-point"></span> 새 여행 계획 추가
                    </li>
                  ) : null /* 게스트는 여행 계획 관련 옵션 없음 */ }
                  
                  {/* 공통 기능 (로그인 상태와 무관하게 항상 표시) */}
                  <li onClick={() => handleMenuItemClick('채팅 내역 보기')}>
                    <span className="bullet-point"></span> 채팅 내역 보기
                  </li>
                  <li onClick={() => handleMenuItemClick('JPG 저장하기')}>
                    <span className="bullet-point"></span> JPG 저장하기
                  </li>
                  <li onClick={() => handleMenuItemClick('PDF 저장하기')}>
                    <span className="bullet-point"></span> PDF 저장하기
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
