import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css'; // MyPage 전용 CSS 파일 임포트
import axios from 'axios'; // axios 임포트

const MyPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState(''); // 초기 이메일 저장을 위한 상태
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const [emailError, setEmailError] = useState(''); // 이메일 중복 오류 메시지

  // 🚨 백엔드 API의 기본 URL을 여기에 설정해주세요!
  const API_BASE_URL = 'http://localhost:8080'; // 예시: 실제 백엔드 URL로 변경하세요.

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('userToken');

      if (!token || token === 'guest-planning-key-12345') { // 토큰이 없거나 게스트 키인 경우
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
        return;
      }

      try {
        console.log('마이페이지: 사용자 정보 로딩을 위한 로그인 체크 API 호출 시도');
        // GET /users/logincheck API 호출
        const response = await axios.get(`${API_BASE_URL}/users/logincheck`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // API 명세에 따르면 'users' 상태일 때 로그인된 사용자
        if (response.data.status === 'users' && response.data.code === 200 && response.data.login === true) {
          // ★★★ 백엔드 응답에서 이름(username)과 이메일을 가져와야 함 ★★★
          // 가정: logincheck 응답에 user 정보가 포함되거나, 별도의 프로필 조회 API가 있다고 가정
          // 현재 logincheck 명세에는 username, email 필드가 없으므로, 백엔드와 협의 필요
          // 여기서는 임시로 응답에 user: { username, email }이 있다고 가정합니다.
          // 만약 응답에 이 정보가 없다면 별도의 GET /users/profile 같은 API가 필요합니다.
          const userData = response.data.user || { username: '불러오기 실패', email: '불러오기 실패' }; // 임시 더미 데이터

          setName(userData.username); // 'username' 필드를 'name'으로 사용
          setEmail(userData.email);
          setOriginalEmail(userData.email); // 초기 이메일 저장
          setIsLoading(false);
          console.log('마이페이지: 사용자 정보 로딩 성공', userData);
        } else {
          alert('로그인 상태를 확인할 수 없습니다. 다시 로그인해주세요.');
          localStorage.removeItem('userToken'); // 유효하지 않은 토큰 제거
          navigate('/login');
        }
      } catch (error) {
        console.error('마이페이지: 사용자 정보 로딩 실패:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다.');
        localStorage.removeItem('userToken'); // 오류 시 토큰 제거
        navigate('/login'); // 에러 발생 시 로그인 페이지로 이동
      }
    };

    fetchUserData();
  }, [navigate]);

  // 이메일 중복 확인 함수 (AuthPage의 validateEmail 재활용)
  const validateEmail = async (checkEmail) => {
    if (!checkEmail.includes('@') || !checkEmail.includes('.')) {
      return '유효한 이메일 형식이 아닙니다.';
    }

    try {
      console.log('마이페이지: 이메일 중복 확인 API 호출 시도:', `${API_BASE_URL}/users/check_username?email=${checkEmail}`); //
      const response = await axios.get(`${API_BASE_URL}/users/check_username`, { //
        params: { email: checkEmail },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success' && response.data.code === 200) { //
        return ''; // 사용 가능한 아이디
      } else if (response.data.status === 'error' && response.data.message === '이미 사용 중인 아이디입니다.') { //
        return '이미 등록된 이메일입니다.'; // 중복됨
      } else {
        console.error('마이페이지: 이메일 중복 확인 실패 응답:', response.data);
        return '이메일 중복 확인 중 알 수 없는 오류가 발생했습니다.';
      }
    } catch (error) {
      console.error('마이페이지: 이메일 중복 확인 API 호출 오류:', error);
      if (error.response && error.response.data.message === '이미 사용 중인 아이디입니다.') { //
        return '이미 등록된 이메일입니다.';
      }
      return '이메일 중복 확인 중 네트워크 오류 또는 서버 오류가 발생했습니다.';
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    // 이메일 변경 시에만 중복 체크 수행
    if (email !== originalEmail) {
      const error = await validateEmail(email);
      if (error) {
        setEmailError(error);
        alert(error); // 사용자에게 알림
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

    try {
      // ★★★ 사용자 정보 업데이트 API (가정: PUT /users/edit_info) ★★★
      // 이 부분은 백엔드 API 명세에 맞춰 변경해야 합니다.
      // username은 name 상태 변수를, email은 email 상태 변수를 사용합니다.
      // password는 입력된 경우에만 전송합니다.
      const updatePayload = {
        username: name,
        email: email,
      };
      if (password) { // 비밀번호 필드가 비어있지 않은 경우에만 추가
        updatePayload.password = password;
      }

      console.log('마이페이지: 사용자 정보 업데이트 API 호출 시도:', `${API_BASE_URL}/users/edit_info`, updatePayload);
      const response = await axios.put(`${API_BASE_URL}/users/edit_info`, updatePayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // 가상의 응답 처리: 백엔드 응답에 따라 조건 변경 필요
      if (response.data.status === 'success' && response.data.code === 200) {
        alert('회원 정보가 성공적으로 업데이트되었습니다!');
        setOriginalEmail(email); // 이메일 변경이 성공하면 originalEmail 업데이트
        setPassword(''); // 비밀번호 초기화
        setConfirmPassword(''); // 비밀번호 확인 초기화
        // navigate('/mypage'); // 필요하다면 페이지 리로드 또는 이동
      } else {
        alert('회원 정보 업데이트에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
        console.error('마이페이지: 회원 정보 업데이트 실패 응답:', response.data);
      }
    } catch (error) {
      console.error('마이페이지: 프로필 업데이트 실패:', error);
      if (error.response) {
        alert('회원 정보 업데이트 중 서버 오류가 발생했습니다: ' + (error.response.data.message || '알 수 없는 오류'));
        console.error('마이페이지: 서버 응답 오류:', error.response.data);
      } else if (error.request) {
        alert('회원 정보 업데이트 중 네트워크 오류가 발생했습니다. 서버 연결을 확인해주세요.');
      } else {
        alert('회원 정보 업데이트 중 예상치 못한 오류가 발생했습니다.');
      }
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