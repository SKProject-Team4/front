import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css'; // MyPage 전용 CSS 파일 임포트
import AuthService from '../services/AuthService'; // AuthService 임포트 (이메일 중복 확인용)
import UserService from '../services/UserService'; // UserService 임포트

const MyPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState(''); // 초기 이메일 저장을 위한 상태
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const [emailError, setEmailError] = useState(''); // 이메일 중복 오류 메시지

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('userToken');

      // 토큰이 없거나 게스트 키인 경우 마이페이지 접근 불가
      if (!token || token === 'guest-planning-key-12345') {
        alert('마이페이지는 로그인한 사용자만 이용할 수 있습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
        return;
      }

      // UserService를 사용하여 사용자 프로필 정보 조회
      const result = await UserService.fetchUserProfile(token);

      if (result.success) {
        setName(result.user.username);
        setEmail(result.user.email);
        setOriginalEmail(result.user.email);
        setIsLoading(false);
      } else {
        alert(result.message || '사용자 정보를 불러오는 데 실패했습니다.');
        localStorage.removeItem('userToken'); // 실패 시 토큰 제거
        navigate('/login');
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

    // 이메일 변경 시에만 중복 체크 수행 (AuthService 재활용)
    if (email !== originalEmail) {
      const emailCheckResult = await AuthService.checkEmailDuplicate(email);
      if (!emailCheckResult.success) { // 중복이거나 오류 발생
        setEmailError(emailCheckResult.message);
        alert(emailCheckResult.message);
        return;
      }
      setEmailError(''); // 에러가 없으면 초기화
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // UserService를 사용하여 사용자 프로필 정보 업데이트
    const updateResult = await UserService.updateUserProfile(token, name, email, password);

    if (updateResult.success) {
      alert(updateResult.message);
      setOriginalEmail(email); // 이메일 변경이 성공하면 originalEmail 업데이트
      setPassword(''); // 비밀번호 초기화
      setConfirmPassword(''); // 비밀번호 확인 초기화
    } else {
      alert('회원 정보 업데이트에 실패했습니다: ' + updateResult.message);
    }
  };

  const handleGoToMain = () => {
    navigate('/'); // 메인 페이지로 이동
  };

  if (isLoading) {
    return (
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
            {emailError && <p className="error-message">{emailError}</p>}
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