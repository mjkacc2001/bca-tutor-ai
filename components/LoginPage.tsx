
import React, { useEffect, useRef, useState } from 'react';
import type { User } from '../types.ts';

// Simple JWT decoder
function decodeJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [status, setStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // This effect polls to see if the required scripts have loaded.
  useEffect(() => {
    if (status !== 'initializing') return;

    const interval = setInterval(() => {
      const googleReady = !!window.google?.accounts?.id;
      const clientId = window.process?.env?.GOOGLE_CLIENT_ID;
      const configReady = !!clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

      if (googleReady && configReady) {
        clearInterval(interval);
        setStatus('ready');
      }
    }, 100); // Check every 100ms

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === 'initializing') {
        setStatus('error');
        setErrorMessage("Login services failed to load. This is often due to browser caching. Please try a hard refresh (Ctrl+Shift+R) or check your network connection.");
      }
    }, 8000); // 8-second timeout

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status]);
  
  // This effect initializes the Google button once everything is ready.
  useEffect(() => {
    if (status === 'ready' && googleButtonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: window.process.env.GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              const userData = decodeJwt(response.credential);
              if (userData) {
                const user: User = {
                  id: userData.sub,
                  name: userData.name,
                  email: userData.email,
                  picture: userData.picture,
                };
                onLogin(user);
              } else {
                setStatus('error');
                setErrorMessage("Failed to process login credentials. Please try again.");
              }
            } else {
               setStatus('error');
               setErrorMessage("Login failed: No credentials received from Google.");
            }
          },
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill' }
        );
      } catch (e) {
        console.error("Error initializing Google Sign-In:", e);
        setStatus('error');
        setErrorMessage("An unexpected error occurred during login setup.");
      }
    }
  }, [status, onLogin]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <span className="text-5xl" role="img" aria-label="Graduation Cap">🎓</span>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
              BCA Tutor AI
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in with Google to begin</p>
          </div>

          <div className="h-10 flex justify-center items-center">
            {status === 'initializing' && <p className="text-sm text-slate-500 dark:text-slate-400">Initializing login...</p>}
            {status === 'error' && (
              <div className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">
                {errorMessage}
              </div>
            )}
            {status === 'ready' && (
              <div ref={googleButtonRef} className="flex justify-center"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;