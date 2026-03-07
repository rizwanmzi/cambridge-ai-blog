"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Source {
  post_id: number;
  title: string;
  session_title: string;
}

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
  sources?: Source[];
}

const STARTER_QUESTIONS = [
  "What were the main themes across the programme?",
  "What tensions emerged between different perspectives?",
  "Which sessions generated the most debate?",
  "What real-world examples were discussed?",
];

export default function AskInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = messages
        .filter((m) => m.role !== "error")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          conversation_history: conversationHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "error",
            content: data.error || "Something went wrong. Please try again.",
          },
        ]);
        return;
      }

      const answer = data.answer && typeof data.answer === "string" && data.answer.trim()
        ? data.answer
        : "I couldn't find relevant information. Try rephrasing your question.";

      const assistantMessage: Message = {
        role: "assistant",
        content: answer,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: "Could not reach the server. Check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "60vh" }}>
      <div className="flex-1 space-y-4 mb-6">
        {/* Empty state with starter questions */}
        {messages.length === 0 && (
          <div className="py-10 animate-fade-up">
            <p className="text-sm text-txt-tertiary mb-5">
              Ask me anything about the programme. I&apos;ll answer based on what participants posted.
            </p>
            <div className="grid gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="text-left text-sm text-txt-secondary hover:text-white bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[80%] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] rounded-2xl rounded-br-md px-4 py-3">
                <p className="text-sm text-txt-primary leading-relaxed">{msg.content}</p>
              </div>
            ) : msg.role === "error" ? (
              <div className="max-w-[85%] bg-rose-500/5 border border-rose-500/10 rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-sm text-rose-300/80 leading-relaxed">{msg.content}</p>
              </div>
            ) : (
              <div className="max-w-[85%] bg-violet-500/[0.04] border border-violet-500/10 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-violet-400 text-[10px]">&#10022;</span>
                  <span className="text-[11px] font-medium text-violet-300/70">AI</span>
                </div>
                <p className="text-sm text-[rgba(255,255,255,0.75)] leading-relaxed whitespace-pre-line">
                  {msg.content}
                </p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-violet-500/10">
                    <p className="text-[10px] uppercase tracking-widest text-[rgba(255,255,255,0.25)] font-medium mb-2">Sources</p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, j) => (
                        <Link
                          key={j}
                          href={`/post/${src.post_id}`}
                          className="inline-flex items-center gap-1 text-[11px] text-violet-300/70 hover:text-violet-300 bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/10 px-2.5 py-1 rounded-full transition-all duration-200"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {src.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-start animate-fade-up">
            <div className="bg-violet-500/[0.04] border border-violet-500/10 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-violet-400 text-[10px]">&#10022;</span>
                <span className="text-[11px] font-medium text-violet-300/70">AI</span>
                <div className="flex items-center gap-1 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 typing-dot" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(input);
        }}
        className="sticky bottom-0 bg-dark-bg/80 backdrop-blur-xl pt-4 pb-2"
      >
        <div className="flex gap-2 items-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-1 focus-within:border-violet-500/20 focus-within:ring-1 focus-within:ring-violet-500/10 transition-all duration-200">
          <input
            id="ask-question"
            name="ask-question"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent py-2.5 text-sm text-txt-primary placeholder-[rgba(255,255,255,0.25)] focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-[13px] text-white bg-violet-500/80 hover:bg-violet-500 px-4 py-1.5 rounded-xl transition-all duration-200 disabled:opacity-30 shrink-0 font-medium"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
