import React, { useEffect, useRef, useState } from 'react';
import { Bot, ChefHat, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { chatWithAiChef } from '../api';

const QUICK_PROMPTS = [
  'What should I cook today?',
  'Which items should I use first?',
  'Suggest a quick Indian dinner',
];

export default function AIChatWidget({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hey! I'm your AnnSetu AI Chef 👨‍🍳\nI can suggest recipes from your pantry, help reduce food waste, or answer kitchen questions. What are we cooking today?",
    },
  ]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const expiringItems = items.filter((item) => {
    const days = Number(item.daysLeft);
    if (item.daysLeft !== null && item.daysLeft !== undefined && Number.isFinite(days)) {
      return days <= 3;
    }

    const expiry = item.expiry_date || item.expiryDate;
    if (!expiry) return false;

    const expiryTime = new Date(expiry).getTime();
    if (!Number.isFinite(expiryTime)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.ceil((expiryTime - today.getTime()) / 86400000) <= 3;
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, isOpen]);

  const sendMessage = async (text = message) => {
    const cleanMessage = text.trim();
    if (!cleanMessage || sending) return;

    const userMessage = { role: 'user', text: cleanMessage };
    const isDirectDishRequest =
      cleanMessage.length <= 60 &&
      !/[?]/.test(cleanMessage) &&
      !/^(hi|hello|hey|thanks|thank you|namaste)$/i.test(cleanMessage);

    const history = isDirectDishRequest ? [] : messages.slice(-8);

    setMessages((previous) => [...previous, userMessage]);
    setMessage('');
    setError('');
    setSending(true);

    try {
      const result = await chatWithAiChef({
        message: cleanMessage,
        history,
        items: items.slice(0, 100),
        expiringItems: expiringItems.slice(0, 50),
      });

      const reply = typeof result?.reply === 'string' && result.reply.trim()
        ? result.reply
        : 'Sorry, I could not prepare a reply. Please try again.';

      setMessages((previous) => [
        ...previous,
        { role: 'assistant', text: reply },
      ]);
    } catch (err) {
      setError(err.message || 'Could not connect to AI Chef. Please try again.');
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <>
      {isOpen && (
        <section
          className="fixed bottom-24 right-4 sm:right-6 z-[100] flex flex-col overflow-hidden rounded-[1.6rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/15 w-[calc(100vw-2rem)] sm:w-[390px] max-w-[390px]"
          style={{ height: 'min(590px, calc(100dvh - 130px))' }}
          aria-label="AnnSetu AI Chef chat"
        >
          <header className="flex items-center gap-3 px-4 py-4 text-white bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm">AnnSetu AI Chef</h2>
              <p className="text-[11px] text-emerald-50 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-300" />
                Your pantry assistant
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Chef"
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/15 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="px-4 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Pantry-aware suggestions
            </span>
            <span className="text-[10px] text-slate-500">
              {items.length} {items.length === 1 ? 'item' : 'items'} tracked
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-4 bg-[#fbfdfb]">
            {messages.map((entry, index) => (
              <div
                key={`${index}-${entry.role}`}
                className={`flex gap-2 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {entry.role === 'assistant' && (
                  <div className="w-7 h-7 shrink-0 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[84%] rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                    entry.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md'
                  }`}
                >
                  {entry.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pl-9">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    disabled={sending}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-[11px] font-medium text-emerald-800 bg-white border border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl px-3 py-2 transition disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {sending && (
              <div className="flex items-center gap-2 pl-9 text-xs text-slate-500">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:240ms]" />
                </span>
                AI Chef is thinking...
              </div>
            )}

            {error && (
              <div className="ml-9 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700">
                {error}
                <button
                  type="button"
                  onClick={() => sendMessage(messages[messages.length - 1]?.text || '')}
                  className="ml-2 font-bold underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="p-3 border-t border-slate-100 bg-white"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition">
              <textarea
                ref={inputRef}
                rows={1}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask your AI Chef..."
                maxLength={2000}
                aria-label="Message AI Chef"
                className="flex-1 resize-none bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 px-2 py-2 max-h-24"
              />
              <button
                type="submit"
                disabled={!message.trim() || sending}
                aria-label="Send message"
                className="w-10 h-10 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              AI can make mistakes. Check food labels and storage guidance.
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close AI Chef chat' : 'Open AI Chef chat'}
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-[101] group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white pl-3.5 pr-4 py-3 shadow-xl shadow-emerald-800/25 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all"
      >
        <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/15">
          {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lime-300 border-2 border-emerald-700" />
          )}
        </span>
        <span className="text-sm font-bold">{isOpen ? 'Close Chef' : 'AI Chef'}</span>
      </button>
    </>
  );
}

