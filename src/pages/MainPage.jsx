import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky_main.png'; // 배경 이미지
import logoImage from '../assets/logo.png'; // 로고 이미지
import './MainPage.css'; // CSS 파일 임포트
import Calendar from '../components/Calendar'; // ★★★ Calendar 컴포넌트 임포트 ★★★

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 localStorage에 토큰이 있는지 확인하여 로그인 상태 초기화
    const token = localStorage.getItem('userToken');
    // 임시 키(게스트 모드)일 때는 로그인으로 간주하지 않음
    if (token && token !== 'guest-planning-key-12345') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

  const handleClick = () => {
    // "여행 계획 세우기" 버튼 클릭 시 임시 키 발급 (로그인 처리)
    const token = localStorage.getItem('userToken');
    // 실제 사용자가 로그인하지 않은 상태 (토큰 없거나 게스트 키인 경우)일 때만 임시 키 발급
    if (!token || token === 'guest-planning-key-12345') { 
      localStorage.setItem('userToken', 'guest-planning-key-12345'); // 임시 토큰 저장
      alert('비회원용 임시 키가 발급되었습니다. 여행 계획 페이지로 이동합니다.');
    }
    navigate('/start-planning'); // 여행 계획 페이지로 이동 (로그인 여부와 관계없이 최종 목적지)
  };

  const handleAuthClick = (e) => {
    e.preventDefault();

    if (isLoggedIn) { // 실제 로그인된 사용자일 경우에만 로그아웃 처리
      localStorage.removeItem('userToken');
      setIsLoggedIn(false); // 상태 업데이트
      alert('로그아웃 되었습니다.');
      // 로그아웃 후 메인 페이지에 남아있도록 navigate 제거 (요청에 따라 변경)
    } else { // 로그인되지 않았거나 게스트 모드일 경우 로그인 페이지로 이동
      navigate('/login'); 
    }
  };

  const handleMyPageClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) { // 실제 로그인된 사용자일 경우 마이페이지로 이동
        navigate('/mypage'); 
    } else { // 로그인되지 않았거나 게스트 모드일 경우 로그인 페이지로 이동 요청
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        navigate('/login'); 
    }
  };

  // events 배열은 Calendar 컴포넌트 내부로 이동하거나, 필요시 props로 전달

  return (
    <div
      className="main-page-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="top-right-buttons-container">
        <button type="button" onClick={handleMyPageClick} className="top-bar-button">
          마이페이지
        </button>
        <button type="button" onClick={handleAuthClick} className="top-bar-button">
          {isLoggedIn ? '로그아웃' : '로그인'}
        </button>
      </div>

      <div className="logo-container">
        <img
          src={logoImage}
          alt="서비스 로고"
          className="main-page-logo"
        />
      </div>

      <div className="main-content">
        <p className="main-catchphrase-text title-text">"여행이 쉬워진다, AI와 함께라면."</p>

        {/* 로그인 상태에 따라 Calendar 컴포넌트를 조건부 렌더링 */}
        {isLoggedIn && ( // isLoggedIn 상태에 따라 캘린더 렌더링 
            <Calendar /> 
        )}

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