
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header.tsx';
import LoginPage from './components/LoginPage.tsx';
import ApiKeyPrompt from './components/ApiKeyPrompt.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import ChatInput from './components/ChatInput.tsx';
import ProfileSettingsModal from './components/ProfileSettingsModal.tsx';
import { startChat } from './services/geminiService.ts';
import type { Marks, User, Message } from './types.ts';
import type { Chat } from '@google/genai';

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const WELCOME_MESSAGE_CONTENT = "Hello! I am your BCA Tutor AI. Ask me any question about your syllabus, and tell me how many marks it's for. Let's get you ready for your exams!";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Use state for the chat session to ensure dependent callbacks are correctly updated.
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const savedUserJson = sessionStorage.getItem('bca-tutor-user');
    if (savedUserJson) {
      const savedUser = JSON.parse(savedUserJson);
      handleLogin(savedUser, false);
    }
  }, []);

  // Encapsulate chat initialization logic into a memoized callback.
  const initializeChat = useCallback(() => {
    if (apiKey && user) {
      try {
        const initialHistory = [{ role: 'model', parts: [{ text: WELCOME_MESSAGE_CONTENT }] }];
        const newChat = startChat(apiKey, initialHistory);
        setChatSession(newChat);
        setMessages([{ role: 'model', content: WELCOME_MESSAGE_CONTENT, id: generateId() }]);
        setError(null); // Clear previous errors on successful init
      } catch (err) {
         const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
         setError(`Failed to start chat session: ${errorMessage}`);
         setApiKey(null); // Force user to re-enter key
         if (user) {
           localStorage.removeItem(`gemini-api-key-${user.id}`);
         }
      }
    } else {
        setChatSession(null);
        setMessages([]);
    }
  }, [apiKey, user]);

  // Effect to initialize or reset the chat session whenever the user or API key changes.
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const handleLogin = (loggedInUser: User, storeSession = true) => {
    setUser(loggedInUser);
    if (storeSession) {
      sessionStorage.setItem('bca-tutor-user', JSON.stringify(loggedInUser));
    }
    const userApiKey = localStorage.getItem(`gemini-api-key-${loggedInUser.id}`);
    if (userApiKey) {
      setApiKey(userApiKey);
    }
  };
  
  const handleApiKeySubmit = (submittedApiKey: string) => {
    if (user) {
      // The useEffect will handle re-initializing the chat.
      setApiKey(submittedApiKey);
      localStorage.setItem(`gemini-api-key-${user.id}`, submittedApiKey);
      setIsProfileModalOpen(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setApiKey(null);
    setChatSession(null);
    sessionStorage.removeItem('bca-tutor-user');
    if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
        if (user?.email) {
          window.google.accounts.id.revoke(user.email, () => {});
        }
    }
  };

  const handleClearChat = () => {
    initializeChat();
  };

  const handleSubmit = useCallback(async (question: string, marks: Marks) => {
    if (isSubmittingRef.current || !chatSession) {
      return;
    }
    
    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    const userMessage: Message = { role: 'user', content: question, id: generateId() };
    setMessages(prev => [...prev, userMessage, { role: 'model', content: '', id: generateId() }]);
    
    const userPrompt = `Question: "${question}"\nMarks: ${marks}`;

    try {
      const responseStream = await chatSession.sendMessageStream({ message: userPrompt });

      for await (const chunk of responseStream) {
         setMessages(prev => prev.map((msg, index) => {
            if (index === prev.length - 1 && msg.role === 'model') {
                return { ...msg, content: msg.content + chunk.text };
            }
            return msg;
         }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
            lastMessage.content = `Error: ${errorMessage}`;
            lastMessage.isError = true;
        }
        return newMessages;
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  }, [chatSession]); // Dependency on chatSession ensures the callback always has the correct session.

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  if (!apiKey) {
    return <ApiKeyPrompt user={user} onApiKeySubmit={handleApiKeySubmit} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onProfileClick={() => setIsProfileModalOpen(true)}
        onClearChat={handleClearChat}
      />
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-8">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <div className="mt-auto pt-4">
             <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
      </main>
      {isProfileModalOpen && (
        <ProfileSettingsModal 
            user={user} 
            onClose={() => setIsProfileModalOpen(false)}
            onApiKeySubmit={handleApiKeySubmit}
        />
      )}
    </div>
  );
}

export default App;