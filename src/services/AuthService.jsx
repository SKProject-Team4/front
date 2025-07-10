import axios from 'axios';

// 🚨 백엔드 API의 기본 URL을 여기에 설정해주세요!
const API_BASE_URL = 'http://localhost:8080';

// 임시 로그인 토큰 (개발용)
const TEMP_LOGIN_TOKEN = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';
// 게스트 임시 키를 상수로 정의
const GUEST_PLANNING_KEY = 'guest-planning-key-12345'; // <-- 이 키를 사용합니다.

const AuthService = {
  // ... (기존 checkEmailDuplicate, login, register 함수는 그대로 유지) ...

  // 로그인 상태 확인
  checkLoginStatus: async () => {
    const token = localStorage.getItem('userToken');

    // 임시 로그인 토큰인 경우
    if (token && token === TEMP_LOGIN_TOKEN) {
      console.log('로그인 상태 확인: 임시 토큰으로 로그인됨 (개발용)');
      return { isLoggedIn: true, isGuest: false, message: '임시 토큰' };
    }

    // 게스트 키인 경우
    if (token && token === GUEST_PLANNING_KEY) { // <-- GUEST_PLANNING_KEY 사용
      console.log('로그인 상태 확인: 게스트 모드');
      return { isLoggedIn: false, isGuest: true, message: '게스트 모드' };
    }

    // 실제 JWT 토큰이 있는 경우
    if (token) {
      try {
        console.log('로그인 상태 확인 API 호출 시도:', `${API_BASE_URL}/users/logincheck`);
        const response = await axios.get(`${API_BASE_URL}/users/logincheck`, {
          headers: {
            'Authorization': `Bearer ${token}`, // JWT 토큰 포함
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 'users' && response.data.code === 200 && response.data.login === true) {
          console.log('로그인 상태 확인: 사용자 로그인됨 (실제 토큰)');
          return { isLoggedIn: true, isGuest: false, message: '로그인됨' };
        } else {
          console.log('로그인 상태 확인: 유효하지 않은 토큰 응답');
          localStorage.removeItem('userToken'); // 유효하지 않은 토큰 제거
          return { isLoggedIn: false, isGuest: false, message: '유효하지 않은 토큰' };
        }
      } catch (error) {
        console.error('로그인 상태 확인 API 호출 오류 (AuthService):', error);
        localStorage.removeItem('userToken'); // 오류 발생 시 토큰 유효성 검사 실패로 간주하고 제거
        return { isLoggedIn: false, isGuest: false, message: 'API 호출 오류' };
      }
    }

    // 토큰이 없는 경우
    console.log('로그인 상태 확인: 토큰 없음');
    return { isLoggedIn: false, isGuest: false, message: '토큰 없음' };
  },

  // 로그아웃 요청
  logout: async () => {
    const token = localStorage.getItem('userToken');

    if (!token) {
      console.log('이미 로그아웃 상태');
      return { success: true, message: '이미 로그아웃 상태입니다.' };
    }

    // 임시 토큰 또는 게스트 키인 경우 실제 API 호출 없이 로컬 스토리지에서만 제거
    if (token === TEMP_LOGIN_TOKEN || token === GUEST_PLANNING_KEY) { // <-- GUEST_PLANNING_KEY 추가
      localStorage.removeItem('userToken');
      console.log('임시 토큰 또는 게스트 키 로그아웃 처리');
      return { success: true, message: '로그아웃 되었습니다.' };
    }

    try {
      console.log('로그아웃 API 호출 시도...');
      const response = await axios.get(`${API_BASE_URL}/logout`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200 && response.data.status === 'success') {
        localStorage.removeItem('userToken');
        return { success: true, message: '로그아웃 되었습니다.' };
      } else {
        console.error('로그아웃 API 실패 응답:', response.data);
        return { success: false, message: response.data.message || '로그아웃에 실패했습니다. 다시 시도해주세요.' };
      }
    } catch (error) {
      console.error('로그아웃 API 호출 오류 (AuthService):', error, error.response);
      localStorage.removeItem('userToken');
      return { success: false, message: '로그아웃 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.' };
    }
  },

  // 게스트 임시 키 발급 함수 추가
  issueGuestKey: () => {
    localStorage.setItem('userToken', GUEST_PLANNING_KEY); // 게스트 키 저장
    console.log('게스트 임시 키 발급 완료:', GUEST_PLANNING_KEY);
    return GUEST_PLANNING_KEY;
  }
};

export default AuthService;