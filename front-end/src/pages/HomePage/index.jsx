import  { useState } from 'react';
import { Award, BookOpen, Calendar, CheckCircle, Globe, Play, Star, Users } from 'lucide-react';
import FooterSection from '@components/FooterSection/index.jsx';
import { features, stats, testimonials } from '@utils/homePageUtils.jsx';

export default function HomePage() {

  const [activeTab, setActiveTab] = useState('student');

  return (
    <>
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
              Getting <span className="text-purple-600">Quality</span><br />
              Education is easy<br />
              with <span className="text-purple-600">E-Learning</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Provides you with the latest online learning system and material that help your knowledge growing
            </p>
            <div className="flex space-x-4">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Get Started</span>
              </button>
              <button className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative bg-gradient-to-r from-purple-400 to-blue-400 rounded-full w-80 h-80 mx-auto flex items-center justify-center">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <img
                  src="girl-photo.png"
                  alt="Student"
                  className="w-53 h-52 object-cover rounded-full"
                />
              </div>
              {/*<div className="absolute top-8 right-8 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-60 animate-pulse"></div>

              <div className="absolute top-12 left-8 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-70 animate-ping"></div>
*/}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-400 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-600 rounded-full opacity-70 animate-pulse" ></div>
              <div className="absolute top-1/2 -left-8 w-8 h-8 bg-purple-600 rounded-full opacity-70 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make our e-learning platform stand out from the rest
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col justify-center items-center text-center bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Three Powerful Modules</h2>
            <p className="text-xl text-gray-600">Choose your role and start your learning journey</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setActiveTab('student')}
                className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'student' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Student
              </button>
              <button
                onClick={() => setActiveTab('teacher')}
                className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'teacher' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Teacher
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'admin' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {activeTab === 'student' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Student Portal</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Browse and hire qualified teachers</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Access books and study materials</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Join scheduled classes via calendar</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Track learning progress dashboard</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'teacher' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Teacher Portal</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Set hourly, lecture, or monthly rates</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Upload and manage books & materials</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Create Zoom classes and notifications</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Manage student connections</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Admin Panel</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Manage all teachers and students</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Control access permissions</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Verify user details and credentials</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Monitor platform activity</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center">
                    <Globe className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real feedback from our community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </>
  )
}