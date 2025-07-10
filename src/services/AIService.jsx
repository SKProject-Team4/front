// 장소 추출 함수
const extractPlaces = (text) => {
  // 실제 AI 응답의 패턴에 따라 정규식을 더 정교하게 만들 수 있습니다.
  const regex = /어린이대공원|뚝섬한강공원|서울숲|세종대학교 벚꽃길|건대입구 커먼그라운드/g;
  return text.match(regex) || [];
};

// 임시 AI 응답 생성 함수 (실제 API 호출로 대체될 부분)
const getRouteFromAI = async (selectedPlaces) => {
  const list = selectedPlaces.join(" → ");
  // ✨ 실제 백엔드 API를 호출하여 AI 응답을 받아오도록 여기에 로직을 추가해야 합니다.
  // 예: axios.post('/api/get-route', { places: selectedPlaces });
  return `✨ 선택하신 장소를 기반으로 추천 코스를 알려드릴게요!\n\n${list} 도보 코스는 하루 일정으로 적당해요! 중간중간 휴식 장소도 추천드려요 ☕`;
};

// 초기 AI 응답 생성 함수
const getInitialAIResponse = (question) => {
  return `안녕하세요!\n${question}\n기준으로 여행 일정을 추천해드릴게요 🌿\n\n1일차: 어린이대공원, 뚝섬한강공원\n2일차: 서울숲, 세종대학교 벚꽃길, 건대입구 커먼그라운드\n\n즐거운 여행 되세요! ✈️🧳`;
};

const AIService = {
  extractPlaces,
  getRouteFromAI,
  getInitialAIResponse,
  // 여기에 AI 챗봇과 관련된 다른 서비스 함수들을 추가할 수 있습니다.
  // 예: sendChatMessage: async (message) => { /* ... */ }
};

export default AIService;