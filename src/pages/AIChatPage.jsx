import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AIChatPage.css';
import Logo from "../components/Logo";
// AIService 임포트
import AIService from '../services/AIService'; // src/pages/에서 src/services/로 접근

const AIChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const initialQuestion = state?.question || '질문이 전달되지 않았습니다.';
  // AIService에서 초기 AI 응답 가져오기
  const initialAIAnswer = AIService.getInitialAIResponse(initialQuestion);

  const [messages, setMessages] = useState([
    { role: 'user', text: initialQuestion },
    { role: 'ai', text: initialAIAnswer }
  ]);

  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [showPlaceSelector, setShowPlaceSelector] = useState(true);
  const [inputText, setInputText] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // ✅ 스크롤용 ref
  const scrollRef = useRef(null);

  // ✅ 메시지 업데이트 시 맨 아래로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const latestAI = messages.findLast((m) => m.role === 'ai');
    if (latestAI) {
      // AIService에서 장소 추출 함수 사용
      const found = AIService.extractPlaces(latestAI.text);
      setPlaces(found);
    }
  }, [messages]);

  const handleComplete = async () => {
    if (selectedPlaces.length === 0) return;

    const placeText = selectedPlaces.join(', ');
    // AIService에서 경로 추천 함수 사용
    const answer = await AIService.getRouteFromAI(selectedPlaces);

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: placeText },
      { role: 'ai', text: answer }
    ]);

    setPlaces([]);
    setSelectedPlaces([]);
    setShowPlaceSelector(false); // 선택창 비활성화
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = { role: 'user', text: inputText };
    const aiMsg = {
      role: 'ai',
      text: `🤖 "${inputText}" 에 대해 생각해볼게요!\n\n정식 GPT 응답은 아직 준비 중이에요!`
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputText('');
  };

  return (
    <div className="chat-wrapper">
      {/* 헤더 - 그대로 유지! */}
      <div className="chat-header">
        <button
          className="back-button"
          onClick={() => {
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

      {/* ✅ 흰색 박스 채팅 컨텐츠 부분 시작 */}
      <div className="chat-content-box">
        {/* 채팅 본문 */}
        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.role} fade-in`}>
              {msg.text}
            </div>
          ))}

          {places.length > 0 && showPlaceSelector && (
            <div className="place-selection fade-in">
              <div className="keyword-title">🗺️ 가고 싶은 장소를 골라줘!</div>
              <div className="place-buttons">
                {places.map((place) => (
                  <button
                    key={place}
                    onClick={() =>
                      setSelectedPlaces((prev) =>
                        prev.includes(place)
                          ? prev.filter((p) => p !== place)
                          : [...prev, place]
                      )
                    }
                    className={`place-button ${selectedPlaces.includes(place) ? 'selected' : ''}`}
                  >
                    {place}
                  </button>
                ))}
              </div>
              <button className="complete-button" onClick={handleComplete}>✅ 완료</button>
            </div>
          )}

          {/* ✅ 스크롤 포커스용 div */}
          <div ref={scrollRef} />
        </div>

        {/* 입력창 */}
        <div className="chat-input">
          <input
            type="text"
            placeholder="질문을 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="chat-button" onClick={handleSend}>전송하기</button>

          <div className="options-wrapper">
            <button className="options-button" onClick={() => setShowOptions((prev) => !prev)}>⋮</button>
            {showOptions && (
              <div className="options-dropdown">
                <button>캘린더에 저장하기</button>
                <button>PDF로 저장하기</button>
                <button>JPG로 저장하기</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
