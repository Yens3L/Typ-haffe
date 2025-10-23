import React from 'react';

interface HeaderProps {
  onRestart: () => void;
  onFullScreen: () => void;
  onAbout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRestart, onFullScreen, onAbout }) => {
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
          onClick={onAbout}
          aria-label="About this application"
          className="hover:text-cyan-300 transition-colors duration-200"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
        <button
          onClick={onRestart}
          aria-label="Test neustarten"
          className="hover:text-cyan-300 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0L2.985 9.348a8.25 8.25 0 0111.664 0l3.181 3.183" />
          </svg>
        </button>
        <button
          onClick={onFullScreen}
          aria-label="Vollbild umschalten"
          className="hover:text-cyan-300 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;