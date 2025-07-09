// src/components/Calendar.jsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  return (
    <div className="full-calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth',
        }}
        editable={true}
        selectable={true}
        locale="ko"
        height="auto"
        dateClick={(info) => {
          alert('날짜 클릭: ' + info.dateStr);
        }}
        eventClick={(info) => {
          alert('이벤트 클릭: ' + info.event.title);
        }}
        eventDrop={(info) => {
          console.log('이벤트 이동:', info.event.title, info.event.startStr);
        }}
      />
    </div>
  );
};

export default Calendar;