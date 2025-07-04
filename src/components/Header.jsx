const Header = () => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#ddd',
      padding: '10px 20px'
    }}>
      <div><strong>캘린더</strong></div>
      <div style={{ fontSize: '14px' }}>로그인 / 회원가입</div>
    </header>
  );
};

export default Header;
