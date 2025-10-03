
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Message } from '../types.ts';

// --- Formatting Logic (from former AnswerDisplay) ---

const parseInlineFormatting = (line: string): (string | JSX.Element)[] => {
    const parts = line.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-slate-200 dark:bg-slate-700 text-pink-600 dark:text-pink-400 font-mono text-sm rounded px-1 py-0.5">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4 text-green-400">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [code]);

    return (
        <div className="relative my-4">
            <pre className="bg-slate-900 text-slate-100 font-mono text-sm p-4 rounded-lg overflow-x-auto pr-20">
                <code>{code}</code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 flex items-center bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                aria-label="Copy code to clipboard"
            >
                {copied ? <><CheckIcon />Copied!</> : <><CopyIcon />Copy</>}
            </button>
        </div>
    );
};


const renderFormattedText = (text: string): JSX.Element[] => {
    if (!text) return [];

    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let elementKey = 0;
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('```')) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(<CodeBlock key={`code-${elementKey++}`} code={codeLines.join('\n')} />);
            i++;
            continue;
        }
        const isTableLine = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        const isTableSeparator = nextLine.startsWith('|') && /^[|:?\s-]+$/.test(nextLine.replace(/\|/g, '|'));
        if (isTableLine && isTableSeparator) {
            const parseRow = (rowLine: string) => rowLine.trim().slice(1, -1).split('|').map(cell => cell.trim());
            const headers = parseRow(trimmedLine);
            const rows = [];
            i += 2;
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                rows.push(parseRow(lines[i]));
                i++;
            }
            elements.push(
                <div key={`table-${elementKey++}`} className="overflow-x-auto my-4">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-700">{headers.map((h, idx) => <th key={idx} className="border border-slate-300 dark:border-slate-600 font-semibold p-2 text-left">{parseInlineFormatting(h)}</th>)}</tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rIdx) => <tr key={rIdx} className="bg-white dark:bg-slate-800">{row.map((cell, cIdx) => <td key={cIdx} className="border border-slate-300 dark:border-slate-600 p-2">{parseInlineFormatting(cell)}</td>)}</tr>)}
                        </tbody>
                    </table>
                </div>
            );
            continue;
        }
        if (trimmedLine.startsWith('### ')) {
            elements.push(<h3 key={`h3-${elementKey++}`} className="text-xl font-semibold mt-6 mb-3 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">{parseInlineFormatting(trimmedLine.substring(4))}</h3>);
            i++; continue;
        }
        const isUl = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ');
        const isOl = /^\d+\.\s/.test(trimmedLine);
        if (isUl || isOl) {
            const listItems = [];
            const type = isUl ? 'ul' : 'ol';
            while (i < lines.length) {
                 const currentLineTrimmed = lines[i].trim();
                 const isCurrentUl = currentLineTrimmed.startsWith('* ') || currentLineTrimmed.startsWith('- ');
                 const isCurrentOl = /^\d+\.\s/.test(currentLineTrimmed);
                 if ((type === 'ul' && !isCurrentUl) || (type === 'ol' && !isCurrentOl)) break;
                 const content = isCurrentUl ? currentLineTrimmed.substring(2) : currentLineTrimmed.substring(currentLineTrimmed.indexOf(' ') + 1);
                 listItems.push(<li key={`li-${elementKey++}`}>{parseInlineFormatting(content)}</li>);
                 i++;
            }
            if (type === 'ul') elements.push(<ul key={`list-${elementKey++}`} className="list-disc list-inside space-y-2 my-3 pl-4">{listItems}</ul>);
            else elements.push(<ol key={`list-${elementKey++}`} className="list-decimal list-inside space-y-2 my-3 pl-4">{listItems}</ol>);
            continue;
        }
        if (trimmedLine.length > 0) {
            elements.push(<p key={`p-${elementKey++}`} className="my-3 leading-relaxed">{parseInlineFormatting(trimmedLine)}</p>);
        } else if (elements.length > 0 && elements[elements.length - 1].type !== 'br') {
            elements.push(<br key={`br-${elementKey++}`} />);
        }
        i++;
    }
    return elements;
};

// --- Components ---

const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
);

const MessageBubble: React.FC<{ message: Message, isStreaming: boolean }> = ({ message, isStreaming }) => {
    const { role, content, isError } = message;
    const isUser = role === 'user';
    
    const bubbleClasses = isUser
        ? 'bg-indigo-500 text-white'
        : 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700';
    
    const alignmentClasses = isUser ? 'items-end' : 'items-start';

    return (
        <div className={`flex flex-col my-2 ${alignmentClasses}`}>
            <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${bubbleClasses}`}>
                 {isError ? (
                     <div className="text-red-500">{content}</div>
                 ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        {renderFormattedText(content)}
                        {isStreaming && <span className="inline-block w-2.5 h-5 bg-slate-700 dark:bg-slate-300 animate-pulse ml-1" />}
                    </div>
                 )}
            </div>
        </div>
    );
};

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-4">
           {messages.map((msg, index) => (
                <MessageBubble 
                    key={msg.id} 
                    message={msg}
                    isStreaming={isLoading && index === messages.length - 1} 
                />
           ))}
           {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex flex-col my-2 items-start">
                    <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <TypingIndicator />
                    </div>
                </div>
           )}
        </div>
    );
};

export default ChatWindow;