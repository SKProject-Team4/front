import './CustomAlert.css';

const CustomAlert = ({ message, onClose }) => {
  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert-box">
        <p className="alert-message">{message}</p>
        <div className="alert-button-wrapper">
          <button onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
