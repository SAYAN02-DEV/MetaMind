import { useEffect, useRef, useState } from 'react';
import { usageAPI } from '../utils/api';
import { MessageSquare, X, Send } from 'lucide-react';

export default function ChatbotOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your MetaMind assistant. How can I help you today?' }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    // Check Gemini API quota before making call
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('geminiCallDate');
    const storedCount = parseInt(localStorage.getItem('geminiCallCount') || '0');
    
    // Reset count if it's a new day
    if (storedDate !== today) {
      localStorage.setItem('geminiCallDate', today);
      localStorage.setItem('geminiCallCount', '0');
    }
    
    const currentCount = storedDate === today ? storedCount : 0;
    
    if (currentCount >= 40) {
      setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I\'ve reached my daily API limit. Please try again tomorrow or contact support for more quota.' 
      }]);
      setInput('');
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setIsSending(true);

    try {
      const res = await usageAPI.chatWithGemini(trimmed);
      const reply = res.data?.reply || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      
      // Increment the call count
      const newCount = currentCount + 1;
      localStorage.setItem('geminiCallCount', newCount.toString());
    } catch (err) {
      console.error('Chat error:', err);
      let errorMessage = 'There was an error. Please try again.';
      
      if (err.response?.status === 429) {
        errorMessage = 'API quota exceeded. Please try again later or tomorrow.';
      } else if (err.message?.includes('quota')) {
        errorMessage = 'Daily API limit reached. Please try again tomorrow.';
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:opacity-90 transition"
        title={isOpen ? 'Close Chat' : 'Open Chat'}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Overlay Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-md bg-gray-900/95 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="text-white font-semibold">MetaMind Chat</div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-80 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-100'} px-3 py-2 rounded-xl max-w-[80%] whitespace-pre-wrap`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-700 flex items-center space-x-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your usage..."
              className="flex-1 resize-none bg-gray-800 text-white placeholder-gray-400 rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-purple-500"
              disabled={(() => {
                const today = new Date().toDateString();
                const storedDate = localStorage.getItem('geminiCallDate');
                const storedCount = parseInt(localStorage.getItem('geminiCallCount') || '0');
                const currentCount = storedDate === today ? storedCount : 0;
                return currentCount >= 40;
              })()}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}


