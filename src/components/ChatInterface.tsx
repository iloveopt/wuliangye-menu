"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu } from "@/lib/menu-engine";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMenuGenerated: (menu: Menu) => void;
  currentMenu: Menu | null;
}

export default function ChatInterface({
  onMenuGenerated,
  currentMenu,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "欢迎使用五粮液AI排菜系统。\n\n请告诉我您的需求：\n• 预算档次（¥1万 / ¥3万 / ¥5万 / ¥10万）\n• 宾客人数\n• 过敏原或忌口\n• 特殊要求\n\n例如：「请安排¥3万档次的商务宴菜单，共6人，客人有蟹过敏」",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = [...messages, userMessage]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          currentMenu,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "发生了未知错误，请重试。",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.menu) {
        onMenuGenerated(data.menu);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "网络错误，请检查连接后重试。",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] border border-stone-800 rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-stone-800 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-gold text-sm font-medium tracking-wider">
            AI 排菜助手
          </span>
        </div>
        <p className="text-stone-600 text-xs mt-0.5">
          AIメニューアシスタント
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs mr-2 mt-0.5 flex-shrink-0">
                五
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gold/20 text-stone-200 border border-gold/30"
                  : "bg-stone-900 text-stone-300 border border-stone-800"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 text-xs ml-2 mt-0.5 flex-shrink-0">
                客
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs mr-2 mt-0.5 flex-shrink-0">
              五
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-stone-800 bg-[#0d0d0d]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入您的需求... (Enter发送，Shift+Enter换行)"
            className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 resize-none focus:outline-none focus:border-gold/50 transition-colors min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-gold text-black text-sm font-medium rounded-lg hover:bg-gold/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
