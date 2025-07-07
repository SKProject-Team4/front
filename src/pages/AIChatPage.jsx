import { useLocation, useNavigate } from 'react-router-dom';
import './AIChatPage.css';
import logo from '../assets/logo.png'; // ⬅️ 로고 이미지 추가!

const AIChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const question = state?.question || '질문이 전달되지 않았습니다.';
  const response = `안녕하세요!\n ${question} \n기준으로 여행 일정을 추천해드릴게요 🌿\n\n1일차: 서울 시내 명소 투어 (경복궁, 인사동, 북촌 한옥마을)\n2일차: 맛집 탐방과 쇼핑 (홍대, 강남)\n숙소는 지하철 역 근처로 추천드려요!\n\n즐거운 여행 되세요! ✈️🧳`;

  return (
    <div className="chat-wrapper">
      
      {/* 헤더 */}
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">← 뒤로가기</button>
        <img src={logo} alt="로고" className="logo-img" />
      </div>

      {/* 본문 */}
      <div className="chat-body">
        <div className="chat-bubble user">{question}</div>
        <div className="chat-bubble ai">{response}</div>
      </div>

      {/* 질문 입력창 (기능 없음) */}
      <div className="chat-input">
        <input type="text" placeholder="질문을 입력하세요..." disabled />
        <button disabled>전송하기</button>
      </div>
    </div>
  );
};

export default AIChatPage;
