
import React from 'react';
import { User } from '../types.ts';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onProfileClick: () => void;
  onClearChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onProfileClick, onClearChat }) => {
  return (
    <header className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Graduation Cap">🎓</span>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              BCA Tutor AI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onProfileClick}
              className="flex items-center space-x-2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              aria-label="Open profile settings"
            >
              <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{user.name}</span>
            </button>
            <button
              onClick={onClearChat}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              aria-label="Clear chat history"
            >
              Clear Chat
            </button>
            <button
              onClick={onLogout}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;