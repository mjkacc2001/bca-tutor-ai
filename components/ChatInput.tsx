
import React, { useState, useRef } from 'react';
import type { Marks } from '../types.ts';

interface ChatInputProps {
  onSubmit: (question: string, marks: Marks) => void;
  isLoading: boolean;
}

const MarkButton: React.FC<{ value: Marks; currentMarks: Marks; setMarks: (marks: Marks) => void }> = ({ value, currentMarks, setMarks }) => {
  const isActive = value === currentMarks;
  const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500";
  const activeClasses = "bg-indigo-600 text-white shadow";
  const inactiveClasses = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600";

  return (
    <button
      type="button"
      onClick={() => setMarks(value)}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {value} Mark{value > 1 ? 's' : ''}
    </button>
  );
};

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');
  const [marks, setMarks] = useState<Marks>(5);
  const marksOptions: Marks[] = [1, 2, 3, 5];
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question, marks);
      setQuestion('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Programmatically submit the form to ensure a single, reliable submission path.
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a follow-up question or start a new topic..."
          className="w-full h-24 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
          disabled={isLoading}
          rows={3}
        />
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                 <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Marks:</span>
                 {marksOptions.map((markValue) => (
                    <MarkButton key={markValue} value={markValue} currentMarks={marks} setMarks={setMarks} />
                ))}
            </div>
            <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
            >
                {isLoading ? '...' : 'Send'}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4">
                    <path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path>
                </svg>
            </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;