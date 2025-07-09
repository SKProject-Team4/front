import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionModal from '../components/RegionModal';
import calendarIcon from '../assets/calendar.png';
import Logo from "../components/Logo";
import Calendar from '../components/Calendar'; // ★★★ Calendar 컴포넌트 임포트 ★★★
import './StartPlanningPage.css';
import { MapPin } from 'lucide-react';

// Leaflet 관련 임포트
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 마커 아이콘 설정
import L from 'leaflet';
import customMarkerIconUrl from '../assets/logo_2.png'; 



// 사용자 정의 마커 아이콘 정의 (변경 없음)
const CustomMarkerIcon = L.icon({
  iconUrl: customMarkerIconUrl,
  iconRetinaUrl: customMarkerIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [32, 32],
  shadowAnchor: [16, 32]
});

// Leaflet의 모든 마커가 이 사용자 정의 아이콘을 기본으로 사용하도록 설정 (변경 없음)
L.Marker.prototype.options.icon = CustomMarkerIcon;


// 지도 클릭 이벤트 핸들러 컴포넌트 (변경 없음)
const MapClickHandler = ({ onSelectRegion, onCloseMap }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      try {
        const response = await fetch(nominatimUrl);
        const data = await response.json();

        let address = "주소를 찾을 수 없습니다.";
        if (data && data.address) {
          const addr = data.address;
          address = [
            addr.country,
            addr.province,
            addr.city || addr.town || addr.village,
            addr.road,
            addr.house_number
          ].filter(Boolean).join(' ').trim();
          
          if (!address) {
            address = data.display_name;
          }
        }
        
        onSelectRegion(address);
        onCloseMap();
      } catch (error) {
        console.error("역지오코딩 오류:", error);
        alert("주소를 가져오는 데 실패했습니다. 다시 시도해주세요.");
        onCloseMap();
      }
    },
  });
  return markerPosition ? <Marker position={markerPosition} /> : null;
};


const StartPlanningPage = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [people, setPeople] = useState('');
  const [transport, setTransport] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showFullCalendarModal, setShowFullCalendarModal] = useState(false);

  // 로그인 상태 관리를 위한 state 추가 (실제 로그인 여부)
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  // 모든 키워드 옵션
  const allKeywordOptions = [
    '혼자 떠나는 여행',
    '바닷가 감성 여행',
    '익사이팅한 액티비티 여행',
    '감성 카페 투어',
    '차박 캠핑 여행',
    '인생샷 명소 여행',
    '로컬 맛집 탐방',
    '계절 따라 떠나는 여행',
    '힐링이 필요한 여행',
    '반려동물과 함께하는 여행',
    '역사 유적지 여행',
    '트렌디한 도심 여행',
    '문화 예술 감상 여행',
    '야경 명소 탐방',
  ];

  // 렌더링에 사용될 키워드 옵션을 관리하는 상태 추가
  const [keywordOptions, setKeywordOptions] = useState([]); 

  // 📍 랜덤 키워드 뽑기 함수
  const shuffleKeywords = () => {
    const shuffled = [...allKeywordOptions].sort(() => 0.5 - Math.random());
    setKeywordOptions(shuffled.slice(0, 8)); // 8개만 선택하여 표시
  };

  // 컴포넌트 마운트 시 키워드 섞기 및 로그인 상태 확인
  useEffect(() => {
    shuffleKeywords();

    // 페이지 로드 시 localStorage에 토큰이 있는지 확인하여 실제 로그인 상태 초기화
    const token = localStorage.getItem('userToken');
    // 'guest-planning-key-12345'는 실제 로그인으로 간주하지 않음
    if (token && token !== 'guest-planning-key-12345') {
      setIsLoggedInUser(true);
    } else {
      setIsLoggedInUser(false);
    }
  }, []); // 빈 배열을 넣어 한 번만 실행되도록 설정


  const toggleKeyword = (word) => {
    setKeywords(prev =>
      prev.includes(word) ? prev.filter(k => k !== word) : [...prev, word]
    );
  };

  const handleSearch = () => {
    const formatDate = (date) => {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    const question = `${formatDate(startDate)}부터 ${formatDate(endDate)}까지 ${people || '여러'}명이 ${selectedRegion || '어딘가'}로 ${transport || '알맞은 교통수단으로'} 여행을 가려고 해. ${keywords.length > 0 ? `${keywords.join(', ')} 같은 키워드에 맞는 장소` : '좋은 여행지'}를 추천해줄래?`;
    navigate('/ai-chat', {
      state: { question }
    });
  };

  // 로그인/로그아웃 버튼 클릭 핸들러 추가
  const handleAuthClick = () => {
    if (isLoggedInUser) { // 실제 로그인된 사용자일 경우에만 로그아웃 처리
      localStorage.removeItem('userToken'); // 토큰 삭제
      setIsLoggedInUser(false); // 로그인 상태 false로 변경
      alert('로그아웃 되었습니다.');
      navigate('/'); // 로그아웃 후 메인 페이지로 이동
    } else { // 로그인되지 않았거나 게스트 모드일 경우 로그인 페이지로 이동
      navigate('/login'); 
    }
  };

  // FullCalendar에 표시할 이벤트 (예시) - Calendar 컴포넌트로 props 전달
  const calendarEvents = [
    // { title: '여행 시작', start: startDate.toISOString().split('T')[0] },
    // { title: '여행 종료', end: endDate.toISOString().split('T')[0] }
  ];

  return (
    <div className="planning-wrapper">
      {/* 새로운 고정 상단바 컨테이너 */}
      <div className="fixed-app-header">
        {/* 캘린더 아이콘 */}
        <div className="calendar-icon-wrapper" onClick={() => setShowFullCalendarModal(true)}>
          <img src={calendarIcon} alt="캘린더" className="calendar-icon" />
        </div>
        {/* 로고 */}
        <Logo className="planning-logo" />
        {/* 로그인/로그아웃 버튼 */}
        <button
          className="login-button"
          onClick={handleAuthClick}
        >
          {isLoggedInUser ? '로그아웃' : '로그인'}
        </button>
      </div>

      {/* 입력폼 */}
      <div className="form-container">
        {/* '지역' 라벨과 지도 아이콘을 포함하는 div */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ marginBottom: '0' }}>지역</label>
            {/* 지도 아이콘 클릭 시 지도 모달 열기 */}
            <MapPin size={20} className="map-pin-icon" onClick={() => setShowMap(true)} style={{ cursor: 'pointer' }} />
        </div>
        {/* 지역 선택 버튼 클릭 시 RegionModal 열기 */}
        <button onClick={() => setShowRegionModal(true)} className="input-btn">
          {selectedRegion || '지역 선택하기'}
        </button>

        <label>일자</label>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              if (date > endDate) {
                setEndDate(date); // 시작일이 종료일보다 늦으면 종료일도 같이 변경
              }
            }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
          ~
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate} // 시작일 이후만 선택 가능
          />
        </div>

        <label>교통수단</label>
        <select value={transport} onChange={(e) => setTransport(e.target.value)} className="input-select">
          <option value="">선택</option>
          <option value="도보">도보</option>
          <option value="자동차">자동차</option>
          <option value="기차">기차</option>
          <option value="비행기">비행기</option>
        </select>

        {/* 인원 라벨 중복 제거, 하나만 남김 */}
        <label>인원</label>
        <input
          type="number"
          min="1"
          step="1"
          value={people}
          onChange={(e) => {
            const value = e.target.value;

            if (value === '') {
              setPeople('');
              return;
            }

            const parsed = parseInt(value, 10);
            if (!isNaN(parsed) && parsed >= 1) {
              setPeople(parsed.toString());
            }
          }}
          className="input-field"
          placeholder="1명"
        />

        <label>키워드</label>
        <div className="keyword-input">
          <input
            value={keywords.join(', ')}
            readOnly
            className="input-field"
            placeholder="선택한 키워드 표시"
          />
        </div>

        <div className="keyword-title">인기 키워드 ⭐</div>

        <div className="keyword-list">
          {keywordOptions.map((word) => ( // keywordOptions 상태 사용
            <button
              key={word}
              onClick={() => toggleKeyword(word)}
              className={`keyword-btn ${keywords.includes(word) ? 'selected' : ''}`}
            >
              {word}
            </button>
          ))}
        </div>

        <button className="shuffle-button" onClick={shuffleKeywords}>
          🔄 다른 키워드 보기
        </button>

        <button onClick={handleSearch} className="search-button">🔍검색</button>
      </div>

      {showMap && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <button className="map-modal-close-btn" onClick={() => setShowMap(false)}>X</button>
            <MapContainer center={[37.5665, 126.9780]} zoom={13} scrollWheelZoom={true} className="leaflet-map-container">
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler onSelectRegion={setSelectedRegion} onCloseMap={() => setShowMap(false)} />
            </MapContainer>
            <p className="map-instruction">지도에서 원하는 위치를 클릭하여 지역을 선택하세요.</p>
          </div>
        </div>
      )}

      {showRegionModal && (
        <RegionModal onClose={() => setShowRegionModal(false)} onSelect={(region) => {
          setSelectedRegion(region);
          setShowRegionModal(false);
        }} />
      )}

      {showFullCalendarModal && (
        <div className="full-calendar-modal-overlay">
          <div className="full-calendar-modal-content">
            <button className="full-calendar-modal-close-btn" onClick={() => setShowFullCalendarModal(false)}>X</button>
            <h2 className="full-calendar-modal-title">전체 달력 보기</h2>
            <div className="full-calendar-display-wrapper">
              <Calendar editable={false} selectable={true} events={[]} onDateClick={(info) => alert('클릭한 날짜: ' + info.dateStr)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartPlanningPage;