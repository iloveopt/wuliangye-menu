"use client";

import React from "react";
import { Menu } from "@/lib/menu-engine";
import { Dish } from "@/data/dishes";

interface MenuDisplayProps {
  menu: Menu | null;
  menuRef?: React.RefObject<HTMLDivElement | null>;
}

const CATEGORY_LABELS: Record<string, string> = {
  前菜: "前菜 / 前菜",
  冷盘: "冷盘 / 冷製",
  汤: "汤 / スープ",
  主菜: "主菜 / メインディッシュ",
  饭面: "饭面 / ご飯・麺",
  甜品: "甜品 / デザート",
};

function DishItem({ dish }: { dish: Dish }) {
  return (
    <div className="py-4 border-b border-gold/20 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-medium text-gold tracking-wide">
              {dish.name}
            </span>
            {dish.is_signature && (
              <span className="text-yellow-400 text-sm" title="招牌菜">
                ★
              </span>
            )}
          </div>
          <div className="text-sm text-stone-400 mt-0.5 tracking-wider">
            {dish.name_ja}
          </div>
          <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
            {dish.description}
          </p>
          {dish.season && dish.season !== "全年" && (
            <span className="inline-block mt-1.5 text-xs text-stone-600 border border-stone-700 px-1.5 py-0.5 rounded">
              {dish.season}季
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuDisplay({ menu, menuRef }: MenuDisplayProps) {
  if (!menu) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
        <div className="text-gold/40 text-6xl mb-4">菜</div>
        <p className="text-stone-500 text-sm leading-relaxed">
          菜单将在此处显示
          <br />
          <span className="text-stone-600">メニューはここに表示されます</span>
        </p>
        <p className="text-stone-600 text-xs mt-4">
          请在左侧对话框中输入要求，或点击快捷按钮
        </p>
      </div>
    );
  }

  const totalDishes = menu.dishes.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div
      ref={menuRef}
      className="bg-[#0d0d0d] text-stone-100 p-6 md:p-8 min-h-full"
      id="menu-display"
    >
      {/* Header */}
      <div className="text-center mb-8 border-b border-gold/30 pb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-gold text-xs tracking-[0.3em] uppercase">
            Wu Liang Ye · Tokyo
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/40" />
        </div>
        <h2 className="text-3xl font-light text-gold tracking-widest mt-3">
          五粮液 東京
        </h2>
        <p className="text-stone-400 text-sm mt-1 tracking-wider">
          ご会食メニュー
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-stone-500">
          <div>
            <span className="block text-stone-600">日期 / 日付</span>
            <span className="text-stone-400">{menu.reservation_date}</span>
          </div>
          <div>
            <span className="block text-stone-600">人数 / 名様</span>
            <span className="text-stone-400">{menu.guest_count}名</span>
          </div>
          <div>
            <span className="block text-stone-600">档次 / コース</span>
            <span className="text-gold">
              ¥{menu.tier.toLocaleString()}
            </span>
          </div>
        </div>

        {menu.special_notes && (
          <p className="mt-3 text-xs text-stone-500 italic border border-stone-800 rounded px-3 py-2 bg-stone-900/50">
            备注: {menu.special_notes}
          </p>
        )}

        <p className="mt-3 text-xs text-stone-600">
          共 {totalDishes} 道菜 · {totalDishes}品
        </p>
      </div>

      {/* Dishes by category */}
      <div className="space-y-8">
        {menu.dishes.map((categoryGroup) => (
          <div key={categoryGroup.category}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gold/20" />
              <div className="text-center">
                <span className="text-gold/80 text-xs tracking-[0.2em] uppercase font-light">
                  {CATEGORY_LABELS[categoryGroup.category] || categoryGroup.category}
                </span>
              </div>
              <div className="h-px flex-1 bg-gold/20" />
            </div>

            {/* Dishes */}
            <div>
              {categoryGroup.items.map((dish) => (
                <DishItem key={dish.id} dish={dish} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-gold/20 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-gold/40 text-lg">❖</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
        </div>
        <p className="text-stone-700 text-xs tracking-widest">
          五粮液東京 · 料理人の魂を込めて
        </p>
        <p className="text-stone-800 text-xs mt-1">
          AI排菜系统生成 · {new Date(menu.created_at).toLocaleString("zh-CN")}
        </p>
      </div>
    </div>
  );
}
