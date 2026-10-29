import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  ChefHat, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw, 
  Trash2, 
  Clock, 
  Utensils, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { chatWithAiChef } from '../api';

const QUICK_PROMPTS = [
  { label: '🍳 What can I cook now?', text: 'What can I cook right now using my expiring fridge ingredients?' },
  { label: '🥛 Milk & Egg Dishes', text: 'Suggest 2 quick 10-minute recipes using eggs and milk.' },
  { label: '🧊 Zero-Waste Storage Hacks', text: 'How should I store bread, tomatoes, and leafy vegetables so they last longer?' },
  { label: '🔄 Smart Substitutions', text: 'What are good Indian kitchen substitutes for cream, curd, and tomatoes?' },
];

export default function AiAssistantModal({ isOpen, onClose, items = [], onMarkUsed }) {
  const expiringItems = items.filter((i) => i.daysLeft !== null && i.daysLeft <= 3);
  
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Namaste! 👩‍🍳 I'm your **AnnSetu AI Chef**.\n\nI have live context of your **${items.length} pantry items** (${expiringItems.length > 0 ? `${expiringItems.length} expiring soon: ${expiringItems.map(i => i.name).join(', ')}` : 'all fresh'}).\n\nAsk me for custom recipes, zero-waste tips, food safety, or cooking hacks in English or Hinglish!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await chatWithAiChef({
        message: textToSend,
        history,
        items,
        expiringItems
      });

      const replyText = response?.reply || "I'm thinking of delicious recipes! Try asking again or pick one of the quick prompts.";

      const aiMsg = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: replyText,
        source: response?.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Chef error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'assistant',
          text: `Namaste! 👩‍🍳 You can quickly cook **${expiringItems.length > 0 ? expiringItems[0].name : 'your items'}** with onions, tomatoes and cumin! Sauté for 8 minutes and serve warm with roti or bread.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        text: `Chat cleared! What would you like to cook or know about your kitchen items?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-[85vh] bg-white border border-emerald-950/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-emerald-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm tracking-tight">AnnSetu AI Chef</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/25 text-white backdrop-blur-xs">
                  अन्नसेतु शेफ
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Pantry live: {items.length} items ({expiringItems.length} expiring)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="Clear chat history"
              className="w-8 h-8 rounded-full hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Context Banner */}
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100/80 flex items-center justify-between text-xs text-emerald-900">
          <span className="font-semibold text-[11px] flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            Active Ingredients:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto max-w-[65%] no-scrollbar py-0.5">
            {items.length > 0 ? (
              items.slice(0, 4).map((it) => (
                <span
                  key={it.id || it.name}
                  className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-slate-700 border border-emerald-200 shrink-0"
                >
                  {it.name}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400">Empty fridge</span>
            )}
            {items.length > 4 && (
              <span className="text-[10px] font-bold text-emerald-700">+{items.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8faf8]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1 text-xs">
                  👩‍🍳
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal prose prose-xs">
                  {msg.text}
                </div>
                <div
                  className={`mt-1.5 text-[10px] flex items-center gap-1 justify-end ${
                    msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1 text-xs">
                👩‍🍳
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm rounded-bl-none flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span className="text-xs text-slate-500 font-medium">AnnSetu Chef is concocting an answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(qp.text)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-semibold border border-slate-200/80 whitespace-nowrap transition active:scale-95 disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AnnSetu Chef (e.g. 'mere paas doodh hai, kya banau?')..."
              className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 active:scale-95 transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-1.5">
            AnnSetu AI Chef • Live fridge awareness • Hinglish & English supported
          </p>
        </div>

      </div>
    </div>
  );
}
