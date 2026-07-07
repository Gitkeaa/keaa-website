import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm KEAA's AI Assistant. How can I help you today? I can answer questions about our products, services, and company.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        let friendly = '';
        try {
          const errData = await response.json();
          friendly = errData?.error || errData?.details || '';
        } catch (_) {
          /* body wasn't JSON — ignore */
        }
        const err = new Error(`Server responded ${response.status}. ${friendly}`);
        err.userMessage = friendly;
        err.status = response.status;
        throw err;
      }

      const data = await response.json();

      const botMessage = {
        id: messages.length + 2,
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // A TypeError from fetch() almost always means the backend (server.js on
      // :3001) isn't running. Log the real reason to the console for debugging.
      const offline = error instanceof TypeError;
      console.error('[KEAA AI Chat] request failed:', error);
      if (offline) {
        console.error(
          '[KEAA AI Chat] The chat backend is unreachable. Start it with "npm run dev:all" ' +
            '(or "npm run dev:server"), then confirm http://localhost:3001/health responds.'
        );
      }
      const errorMessage = {
        id: messages.length + 2,
        text: offline
          ? "I can't reach the assistant service right now. Please try again in a moment."
          : error.userMessage ||
            'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col border border-gray-200 mb-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">KEAA AI Assistant</h3>
              <p className="text-xs text-blue-100">Online</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-800 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[17rem] px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    <div
                      className="text-sm leading-relaxed break-words
                        [&_p]:mb-2 [&_p:last-child]:mb-0
                        [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4
                        [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-4
                        [&_li]:mb-1 [&_li]:marker:text-gray-400
                        [&_strong]:font-semibold [&_strong]:text-gray-900
                        [&_a]:text-blue-600 [&_a]:underline
                        [&_h1]:mt-1 [&_h1]:mb-1.5 [&_h1]:font-semibold
                        [&_h2]:mt-1 [&_h2]:mb-1.5 [&_h2]:font-semibold
                        [&_h3]:mt-1 [&_h3]:mb-1 [&_h3]:font-semibold
                        [&_code]:rounded [&_code]:bg-gray-300/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.8em]
                        [&_table]:my-1.5 [&_table]:w-full [&_table]:text-xs
                        [&_th]:border [&_th]:border-gray-300 [&_th]:px-1.5 [&_th]:py-0.5 [&_th]:text-left
                        [&_td]:border [&_td]:border-gray-300 [&_td]:px-1.5 [&_td]:py-0.5"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: (props) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <div className="flex justify-end">
        {isOpen ? (
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close KEAA assistant"
            className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/70 bg-navy-900 text-gold-400 shadow-xl transition-transform hover:scale-105"
          >
            <X size={24} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            {/* "Ask keaa" label */}
            <div className="relative rounded-full bg-navy-800 px-3.5 py-2 shadow-lg">
              <span className="text-sm font-semibold tracking-wide text-white">
                Ask <span className="text-gold-400">keaa</span>
              </span>
              {/* pointer toward the button */}
              <span className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-navy-800" />
            </div>

            {/* Robot button with gold radiation ring */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open KEAA assistant"
              className="group relative h-14 w-14 shrink-0 transition-transform hover:scale-105"
            >
              {/* rotating gold radiation ring */}
              <span
                className="absolute -inset-[3px] rounded-full animate-spin motion-reduce:animate-none"
                style={{
                  animationDuration: '4s',
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(245,180,0,0.12) 130deg, #F5B400 300deg, #FFCF52 345deg, transparent 360deg)',
                }}
              />
              {/* pulsing halo */}
              <span
                className="absolute inset-0 rounded-full bg-gold-500/30 animate-ping motion-reduce:animate-none"
                style={{ animationDuration: '2.6s' }}
              />
              {/* navy circle with robot */}
              <span className="absolute inset-0 flex items-center justify-center rounded-full border border-gold-500/70 bg-navy-900 shadow-xl">
                <Bot className="h-7 w-7 text-gold-400" />
              </span>
              {/* notification badge */}
              <span className="absolute -right-0.5 -top-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-navy-900 ring-2 ring-white">
                1
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
