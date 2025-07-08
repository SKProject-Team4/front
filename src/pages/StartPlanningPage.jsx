import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionModal from '../components/RegionModal'; // RegionModal 임포트 유지
import calendarIcon from '../assets/calendar.png';
import Logo from "../components/Logo";
import './StartPlanningPage.css';
import { MapPin } from 'lucide-react'; // 지도 마킹 아이콘 임포트

// Leaflet 관련 임포트
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet 기본 CSS 임포트

// Leaflet 마커 아이콘 설정 (기본 아이콘이 깨지는 문제 해결)
import L from 'leaflet';
// 사용자 정의 마커 이미지 임포트 (예시: src/assets/myCustomMarker.png)
// 실제 사용하실 이미지 경로로 변경해주세요.
import customMarkerIconUrl from '../assets/logo_2.png'; 

// FullCalendar 관련 임포트
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // 월별 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid'; // 주/일별 보기 플러그인
import interactionPlugin from '@fullcalendar/interaction'; // 날짜 클릭, 드래그 등 상호작용 플러그인


// 사용자 정의 마커 아이콘 정의
const CustomMarkerIcon = L.icon({
  iconUrl: customMarkerIconUrl, // 사용자 정의 이미지 경로
  iconRetinaUrl: customMarkerIconUrl, // 고해상도 디스플레이용 (동일 이미지 사용)
  iconSize: [32, 32], // 아이콘 크기 (가로, 세로) - 이미지 크기에 맞게 조절
  iconAnchor: [16, 32], // 아이콘의 어떤 부분이 마커 위치에 고정될지 (보통 이미지의 중앙 하단)
  popupAnchor: [0, -32], // 팝업이 열릴 위치 (아이콘 앵커 기준)
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', // 그림자 이미지 (선택 사항)
  shadowSize: [32, 32], // 그림자 크기
  shadowAnchor: [16, 32] // 그림자 앵커
});

// Leaflet의 모든 마커가 이 사용자 정의 아이콘을 기본으로 사용하도록 설정
L.Marker.prototype.options.icon = CustomMarkerIcon;


// 지도 클릭 이벤트 핸들러 컴포넌트
const MapClickHandler = ({ onSelectRegion, onCloseMap }) => {
  const [markerPosition, setMarkerPosition] = useState(null); // 클릭한 위치에 마커 표시
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]); // 클릭한 위치에 마커 설정

      // Nominatim 역지오코딩 API 호출
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      try {
        const response = await fetch(nominatimUrl);
        const data = await response.json();

        let address = "주소를 찾을 수 없습니다.";
        if (data && data.address) {
          // 한국 주소 체계에 맞춰 적절히 조합 (Nominatim 응답 구조에 따라 다를 수 있음)
          const addr = data.address;
          address = [
            addr.country,
            addr.province,
            addr.city || addr.town || addr.village,
            addr.road,
            addr.house_number
          ].filter(Boolean).join(' ').trim(); // null 또는 undefined 값 필터링
          
          if (!address) { // 더 일반적인 이름이 있다면 사용
            address = data.display_name;
          }
        }
        
        onSelectRegion(address); // 선택된 지역 상태 업데이트
        onCloseMap(); // 지도 모달 닫기
      } catch (error) {
        console.error("역지오코딩 오류:", error);
        alert("주소를 가져오는 데 실패했습니다. 다시 시도해주세요.");
        onCloseMap(); // 오류 발생 시에도 지도 닫기
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
  const [showMap, setShowMap] = useState(false); // 지도 모달 표시 상태
  const [showRegionModal, setShowRegionModal] = useState(false); // RegionModal 표시 상태 다시 활성화
  const [showFullCalendarModal, setShowFullCalendarModal] = useState(false); // FullCalendar 모달 표시 상태 추가

  const keywordOptions = [
    '혼자 떠나는 여행',
    '바닷가 감성 여행',
    '익사이팅한 액티비티 여행',
    '감성 카페 투어',
    '차박 캠핑 여행',
    '인생샷 명소 여행',
    '로컬 맛집 탐방',
    '계절 따라 떠나는 여행',
    '힐링이 필요한 여행'
  ];

  const toggleKeyword = (word) => {
    setKeywords(prev =>
      prev.includes(word) ? prev.filter(k => k !== word) : [...prev, word]
    );
  };

  const handleSearch = () => {
    const question = `지역: ${selectedRegion}\n교통: ${transport}\n날짜: ${startDate.toDateString()} ~ ${endDate.toDateString()}\n인원: ${people}명\n키워드: ${keywords.join(', ')}`;
    navigate('/ai-chat', {
      state: { question }
    });
  };

  // FullCalendar에 표시할 이벤트 (예시)
  const calendarEvents = [
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
        {/* 로그인 버튼 */}
        <button
            className="login-button"
            onClick={() => navigate('/login')}
        >
            로그인
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
        {/* 지역 선택 버튼 클릭 시 RegionModal 열기 (원래대로) */}
        <button onClick={() => setShowRegionModal(true)} className="input-btn">
          {selectedRegion || '지역 선택하기'}
        </button>

        <label>일자</label>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
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
            minDate={startDate}
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

        <label>인원</label>
        <input
          type="number"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          className="input-field"
          placeholder="2명"
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
          {keywordOptions.map((word) => (
            <button
              key={word}
              onClick={() => toggleKeyword(word)}
              className={`keyword-btn ${keywords.includes(word) ? 'selected' : ''}`}
            >
              {word}
            </button>
          ))}
        </div>

        <button onClick={handleSearch} className="search-button">🔍검색</button>
      </div>

      {/* 지도 모달 */}
      {showMap && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <button className="map-modal-close-btn" onClick={() => setShowMap(false)}>X</button>
            <MapContainer center={[37.5665, 126.9780]} zoom={13} scrollWheelZoom={true} className="leaflet-map-container">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onSelectRegion={setSelectedRegion} onCloseMap={() => setShowMap(false)} />
            </MapContainer>
            <p className="map-instruction">지도에서 원하는 위치를 클릭하여 지역을 선택하세요.</p>
          </div>
        </div>
      )}

      {/* 지역 선택 모달 (RegionModal) */}
      {showRegionModal && (
        <RegionModal
          onClose={() => setShowRegionModal(false)}
          onSelect={(region) => {
            setSelectedRegion(region);
            setShowRegionModal(false); // 선택 후 모달 닫기
          }}
        />
      )}

      {/* FullCalendar 모달 */}
      {showFullCalendarModal && (
        <div className="full-calendar-modal-overlay">
          <div className="full-calendar-modal-content">
            <button className="full-calendar-modal-close-btn" onClick={() => setShowFullCalendarModal(false)}>X</button>
            <h2 className="full-calendar-modal-title">전체 달력 보기</h2>
            <div className="full-calendar-display-wrapper">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth'
                }}
                events={calendarEvents} // 위에 정의한 이벤트 사용
                editable={false} // 이 달력은 보기 전용이므로 편집 비활성화
                selectable={true}
                locale="ko"
                height="auto"
                // 날짜 클릭 이벤트는 여기서는 주소 선택처럼 동작하지 않으므로, 정보 제공용으로만 사용
                dateClick={(info) => {
                  alert('클릭한 날짜: ' + info.dateStr);
                }}
              />
            </div>
            <p className="full-calendar-instruction">현재 선택된 여행 날짜를 포함한 전체 달력을 확인하세요.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartPlanningPage;
