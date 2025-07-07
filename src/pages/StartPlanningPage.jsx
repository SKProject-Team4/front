import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionModal from '../components/RegionModal';
import calendarIcon from '../assets/calendar.png';
import Logo from "../components/Logo";
import './StartPlanningPage.css';

const StartPlanningPage = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [people, setPeople] = useState('');
  const [transport, setTransport] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showRegionModal, setShowRegionModal] = useState(false);

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

  return (
    <div className="planning-wrapper">
      {/* 상단바 */}
      <div className="planning-header">
        <img src={calendarIcon} alt="캘린더" className="calendar-icon" />
        <Logo />
        <button
            className="login-button"
            onClick={() => navigate('/login')}
        >
            로그인
        </button>
      </div>

      {/* 입력폼 */}
      <div className="form-container">
        <label>지역</label>
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

      {/* 지역 모달 */}
      {showRegionModal && (
        <RegionModal
          onClose={() => setShowRegionModal(false)}
          onSelect={(region) => setSelectedRegion(region)}
        />
      )}
    </div>
  );
};

export default StartPlanningPage;
