import React from 'react';

interface HeaderProps {
  onRestart: () => void;
  onFullScreen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRestart, onFullScreen }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-slate-500 z-20">
      <div className="text-lg hidden sm:block">
        Typ-Affe: German Typing Test
      </div>
       <div className="text-lg block sm:hidden">
        Typ-Affe
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={onRestart}
          aria-label="Test neustarten"
          className="hover:text-cyan-300 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 003.5 13.5"/>
          </svg>
        </button>
        <button
          onClick={onFullScreen}
          aria-label="Vollbild umschalten"
          className="hover:text-cyan-300 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
