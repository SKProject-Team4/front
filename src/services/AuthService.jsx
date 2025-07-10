import axios from 'axios';

const API_BASE_URL = '/api';
const GUEST_PLANNING_KEY = 'guest-planning-key-12345';

const AuthService = {
  // ✅ 이메일 중복 체크 (💡 임시 토큰 자동 삽입 추가!)
  checkEmailDuplicate: async (email) => {
    try {
      // 💡 임시 토큰을 강제로 사용하거나 localStorage에서 가져오기
      const token = localStorage.getItem('userToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log('[checkEmailDuplicate] 호출됨');
      console.log('요청 이메일:', email);
      console.log('사용된 토큰:', token);
      console.log('요청 헤더:', headers);


      const response = await axios.get(`${API_BASE_URL}/users/check-email?email=${email}`, {
        headers,
      });

      return { success: true, message: '사용 가능한 이메일입니다.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '이메일 중복 확인 중 오류 발생',
      };
    }
  },

  // ✅ 회원가입
  register: async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, {
        name,
        email,
        password,
      });
      return { success: true, message: '회원가입 성공' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '회원가입 실패',
      };
    }
  },

  // ✅ 로그인
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });
      return { success: true, token: response.data.token };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '로그인 실패',
      };
    }
  },

  // ✅ 로그인 상태 확인
  checkLoginStatus: async () => {
    const token = localStorage.getItem('userToken');

    if (token && token === TEMP_LOGIN_TOKEN) {
      console.log('로그인 상태 확인: 임시 토큰으로 로그인됨 (개발용)');
      return { isLoggedIn: true, isGuest: false, message: '임시 토큰' };
    }

    if (token && token === GUEST_PLANNING_KEY) {
      console.log('로그인 상태 확인: 게스트 모드');
      return { isLoggedIn: false, isGuest: true, message: '게스트 모드' };
    }

    if (token) {
      try {
        console.log('로그인 상태 확인 API 호출 시도:', `${API_BASE_URL}/users/logincheck`);
        const response = await axios.get(`${API_BASE_URL}/users/logincheck`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.status === 'users' && response.data.code === 200 && response.data.login === true) {
          console.log('로그인 상태 확인: 사용자 로그인됨 (실제 토큰)');
          return { isLoggedIn: true, isGuest: false, message: '로그인됨' };
        } else {
          console.log('로그인 상태 확인: 유효하지 않은 토큰 응답');
          localStorage.removeItem('userToken');
          return { isLoggedIn: false, isGuest: false, message: '유효하지 않은 토큰' };
        }
      } catch (error) {
        console.error('로그인 상태 확인 API 호출 오류 (AuthService):', error);
        localStorage.removeItem('userToken');
        return { isLoggedIn: false, isGuest: false, message: 'API 호출 오류' };
      }
    }

    console.log('로그인 상태 확인: 토큰 없음');
    return { isLoggedIn: false, isGuest: false, message: '토큰 없음' };
  },

  // ✅ 로그아웃
  logout: async () => {
    const token = localStorage.getItem('userToken');

    if (!token) {
      console.log('이미 로그아웃 상태');
      return { success: true, message: '이미 로그아웃 상태입니다.' };
    }

    if (token === TEMP_LOGIN_TOKEN || token === GUEST_PLANNING_KEY) {
      localStorage.removeItem('userToken');
      console.log('임시 토큰 또는 게스트 키 로그아웃 처리');
      return { success: true, message: '로그아웃 되었습니다.' };
    }

    try {
      console.log('로그아웃 API 호출 시도...');
      const response = await axios.get(`${API_BASE_URL}/logout`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.status === 'success') {
        localStorage.removeItem('userToken');
        return { success: true, message: '로그아웃 되었습니다.' };
      } else {
        console.error('로그아웃 API 실패 응답:', response.data);
        return { success: false, message: response.data.message || '로그아웃에 실패했습니다.' };
      }
    } catch (error) {
      console.error('로그아웃 API 호출 오류 (AuthService):', error);
      localStorage.removeItem('userToken');
      return { success: false, message: '로그아웃 중 네트워크 오류 발생' };
    }
  },

  // ✅ 게스트 키 발급
  issueGuestKey: () => {
    localStorage.setItem('userToken', GUEST_PLANNING_KEY);
    console.log('게스트 임시 키 발급 완료:', GUEST_PLANNING_KEY);
    return GUEST_PLANNING_KEY;
  },
};

export default AuthService;
