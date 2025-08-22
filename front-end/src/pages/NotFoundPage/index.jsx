import Logo from '@components/Logo/index.jsx';
import '@styles/404NotFound.scss';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      <div className="main-inner">
        <div className="illustration">
          <div className="digit">4</div>
          <div className="logo-circle">
            <Logo logoSize={12} isTitleVisible={false} className="logo" isClickable={true}/>
          </div>
          <div className="digit">4</div>

          <div className="decorative-bounce"></div>
          <div className="decorative-pulse"></div>
          <div className="decorative-ping"></div>
        </div>

        <div className="message">
          <h1>Oops! Page Not Found</h1>
          <p>The page you're looking for seems to have gone on a learning adventure. Let's get you back to discovering quality education!</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>

      </div>
    </div>
  )
}