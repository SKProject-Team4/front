import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AIChatPage.css'; // CSS 파일 경로는 프로젝트 구조에 맞게 확인해주세요.
import Logo from "../components/Logo"; // Logo 컴포넌트 경로 확인
import CustomAlert from "../components/CustomAlert"; // CustomAlert 컴포넌트 경로 확인
import AIService from '../services/AIService'; // AIService 경로 확인

const AIChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const {
    question,
    startDate,
    endDate,
    selectedRegion,
} = location.state || {};

  // 이전 페이지에서 전달된 초기 질문을 받습니다.
  const initialQuestion = state?.question || '질문이 전달되지 않았습니다.';
  // AIService를 통해 초기 AI 응답을 가져옵니다.
  // 이 부분은 실제 AI API 호출이 아닌 모의 응답일 수 있습니다.
  // const initialAIAnswer = AIService.getInitialAIResponse(initialQuestion);

  // 채팅 메시지 상태 (사용자 메시지와 AI 메시지 포함)
  const [messages, setMessages] = useState([]);
  // AI가 추출한 장소 목록
  const [places, setPlaces] = useState([]);
  // 사용자가 선택한 장소 목록
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  // 장소 선택 UI를 보여줄지 여부
  const [showPlaceSelector, setShowPlaceSelector] = useState(true);
  // 사용자 입력 텍스트
  const [inputText, setInputText] = useState('');
  // 추가 옵션 메뉴(캘린더, PDF 등)를 보여줄지 여부
  const [showOptions, setShowOptions] = useState(false);
  // 스크롤을 자동으로 내려주기 위한 ref
  const scrollRef = useRef(null);
  // 채팅 세션 고유 ID (백엔드와 통신 시 필요)
  const [chatUid, setChatUid] = useState(null);
  // 커스텀 알림창 메시지
  const [alertMessage, setAlertMessage] = useState('');
  const [redirectPath, setRedirectPath] = useState(null);
  // 메시지 전송 중인지 여부 (중복 전송 방지 및 로딩 표시)
  const [isSending, setIsSending] = useState(false);

  // messages 상태가 업데이트될 때마다 스크롤을 최하단으로 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // messages 상태의 마지막 AI 응답이 변경될 때마다 장소를 추출
  useEffect(() => {
    const latestAI = messages.findLast((m) => m.role === 'ai');
    if (latestAI) {
      const found = AIService.extractPlaces(latestAI.text);
      setPlaces(found);
    }
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chat_id = await AIService.createChatSession();
        console.log('챗 아이디 :', chat_id);
        setChatUid(chat_id);
      } catch (error) {
        console.error('에러 발생:', error);
      }
    };

    fetchData();
  }, []); // ✅ 의존성 배열을 빈 배열로 고정!

  useEffect(() => {
    if (initialQuestion && chatUid !== null) {
      sendInitialQuestion(); // 👈 따로 만든 함수 사용!
    }
  }, [chatUid]);

  // 로그인된 사용자인지 확인
  const isLoggedInUser = (() => {
    const token = localStorage.getItem('userToken');
    return token && token !== 'guest-planning-key-12345';
  })();

  // 장소 선택 완료 버튼 클릭 시 처리
  const handleComplete = async () => {
    if (selectedPlaces.length === 0) return;
    setIsSending(true); // 전송 시작

    const placeText = selectedPlaces.join(', ');
    // 사용자 메시지 즉시 추가
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: `제가 선택한 장소는 ${placeText} 입니다.` } // 사용자 선택 명확화
    ]);

    // AI 응답을 위한 빈 메시지 추가 (스트리밍될 내용을 채울 자리)
    setMessages((prev) => [...prev, { role: 'ai', text: '' }]);

    try {
      // AIService에서 경로 추천 함수 사용
      // TODO: getRouteFromAI도 sendMessageToAI처럼 스트리밍 콜백을 받도록 수정하면 더 자연스럽습니다.
      // 현재는 getRouteFromAI가 전체 응답을 반환하면, 그 응답으로 마지막 AI 메시지를 업데이트합니다.
      // AIService의 getRouteFromAI가 응답 데이터를 await response(); 으로 받으므로, 이 부분을 수정해야 합니다.
      // `const data = await response();` -> `const data = await response.json();` (JSON 응답인 경우)
      // 또는 스트리밍 방식이라면 `AIService.sendMessageToAI`처럼 수정 필요.
      const aiAnswerForPlaces = await AIService.getRouteFromAI(selectedPlaces, chatUid);
      setMessages((prev) => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.role === 'ai' && msg.text === '' // 비어있는 마지막 AI 메시지 찾기
        ? { ...msg, text: aiAnswerForPlaces } 
        : msg
      ));

    } catch (error) {
      console.error("경로 추천 실패:", error);
      setMessages((prev) => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.role === 'ai' // 마지막 AI 메시지에 에러 표시
        ? { ...msg, text: "경로 추천에 실패했습니다. 다시 시도해주세요." } 
        : msg
      ));
    } finally {
      setIsSending(false); // 전송 완료
      setPlaces([]); // 장소 선택 목록 초기화
      setSelectedPlaces([]); // 선택된 장소 초기화
      setShowPlaceSelector(false); // 장소 선택 UI 숨김
    }
  };

  // 스트리밍 AI 응답을 처리하는 콜백 함수 (useCallback으로 최적화)
  const handleAIResponseUpdate = useCallback((newChunk) => {
    setMessages((prevMessages) => {
      // 마지막 메시지가 AI 메시지인지 확인하고 업데이트
      const lastMessageIndex = prevMessages.length - 1;
      if (lastMessageIndex >= 0 && prevMessages[lastMessageIndex].role === 'ai') {
        const updatedMessages = [...prevMessages];
        // 새로운 청크를 기존 텍스트에 추가합니다.
        // 💡 newChunk를 추가하기 전에 trim()을 한 번 더 적용하여 불필요한 공백 제거
        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          text: updatedMessages[lastMessageIndex].text + newChunk.trim(), 
        };
        return updatedMessages;
      }
      // 이 경우는 발생하면 안 되지만, 만약을 위해 새로운 AI 메시지 추가
      console.warn("AI 메시지가 예상치 못한 위치에 추가되었습니다.");
      return [...prevMessages, { role: 'ai', text: newChunk.trim() }]; // 💡 여기도 trim() 적용
    });
  }, []);

  // 메시지 전송 버튼 클릭 또는 Enter 키 입력 시 처리
  const handleSend = async () => {
    if (!inputText.trim() || isSending) return; // 입력값이 없거나 전송 중이면 무시

    const userMsg = { role: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]); // 사용자 메시지를 먼저 추가

    setInputText(''); // 입력 필드 초기화
    setIsSending(true); // 전송 시작 상태로 설정

    // AI 응답을 위한 빈 메시지 추가 (스트리밍될 내용을 채울 자리)
    setMessages((prev) => [...prev, { role: 'ai', text: '' }]);

    try {
      // AIService.sendMessageToAI 호출하여 AI 응답 받기
      // 💡 handleAIResponseUpdate 콜백 함수를 전달하여 실시간 업데이트를 처리합니다.
      await AIService.sendMessageToAI(inputText, chatUid, handleAIResponseUpdate);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      // 오류 발생 시 마지막 AI 메시지에 오류 메시지 표시
      setMessages((prev) => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.role === 'ai' 
        ? { ...msg, text: "AI 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요." } 
        : msg
      ));
    } finally {
      setIsSending(false); // 전송 완료 상태로 설정
    }
  };

  const sendInitialQuestion = async () => {
    if (!initialQuestion || isSending) return;

    const userMsg = { role: 'user', text: initialQuestion };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);
    setMessages((prev) => [...prev, { role: 'ai', text: '' }]);

    try {
      await AIService.sendMessageToAI(initialQuestion, chatUid, handleAIResponseUpdate);
    } catch (error) {
      console.error("초기 질문 전송 실패:", error);
      setMessages((prev) => prev.map((msg, idx) =>
        idx === prev.length - 1 && msg.role === 'ai'
          ? { ...msg, text: "AI 응답 생성 중 오류가 발생했어요. 다시 시도해주세요." }
          : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  const handleSavePlan = async () => {
    const aiText = messages.findLast((msg) => msg.role === 'ai')?.text || 'AI 응답 없음';
    const title = `${selectedRegion || '여행지'} 여행 계획`; // 또는 사용자 입력
    const startISO = new Date(startDate).toISOString().split('T')[0];
    const endISO = new Date(endDate).toISOString().split('T')[0];
    const token = localStorage.getItem('userToken');
    const guestKey = token ? null : '게스트-키-예시';

    try {
      const result = await AIService.savePlan(title, aiText, startISO, endISO, chatUid, guestKey);

      if(isLoggedInUser){
        setAlertMessage('📅 캘린더에 저장했어요! 홈으로 돌아갈게요~ 🏠');
        setRedirectPath('/'); // ✅ 확인 누르면 홈으로!
      }
      else{
        setAlertMessage('로그인을 해주세요.');
        setRedirectPath('/api/users/login'); // ✅ 확인 누르면 로그인 창으로!
      }
    } catch (e) {
      setAlertMessage('❌ 저장 실패: ' + e.message);
    }
  };



  // PDF로 저장 기능 (기능 추가 예정 알림)
  const handleSaveAsPDF = () => {
    setAlertMessage('PDF로 저장했어요! 📝 (기능 추가 예정)');
  };

  // JPG로 저장 기능 (기능 추가 예정 알림)
  const handleSaveAsJPG = () => {
    setAlertMessage('JPG로 저장했어요! 🖼️ (기능 추가 예정)');
  };

  return (
    <div className="chat-wrapper">
      {/* 상단 헤더 영역 */}
      <div className="chat-header">
        <button
          className="back-button"
          onClick={() => {
            // 이전 페이지 기록이 2개 이상이면 뒤로 가기, 아니면 시작 페이지로 이동
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/start-planning');
            }
          }}
        >
          ⬅︎
        </button>
        <div className="chat-title-center">
          <Logo link="/" />
        </div>
      </div>

      {/* 채팅 내용 본문 영역 */}
      <div className="chat-content-box">
        <div className="chat-body">
          {/* 메시지 버블 렌더링 */}
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.role} fade-in`}>
              {msg.text}
            </div>
          ))}

          {/* AI 응답 로딩 중 표시 */}
          {isSending && (
            <div className="chat-bubble ai fade-in loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          )}

          {/* 장소 선택 UI */}
          {/* {places.length > 0 && showPlaceSelector && (
            <div className="place-selection fade-in">
              <div className="keyword-title">🗺️ 가고 싶은 장소를 골라줘!</div>
              <div className="place-buttons">
                {places.map((place) => (
                  <button
                    key={place}
                    onClick={() =>
                      setSelectedPlaces((prev) =>
                        prev.includes(place)
                          ? prev.filter((p) => p !== place) // 이미 선택된 경우 제거
                          : [...prev, place] // 선택되지 않은 경우 추가
                      )
                    }
                    className={`place-button ${selectedPlaces.includes(place) ? 'selected' : ''}`}
                  >
                    {place}
                  </button>
                ))}
              </div>
              <button className="complete-button" onClick={handleComplete} disabled={isSending}>
                ✅ 완료
              </button>
            </div>
          )} */}

          {/* 스크롤 위치를 잡아주는 ref */}
          <div ref={scrollRef} />
        </div>

        {/* 입력창 + 옵션 영역 */}
        <div className="chat-input">
          <input
            type="text"
            placeholder="질문을 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Enter 키 기본 동작 방지
                handleSend(); // 메시지 전송
              }
            }}
            disabled={isSending} // 전송 중에는 입력 비활성화
          />
          <button className="chat-button" onClick={handleSend} disabled={isSending}>
            전송하기
          </button>

          {/* 추가 옵션 버튼 및 드롭다운 */}
          <div className="options-wrapper">
            <button className="options-button" onClick={() => setShowOptions((prev) => !prev)}>⋮</button>
            {showOptions && (
              <div className="options-dropdown">
                <button onClick={handleSavePlan}>캘린더에 저장하기</button>
                <button onClick={handleSaveAsPDF}>PDF로 저장하기</button>
                <button onClick={handleSaveAsJPG}>JPG로 저장하기</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 커스텀 알림창 컴포넌트 */}
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => {
            setAlertMessage('');
            if (redirectPath) {
              navigate(redirectPath);
              setRedirectPath(null); // ✅ 이동 경로 초기화
            }
          }}
          onCancel={() => {
            setAlertMessage('');
            setRedirectPath(null); // ❗ 취소 누르면 리디렉션 안 하도록!
          }}
          showCancel={!isLoggedInUser} // ✅ 로그인 안한 경우만 '취소' 버튼 보여줘!
        />
      )}
    </div>
  );
};

export default AIChatPage;