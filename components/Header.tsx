import React from 'react';

interface HeaderProps {
  onRestart: () => void;
  onFullScreen: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRestart, onFullScreen, isSoundEnabled, onToggleSound }) => {
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
          onClick={onToggleSound}
          aria-label="Soundeffekte umschalten"
          className="hover:text-cyan-300 transition-colors duration-200"
        >
          {isSoundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5 5 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          )}
        </button>
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