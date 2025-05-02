import { AlignJustify, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Toggle Button */}

      <button
        className={`fixed top-4 z-50 p-2 bg-gray-800 text-white rounded-md hover:scale-110 transition-transform ${
          isOpen ? 'left-64' : 'left-4'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <AlignJustify className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black/60 backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mt-12 ml-4">
          <h1 className="text-3xl font-bold text-white mb-8">SurSangrah</h1>
          <nav className="flex flex-col gap-4 text-white">
            <Link to="/riyaz" className="hover:text-purple-400 hover:scale-105 transition-transform">
              Riyaz
            </Link>
            <Link to="/surcheck" className="hover:text-purple-400 hover:scale-105 transition-transform">
              SurCheck
            </Link>
            <Link to="/chordhub" className="hover:text-purple-400 hover:scale-105 transition-transform">
              ChordHub
            </Link>
            <Link to="/sursaathi" className="hover:text-purple-400 hover:scale-105 transition-transform">
              SurSaathi
            </Link>
            <Link to="/beatloopr" className="hover:text-purple-400 hover:scale-105 transition-transform">
              BeatLoopr
            </Link>
          </nav>
        </div>

        <div className="ml-4">
          <button className="text-white hover:scale-125 transition-transform">
            <User />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;