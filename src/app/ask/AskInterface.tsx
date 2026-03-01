"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Source {
  post_id: number;
  title: string;
  session_title: string;
}

interface Message {
  role: "user" | "assistant";
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
      const conversationHistory = messages.map((m) => ({
        role: m.role,
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
      if (!res.ok) throw new Error(data.error || "Failed to get answer");

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that question. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "60vh" }}>
      <div className="flex-1 space-y-3 mb-6">
        {messages.length === 0 && (
          <div className="py-12">
            <p className="text-sm text-txt-tertiary mb-6">
              Ask me anything about the programme. I&apos;ll answer based on what participants posted.
            </p>
            <div className="space-y-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="block text-sm text-txt-secondary hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[80%] bg-[rgba(255,255,255,0.08)] rounded-md px-3 py-2">
                <p className="text-sm text-txt-primary leading-relaxed">{msg.content}</p>
              </div>
            ) : (
              <div className="max-w-[85%] border-l-2 border-ai-indigo pl-3 py-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[11px] font-medium text-txt-tertiary">✦ AI</span>
                </div>
                <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed whitespace-pre-line">
                  {msg.content}
                </p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    <p className="text-[11px] text-txt-tertiary mb-1">Sources</p>
                    <div className="space-y-0.5">
                      {msg.sources.map((src, j) => (
                        <div key={j} className="flex items-center gap-1.5">
                          <Link
                            href={`/post/${src.post_id}`}
                            className="text-[12px] text-white hover:underline"
                          >
                            {src.title}
                          </Link>
                          <span className="text-[11px] text-txt-tertiary">
                            in {src.session_title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="border-l-2 border-ai-indigo pl-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-txt-tertiary">✦ AI</span>
                <span className="dot-pulse" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(input);
        }}
        className="sticky bottom-0 bg-dark-bg pt-4 border-t border-[rgba(255,255,255,0.06)]"
      >
        <div className="flex gap-2">
          <input
            id="ask-question"
            name="ask-question"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent border-b border-[rgba(255,255,255,0.1)] py-2 text-sm text-txt-primary placeholder-txt-tertiary focus:outline-none focus:border-[rgba(255,255,255,0.25)]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-[13px] text-white bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-md hover:bg-[rgba(255,255,255,0.15)] disabled:opacity-40 shrink-0"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
