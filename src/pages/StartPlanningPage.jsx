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
import moment from 'moment'; // moment.js 임포트 (Calendar 컴포넌트와 동일하게)
import CustomAlert from "../components/CustomAlert";


// Leaflet 관련 임포트 (기존과 동일)
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 마커 아이콘 설정 (기존과 동일)
import L from 'leaflet';
import customMarkerIconUrl from '../assets/logo_2.png'; 

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


// 지도 클릭 이벤트 핸들러 컴포넌트 (기존과 동일)
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

    const token = localStorage.getItem('userToken');
    // 'guest-planning-key-12345'는 실제 로그인으로 간주하지 않음
    if (token && token !== 'guest-planning-key-12345') {
      setIsLoggedInUser(true);
    } else {
      setIsLoggedInUser(false);
    }
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

  // 로그인/로그아웃 버튼 클릭 핸들러 추가
  const handleAuthClick = () => {
    if (isLoggedInUser) {
      localStorage.removeItem('userToken');
      setIsLoggedInUser(false);
      alert('로그아웃 되었습니다.');
      navigate('/');
    } else {
      navigate('/login'); 
    }
  };

  // ★★★ StartPlanningPage 캘린더에서 날짜 클릭 시 호출될 함수 ★★★
  const handleCalendarDateSelect = (dateString) => {
    const clickedDate = moment(dateString).toDate(); // 문자열 날짜를 Date 객체로 변환

    // 만약 시작일이 아직 선택되지 않았거나, 클릭된 날짜가 현재 시작일보다 이전인 경우
    // 또는 시작일과 종료일이 모두 선택된 상태에서 새로운 날짜를 클릭하는 경우 (새로운 선택 시작)
    if (!startDate || clickedDate < startDate || (startDate && endDate)) {
        setStartDate(clickedDate);
        setEndDate(clickedDate); // 시작일과 종료일을 동일하게 설정
    } else if (clickedDate >= startDate && clickedDate > endDate) {
        // 클릭된 날짜가 시작일 이후이고 종료일보다 큰 경우, 종료일을 업데이트
        setEndDate(clickedDate);
    } else if (clickedDate >= startDate && clickedDate < endDate) {
        // 클릭된 날짜가 시작일과 종료일 사이에 있지만 종료일보다 작은 경우,
        // 시작일을 클릭된 날짜로 변경하고 종료일은 그대로 두거나 다시 시작일로 설정 (기획에 따라 다름)
        // 여기서는 다시 시작일로 설정하여 새로운 선택 범위 시작
        setStartDate(clickedDate);
        setEndDate(clickedDate);
    }

    // 날짜 선택 후 모달 닫기 (선택 방식에 따라 즉시 닫거나 '선택 완료' 버튼 추가)
    // 여기서는 일단 선택 즉시 닫음
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

      {/* ★★★ FullCalendar 모달 내 Calendar 컴포넌트 수정 ★★★ */}
      {showFullCalendarModal && (
        <div className="full-calendar-modal-overlay">
          <div className="full-calendar-modal-content">
            <button className="full-calendar-modal-close-btn" onClick={() => setShowFullCalendarModal(false)}>X</button>
            <h2 className="full-calendar-modal-title">날짜 선택</h2> {/* "전체 달력 보기" 대신 "날짜 선택"으로 변경 */}
            <div className="full-calendar-display-wrapper">
              {/* Calendar 컴포넌트의 onDateClick 프롭스를 handleCalendarDateSelect 함수와 연결 */}
              {/* editable, selectable, events 프롭스는 Calendar 컴포넌트 내부에서만 사용될 수 있거나, */}
              {/* 이 Calendar 컴포넌트가 FullCalendar 라이브러리가 아닌 직접 구현한 컴포넌트이므로 */}
              {/* 기존 Calendar 컴포넌트가 받는 프롭스에 맞춰 수정해야 합니다. */}
              {/* 현재 Calendar.js는 onDateClick만 받으므로 다른 프롭스는 제거하거나 해당 컴포넌트가 처리하도록 변경해야 합니다. */}
              <Calendar onDateClick={handleCalendarDateSelect} />
            </div>
            {/* 날짜 선택을 위한 추가 안내 문구 */}
          </div>
        </div>
      )}
    </div>
  );
};

export default StartPlanningPage;