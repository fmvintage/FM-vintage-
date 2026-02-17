
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product } from '../types';
import { aiChat } from '../services/geminiService';

interface AiChatBoxProps {
  products: Product[];
}

const QUICK_TASKS = [
  { label: '📦 Track Order', query: 'What is the status of my latest order?' },
  { label: '👕 Men\'s Fashion', query: 'Show me the best vintage items for men.' },
  { label: '👗 Women\'s Fashion', query: 'What are the top picks for women right now?' },
  { label: '💰 Top Deals', query: 'Tell me about products with the highest discounts.' },
  { label: '💬 WhatsApp Help', query: 'How do I contact support on WhatsApp?' },
];

const AiChatBox: React.FC<AiChatBoxProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to the FM Vintage Archives. I am your concierge. How may I assist your discovery today? I can help you track orders, find artifacts, or contact support.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    const responseText = await aiChat(newMessages, products);
    setMessages([...newMessages, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[100] max-w-lg">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-72 sm:w-80 h-[500px] mb-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-neutral-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-black p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic text-xs border border-white/20">FMV</div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Archive Concierge</h3>
                <span className="text-[7px] text-blue-400 font-bold uppercase tracking-widest">Autonomous Assistant</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-[11px] leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-black text-white rounded-br-none font-medium' 
                    : 'bg-white text-neutral-800 rounded-bl-none border border-neutral-200'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-100 p-3 rounded-xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Tasks Chips */}
          {!isLoading && (
            <div className="px-3 py-2 bg-neutral-50 border-t border-neutral-100">
               <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {QUICK_TASKS.map((task, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(task.query)}
                      className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full whitespace-nowrap text-[9px] font-black uppercase tracking-tight text-neutral-600 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                    >
                      {task.label}
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-neutral-100 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query the Archive..."
              className="flex-1 bg-neutral-100 border-none rounded-lg px-4 py-2 text-[11px] focus:ring-1 focus:ring-black outline-none font-medium"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-black text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:bg-neutral-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB (Floating Action Button) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-90 transition-all group relative"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black animate-pulse"></div>
          </div>
        )}
        
        {/* Help tooltip on hover */}
        {!isOpen && (
          <div className="absolute right-full mr-3 bg-black text-white px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Ask AI Assistant
          </div>
        )}
      </button>
    </div>
  );
};

export default AiChatBox;
