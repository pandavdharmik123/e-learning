import { BookOpen, Facebook, Instagram, Twitter, Linkedin, Image } from 'lucide-react';
import Logo from '@components/Logo/index.jsx';

export default function FooterSection() {
  return (
    <footer className="bg-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-600 mb-4">
              About E-Learning
            </p>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-red-600 flex items-center justify-center rounded-full">
                <Instagram size={20}/>
              </div>

              <div className="w-8 h-8 bg-gray-200 text-blue-500 flex items-center justify-center rounded-full">
                <Facebook size={20}/>
              </div>
              <div className="w-8 h-8 bg-gray-200 text-blue-700 flex items-center justify-center rounded-full">
                <Linkedin size={20}/>
              </div>
              <div className="w-8 h-8 bg-gray-200 text-blue-400 flex items-center justify-center rounded-full">
                <Twitter size={20} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-purple-600">Home</a></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600">Sign up</a></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600">Sign in</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Contact Us</h4>
            <div className="space-y-2">
              <p className="text-gray-600">Email: admin@elearning.com</p>
              <p className="text-gray-600">Phone: +91-12345-67890</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Message</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter your message here"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
                Send Message
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">Copyright of E-Learning 2023. All rights are reserved</p>
        </div>
      </div>
    </footer>
  )
}