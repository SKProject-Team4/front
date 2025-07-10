import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionModal from '../components/RegionModal';
import calendarIcon from '../assets/calendar.png';
import Logo from "../components/Logo";
import Calendar from '../components/Calendar';
import './StartPlanningPage.css';
import { MapPin } from 'lucide-react';
import moment from 'moment'; // moment.js 임포트 (Calendar 컴포넌트와 동일하게)
import CustomAlert from "../components/CustomAlert";


// Leaflet 관련 임포트 (기존과 동일)
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 마커 아이콘 설정 (기존과 동일)
import L from 'leaflet';
import customMarkerIconUrl from '../assets/logo_2.png';

// 서비스 파일 임포트
import AuthService from '../services/AuthService'; // AuthService 임포트 (로그인 상태 확인용)
import PlanningService from '../services/PlanningService'; // PlanningService 임포트 (지역, 키워드 관련)

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

L.Marker.prototype.options.icon = CustomMarkerIcon;


// 지도 클릭 이벤트 핸들러 컴포넌트
const MapClickHandler = ({ onSelectRegion, onCloseMap }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);

      const result = await PlanningService.getRegionFromCoordinates(lat, lng);
      if (result.success) {
        onSelectRegion(result.address);
        onCloseMap();
      } else {
        alert(result.message);
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
  const [isLoggedInUser, setIsLoggedInUser] = useState(false); // 실제 사용자 로그인 여부
  const [isGuestUser, setIsGuestUser] = useState(false); // 게스트 로그인 여부

  // 렌더링에 사용될 키워드 옵션을 관리하는 상태 추가
  const [keywordOptions, setKeywordOptions] = useState([]);

  // 컴포넌트 마운트 시 키워드 섞기 및 로그인 상태 확인
  useEffect(() => {
    setKeywordOptions(PlanningService.getRandomKeywords()); // 서비스에서 키워드 가져오기

    const checkLoginStatus = async () => {
      const result = await AuthService.checkLoginStatus();
      setIsLoggedInUser(result.isLoggedIn);
      setIsGuestUser(result.isGuest);
    };
    checkLoginStatus();
  }, []);

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

  // 로그인/로그아웃 버튼 클릭 핸들러
  const handleAuthClick = async () => {
    const result = await AuthService.logout(); // AuthService의 logout 함수 사용
    if (result.success) {
      setIsLoggedInUser(false);
      setIsGuestUser(false); // 게스트 상태도 초기화
      alert(result.message);
      navigate('/');
    } else {
      alert(result.message);
    }
  };

  // StartPlanningPage 캘린더에서 날짜 클릭 시 호출될 함수
  const handleCalendarDateSelect = (dateString) => {
    const clickedDate = moment(dateString).toDate(); // 문자열 날짜를 Date 객체로 변환

    if (!startDate || clickedDate < startDate || (startDate && endDate)) {
        setStartDate(clickedDate);
        setEndDate(clickedDate); // 시작일과 종료일을 동일하게 설정
    } else if (clickedDate >= startDate && clickedDate > endDate) {
        setEndDate(clickedDate);
    } else if (clickedDate >= startDate && clickedDate < endDate) {
        setStartDate(clickedDate);
        setEndDate(clickedDate);
    }

    setShowFullCalendarModal(false);
  };


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
          {isLoggedInUser || isGuestUser ? '로그아웃' : '로그인'} {/* 실제 로그인 또는 게스트인 경우 로그아웃 버튼 표시 */}
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

        <button className="shuffle-button" onClick={() => setKeywordOptions(PlanningService.getRandomKeywords())}>
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
            <h2 className="full-calendar-modal-title">날짜 선택</h2>
            <div className="full-calendar-display-wrapper">
              <Calendar onDateSelect={(dateRange) => { // Calendar 컴포넌트가 { start, end } 객체를 반환하도록 수정 가정
                  setStartDate(dateRange.start);
                  setEndDate(dateRange.end);
                  setShowFullCalendarModal(false);
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartPlanningPage;