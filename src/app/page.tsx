"use client";

import React, { useRef, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import MenuDisplay from "@/components/MenuDisplay";
import ExportButton from "@/components/ExportButton";
import { Menu, generateMenu } from "@/lib/menu-engine";

const TIER_BUTTONS = [
  { label: "¥1万", tier: 10000 },
  { label: "¥3万", tier: 30000 },
  { label: "¥5万", tier: 50000 },
  { label: "¥10万", tier: 100000 },
];

export default function Home() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleQuickGenerate = (tier: number) => {
    const newMenu = generateMenu(
      tier,
      [],
      new Date().toISOString().split("T")[0],
      2,
      ""
    );
    setMenu(newMenu);
  };

  const handleNewMenu = () => {
    setMenu(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-800 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-gold text-2xl font-light tracking-widest">
                  五粮液
                </span>
                <span className="text-stone-500 text-xs tracking-wider border-l border-stone-700 pl-3">
                  AI 排菜系统
                </span>
              </div>
              <p className="text-stone-600 text-xs mt-0.5 tracking-wider">
                AIメニュープランニングシステム · 東京
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleNewMenu}
                className="px-3 py-1.5 text-xs border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-300 rounded-md transition-colors"
              >
                新建菜单
              </button>
              {TIER_BUTTONS.map(({ label, tier }) => (
                <button
                  key={tier}
                  onClick={() => handleQuickGenerate(tier)}
                  className="px-3 py-1.5 text-xs border border-gold/30 text-gold/80 hover:bg-gold/10 hover:border-gold/60 rounded-md transition-colors"
                >
                  {label}
                </button>
              ))}
              <ExportButton menu={menu} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-140px)]">
          {/* Chat interface - left/top */}
          <div className="h-[600px] lg:h-[calc(100vh-180px)] lg:sticky lg:top-6">
            <ChatInterface
              onMenuGenerated={setMenu}
              currentMenu={menu}
            />
          </div>

          {/* Menu display - right/bottom */}
          <div className="border border-stone-800 rounded-lg overflow-y-auto lg:max-h-[calc(100vh-180px)]">
            <MenuDisplay menu={menu} menuRef={menuRef} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 py-4 mt-6">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-stone-800 text-xs text-center tracking-wider">
            五粮液東京 AI排菜系统 · Powered by Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
}
