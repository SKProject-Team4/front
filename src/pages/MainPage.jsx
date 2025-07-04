import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png'; // 배경 이미지
import calendarIcon from '../assets/calendar.png'; // 왼쪽 아이콘

const MainPage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/start-planning-page'); // 여행 계획 페이지로 이동
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: '#333',
      }}
    >
      {/* ⬆️ 상단 바 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '0 30px',
          borderBottom: '1px solid #ccc',
          height: '70px',
          position: 'relative',
        }}
      >
        {/* 왼쪽: 캘린더 아이콘 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={calendarIcon}
            alt="캘린더 아이콘"
            style={{ width: '40px', height: '40px' }}
          />
        </div>

        {/* 가운데: 로고 텍스트 */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
            fontSize: '20px',
          }}
        >
          로고
        </div>

        {/* 오른쪽: 로그인/로그아웃 */}
        <div style={{ fontSize: '14px' }}>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }}>
            로그인/로그아웃
          </a>
        </div>
      </div>

      {/* ⬇️ 본문 내용 */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>AI 여행추천</h1>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            margin: '20px auto',
            padding: '20px',
            width: '80%',
            maxWidth: '500px',
            borderRadius: '8px',
          }}
        >
          <p>여행 스타일에 맞춘 맞춤 계획을 추천해드려요!</p>
          <div style={{ marginTop: '20px' }}>
            <span>🧳 ✈️ 🏝️</span>
          </div>
        </div>

        <button
          onClick={handleClick}
          style={{
            backgroundColor: 'white',
            padding: '12px 24px',
            borderRadius: '10px',
            border: '1px solid #ccc',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
            marginTop: '20px',
          }}
        >
          여행 계획 세우기
        </button>
      </div>
    </div>
  );
};

export default MainPage;
