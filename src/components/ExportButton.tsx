"use client";

import React, { useState } from "react";
import { Menu } from "@/lib/menu-engine";

interface ExportButtonProps {
  menu: Menu | null;
  menuElementId?: string;
}

export default function ExportButton({
  menu,
  menuElementId = "menu-display",
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!menu || exporting) return;

    setExporting(true);

    try {
      // Dynamically import html2canvas (client-side only)
      const html2canvas = (await import("html2canvas")).default;

      const element = document.getElementById(menuElementId);
      if (!element) {
        console.error("Menu element not found");
        return;
      }

      // Create a wrapper with white background for clean export
      const wrapper = document.createElement("div");
      wrapper.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 40px;
        background: #0d0d0d;
        border: 2px solid #c9a84c;
        box-sizing: border-box;
      `;

      // Add decorative gold lines
      const topLine = document.createElement("div");
      topLine.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        right: 20px;
        height: 1px;
        background: linear-gradient(to right, transparent, #c9a84c, transparent);
      `;
      const bottomLine = document.createElement("div");
      bottomLine.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        height: 1px;
        background: linear-gradient(to right, transparent, #c9a84c, transparent);
      `;

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.cssText = "width: 100%; padding: 0;";

      wrapper.appendChild(topLine);
      wrapper.appendChild(clone);
      wrapper.appendChild(bottomLine);
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        backgroundColor: "#0d0d0d",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(wrapper);

      // Download PNG
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      const date = menu.reservation_date || new Date().toISOString().split("T")[0];
      link.download = `五粮液菜单_${date}_¥${menu.tier.toLocaleString()}.png`;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("导出失败，请重试。");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!menu || exporting}
      className={`
        px-4 py-2 text-sm font-medium rounded-lg border transition-all
        ${
          menu && !exporting
            ? "border-gold/60 text-gold hover:bg-gold/10 cursor-pointer"
            : "border-stone-700 text-stone-600 cursor-not-allowed"
        }
      `}
    >
      {exporting ? (
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
          导出中...
        </span>
      ) : (
        "导出图片"
      )}
    </button>
  );
}
