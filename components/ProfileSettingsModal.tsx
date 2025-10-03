
import React, { useState } from 'react';
import { User } from '../types.ts';

interface ProfileSettingsModalProps {
    user: User;
    onClose: () => void;
    onApiKeySubmit: (apiKey: string) => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ user, onClose, onApiKeySubmit }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKeyInput.trim()) {
            onApiKeySubmit(apiKeyInput.trim());
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                     <h2 id="profile-modal-title" className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Profile Settings
                     </h2>
                     <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" aria-label="Close settings">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <img src={user.picture} alt={user.name} className="h-16 w-16 rounded-full" referrerPolicy="no-referrer" />
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="api-key-update" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Update your Google Gemini API Key
                            </label>
                            <input
                                id="api-key-update"
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="Enter new API Key"
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
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;