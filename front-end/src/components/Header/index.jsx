import { BookOpen } from 'lucide-react';
import React from 'react';
import Logo from '@components/Logo/index.jsx';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      <Logo isClickable={true}/>
      {/*<nav className="hidden md:flex space-x-8">*/}
      {/*  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Home</a>*/}
      {/*  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Courses</a>*/}
      {/*  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Teachers</a>*/}
      {/*  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">About</a>*/}
      {/*  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</a>*/}
      {/*</nav>*/}
      <div className="flex space-x-3">
        <button
          className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          onClick={() => navigate('/login')}
        >
          Sign In
        </button>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
          Sign Up
        </button>
      </div>
    </header>
  )
}