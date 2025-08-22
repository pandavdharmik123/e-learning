import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logo({ logoSize = 8, isTitleVisible = true, isClickable = false }) {

  const navigate = useNavigate();

  const handleLogoClick = () => {
    console.log('isClickable==', isClickable);
    if(isClickable) {
      navigate('/');
    }
  }
  return (
    <div className="flex items-center space-x-2">
      <img src='logo.png' alt='logo' className={`w-${logoSize} h-${logoSize} text-white`} />
      {isTitleVisible && (
        <span
          className={`text-xl font-bold ${isClickable ? 'cursor-pointer' : ''}`}
          onClick={handleLogoClick}
        >
          <span>E</span>
          <span className='text-blue-700'>-Learning</span>
        </span>
      )}
    </div>
  )
}