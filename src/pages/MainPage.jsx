const MainPage = () => {
  return (
    <div style={{ backgroundColor: '#ccf', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
      <h1>AI 여행추천</h1>

      <div style={{
        backgroundColor: '#ddd',
        margin: '20px auto',
        padding: '20px',
        width: '80%',
        maxWidth: '500px',
        borderRadius: '8px'
      }}>
        <p>메인 페이지 설명 문구</p>
        <div style={{ marginTop: '20px' }}>
          <span>🖼 그림 들어갈 자리</span>
        </div>
      </div>

      <button style={{
        backgroundColor: 'white',
        padding: '10px 20px',
        borderRadius: '10px',
        border: '1px solid #ccc',
        fontSize: '16px',
        cursor: 'pointer'
      }}>
        여행 계획 세우기
      </button>
    </div>
  );
};

export default MainPage;
