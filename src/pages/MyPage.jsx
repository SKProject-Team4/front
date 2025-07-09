import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// beachBackgroundImage 임포트 제거됨
import './MyPage.css'; // MyPage 전용 CSS 파일 임포트

const MyPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchUserData = async () => {
      // 실제 환경에서는 여기서 사용자 토큰을 이용해 API를 호출하여 사용자 정보를 가져옵니다.
      // 예시를 위해 더미 데이터를 사용합니다.
      // const token = localStorage.getItem('userToken');
      // if (!token) {
      //   alert('로그인이 필요합니다.');
      //   navigate('/login');
      //   return;
      // }

      try {
        // 실제 API 호출 (예시)
        // const response = await fetch('/api/user/profile', {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        // if (!response.ok) {
        //   throw new Error('사용자 정보를 가져오지 못했습니다.');
        // }
        // const data = await response.json();

        // 더미 데이터 (기존 사용자 정보로 가정)
        const data = {
          name: '김유저',
          email: 'user@example.com',
        };
        setName(data.name);
        setEmail(data.email);
        setIsLoading(false); // 데이터 로딩 완료
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다.');
        navigate('/'); // 에러 발생 시 메인 페이지로 이동
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    // 여기에 사용자 정보를 업데이트하는 API 호출 로직을 추가합니다.
    try {
      // 실제 API 호출 (예시)
      // const token = localStorage.getItem('userToken');
      // const response = await fetch('/api/user/update-profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ name, email, password: password || undefined }) // 비밀번호는 입력했을 때만 전송
      // });

      // if (!response.ok) {
      //   throw new Error('프로필 업데이트에 실패했습니다.');
      // }

      alert('회원 정보가 성공적으로 업데이트되었습니다!');
      // 업데이트 후 필요하다면 다시 로그인하거나, 페이지를 새로고침할 수 있습니다.
      // navigate('/mypage'); // 현재 페이지를 다시 로드하거나
      // 또는:
      // navigate('/'); // 메인 페이지로 이동
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('회원 정보 업데이트에 실패했습니다.');
    }
  };

  const handleGoToMain = () => {
    navigate('/'); // 메인 페이지로 이동
  };

  if (isLoading) {
    return (
      // style 속성 제거
      <div className="mypage-container">
        <div className="top-right-buttons-container">
          <button type="button" onClick={handleGoToMain} className="top-bar-button">
            메인 페이지
          </button>
        </div>
        <div className="mypage-content-wrapper">
          <p>사용자 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    // style 속성 제거
    <div className="mypage-container">
      {/* 상단 메인 페이지 버튼 */}
      <div className="top-right-buttons-container">
        <button type="button" onClick={handleGoToMain} className="top-bar-button">
          메인 페이지
        </button>
      </div>

      <div className="mypage-content-wrapper">
        <h1 className="mypage-title">회원 정보 수정</h1>
        <form onSubmit={handleUpdateProfile} className="profile-edit-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">새 비밀번호 (변경 시 입력)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>
          <button type="submit" className="update-button">
            정보 수정
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyPage;