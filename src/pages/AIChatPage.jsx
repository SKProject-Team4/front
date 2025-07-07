import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AIChatPage.css';
import Logo from "../components/Logo";

// ⭐ 장소 뽑아내기 함수 (간단한 예시)
const extractPlaces = (text) => {
  const regex = /어린이대공원|뚝섬한강공원|서울숲|세종대학교 벚꽃길|건대입구 커먼그라운드/g;
  return text.match(regex) || [];
};

// ⭐ 임시 AI 응답 함수 (실제로는 GPT API로 대체 가능)
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

  // 🧠 메시지 상태 (대화형 출력)
  const [messages, setMessages] = useState([
    { role: 'user', text: initialQuestion },
    { role: 'ai', text: initialAnswer }
  ]);

  // 🧠 장소 관련 상태
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  useEffect(() => {
    const latestAI = messages.findLast((m) => m.role === 'ai');
    if (latestAI) {
      const found = extractPlaces(latestAI.text);
      setPlaces(found);
    }
  }, [messages]);

  // 🎯 완료 눌렀을 때 → AI 응답 추가
  const handleComplete = async () => {
    if (selectedPlaces.length === 0) return;

    const question = `${selectedPlaces.join(', ')} 으로 도보 여행 코스 추천해줘`;
    const answer = await getRouteFromAI(selectedPlaces);

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: question },
      { role: 'ai', text: answer }
    ]);

    setPlaces([]); // 버튼 안보이게
    setSelectedPlaces([]); // 선택 초기화
  };

  return (
    <div className="chat-wrapper">
      {/* 헤더 */}
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">← 뒤로가기</button>
        <div className="chat-title-center">
          <Logo />
        </div>
      </div>

      {/* 대화 내용 */}
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}

        {/* 장소 선택 버튼 */}
        {places.length > 0 && (
          <div className="place-selection">
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

      {/* 입력창 (비활성화 상태) */}
      <div className="chat-input">
        <input type="text" placeholder="질문을 입력하세요..." disabled />
        <button disabled>전송하기</button>
      </div>
    </div>
  );
};

export default AIChatPage;
