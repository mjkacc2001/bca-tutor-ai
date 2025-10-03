
import React, { useState } from 'react';
import { User } from '../types.ts';

interface ApiKeyPromptProps {
  user: User;
  onApiKeySubmit: (apiKey: string) => void;
  onLogout: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ user, onApiKeySubmit, onLogout }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      onApiKeySubmit(apiKeyInput.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-6">
            <img src={user.picture} alt={user.name} className="h-16 w-16 rounded-full mx-auto mb-4" referrerPolicy="no-referrer" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Welcome, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">One last step to get started.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Enter your Google Gemini API Key
              </label>
              <input
                id="api-key-input"
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Your Gemini API Key"
                className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
               <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 block">
                Get your API Key from Google AI Studio
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:bg-slate-400 disabled:dark:bg-slate-600"
              disabled={!apiKeyInput.trim()}
            >
              Save & Continue
            </button>
          </form>
          
          <div className="text-center mt-6">
            <button
              onClick={onLogout}
              className="text-xs text-slate-500 dark:text-slate-400 hover:underline"
            >
              Not {user.name}? Log out.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;