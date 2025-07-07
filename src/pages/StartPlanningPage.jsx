import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionModal from '../components/RegionModal';
import calendarIcon from '../assets/calendar.png'; // 🗓 캘린더 이미지

const StartPlanning = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [people, setPeople] = useState('');
  const [transport, setTransport] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showRegionModal, setShowRegionModal] = useState(false);

  const keywordOptions = ['데이트', '가족여행', '친구들과', '혼자여행'];

  const toggleKeyword = (word) => {
    setKeywords(prev =>
      prev.includes(word) ? prev.filter(k => k !== word) : [...prev, word]
    );
  };

  const handleSearch = () => {
    alert(`🗺 검색 조건
지역: ${selectedRegion}
교통: ${transport}
날짜: ${startDate.toDateString()} ~ ${endDate.toDateString()}
인원: ${people}명
키워드: ${keywords.join(', ')}`);
  };

  return (
    <div style={{ backgroundColor: '#D4F6FF', minHeight: '100vh' }}>
      
      {/* 🗓 상단 캘린더 아이콘 배너 */}
      <div style={{
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 30px',
        borderBottom: '1px solid #ccc',
        backgroundColor: 'rgba(255,255,255,0.9)'
      }}>
        <img
          src={calendarIcon}
          alt="캘린더 아이콘"
          style={{ width: '40px', height: '40px' }}
        />
      </div>

      {/* 본문 */}
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>여행 계획 세우기</h2>

        {/* 지역 선택 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          margin: '0 auto 30px',
          maxWidth: '500px',
          borderRadius: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <h3>지역 선택</h3>
          <button onClick={() => setShowRegionModal(true)} style={{ padding: '10px 20px' }}>
            {selectedRegion ? selectedRegion : '지역 선택하기'}
          </button>
          <br/>
          <h3>부가 선택</h3>

          {/* 교통수단 */}
          <div style={{ marginBottom: '15px' }}>
            <label>교통수단: </label>
            <select value={transport} onChange={(e) => setTransport(e.target.value)}>
              <option value="">선택</option>
              <option value="자동차">자동차</option>
              <option value="기차">기차</option>
              <option value="비행기">비행기</option>
            </select>
          </div>

          {/* 날짜 선택 */}
          <div style={{ marginBottom: '15px' }}>
            <label>날짜: </label><br />
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

          {/* 키워드 선택 */}
          <div style={{ marginBottom: '15px' }}>
            <label>키워드:</label><br />
            {keywordOptions.map((word) => (
              <button
                key={word}
                onClick={() => toggleKeyword(word)}
                style={{
                  margin: '5px',
                  padding: '5px 10px',
                  backgroundColor: keywords.includes(word) ? '#aef' : '#eee',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {word}
              </button>
            ))}
          </div>

          {/* 인원 */}
          <div style={{ marginBottom: '15px' }}>
            <label>인원: </label>
            <input
              type="number"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              placeholder="명"
              style={{ width: '60px', padding: '5px' }}
            />
          </div>
        </div>

        {/* 검색 버튼 */}
        <button
          onClick={handleSearch}
          style={{
            marginTop: '30px',
            padding: '12px 32px',
            fontSize: '16px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#00bcd4',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          🔍 검색
        </button>
      </div>

      {/* 지역 선택 모달 */}
      {showRegionModal && (
        <RegionModal
          onClose={() => setShowRegionModal(false)}
          onSelect={(region) => setSelectedRegion(region)}
        />
      )}
    </div>
  );
};

export default StartPlanning;
