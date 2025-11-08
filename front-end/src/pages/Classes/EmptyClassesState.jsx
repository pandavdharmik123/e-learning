import {
  BookOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';

const EmptyClassesState = ({ userRole }) => {
  return (
    <div className="empty-classes-container">
      <div className="icon-wrapper">
        <div className="main-icon-circle">
          <BookOutlined className="book-icon" />
        </div>

        <div className="floating-calendar">
          <CalendarOutlined className="calendar-icon" />
        </div>
      </div>

      <h2 className="empty-title">
        {userRole === 'teacher' ? 'No Classes Created Yet' : 'No Classes Scheduled'}
      </h2>

      <p className="empty-description">
        {userRole === 'teacher'
          ? "Get started by creating your first class. Schedule sessions, add students, and manage your teaching schedule all in one place."
          : "You don't have any upcoming classes at the moment. Check back later or contact your teacher for more information."}
      </p>
      <div className="decorative-blob blob-1" />
      <div className="decorative-blob blob-2" />
    </div>
  );
};

export default EmptyClassesState;