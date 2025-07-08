// AIChatPage.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AIChatPage.css';
import Logo from "../components/Logo";

// 장소 추출 함수
const extractPlaces = (text) => {
  const regex = /어린이대공원|뚝섬한강공원|서울숲|세종대학교 벚꽃길|건대입구 커먼그라운드/g;
  return text.match(regex) || [];
};

// 임시 AI 응답 생성 함수
const getRouteFromAI = async (selectedPlaces) => {
  const list = selectedPlaces.join(" → ");
  return `✨ 선택하신 장소를 기반으로 추천 코스를 알려드릴게요!\n\n${list} 도보 코스는 하루 일정으로 적당해요! 중간중간 휴식 장소도 추천드려요 ☕`;
};

const AIChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const initialQuestion = state?.question || '질문이 전달되지 않았습니다.';
  const initialAnswer = `안녕하세요!\n${initialQuestion}\n기준으로 여행 일정을 추천해드릴게요 🌿\n\n1일차: 어린이대공원, 뚝섬한강공원\n2일차: 서울숲, 세종대학교 벚꽃길, 건대입구 커먼그라운드\n\n즐거운 여행 되세요! ✈️🧳`;

  const [messages, setMessages] = useState([
    { role: 'user', text: initialQuestion },
    { role: 'ai', text: initialAnswer }
  ]);

  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [showPlaceSelector, setShowPlaceSelector] = useState(true);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const latestAI = messages.findLast((m) => m.role === 'ai');
    if (latestAI) {
      const found = extractPlaces(latestAI.text);
      setPlaces(found);
    }
  }, [messages]);

  const handleComplete = async () => {
    if (selectedPlaces.length === 0) return;

    const placeText = selectedPlaces.join(', ');
    const question = `${placeText} 으로 도보 여행 코스 추천해줘`;
    const answer = await getRouteFromAI(selectedPlaces);

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
      {/* 헤더 */}
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <div className="chat-title-center">
          <Logo link="/" />
        </div>
        <div className="header-placeholder" />
      </div>

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
      </div>

      {/* 입력창 */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="질문을 입력하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button onClick={handleSend}>전송하기</button>
      </div>
    </div>
  );
};

export default AIChatPage;
