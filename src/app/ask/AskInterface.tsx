"use client";

import { useState, useRef, useEffect } from "react";
import SparkleIcon from "@/components/SparkleIcon";
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
      {/* Messages area */}
      <div className="flex-1 space-y-4 mb-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <SparkleIcon className="w-10 h-10 text-blue-300 mx-auto mb-4" />
            <p className="text-navy-500 mb-6">
              Ask me anything about the programme. I&apos;ll answer based on what participants posted.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
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
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-navy-900 text-white"
                  : "bg-gradient-to-br from-blue-50/50 to-slate-50 border border-blue-100"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-2">
                  <SparkleIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">AI</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <p className="text-xs font-medium text-navy-500 mb-1.5">Sources:</p>
                  <div className="space-y-1">
                    {msg.sources.map((src, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <Link
                          href={`/post/${src.post_id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {src.title}
                        </Link>
                        <span className="text-xs text-navy-400">
                          in {src.session_title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-blue-50/50 to-slate-50 border border-blue-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <SparkleIcon className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span className="text-sm text-blue-600 animate-pulse">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(input);
        }}
        className="sticky bottom-0 bg-white pt-4 border-t border-navy-100"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the programme..."
            className="flex-1 border border-navy-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-navy-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
