import { describe, it, expect } from "vitest";
import { generateMenu } from "@/lib/menu-engine";

describe("generateMenu", () => {
  describe("¥10,000 tier", () => {
    it("returns exactly 9 dishes total", () => {
      const menu = generateMenu(10000);
      const total = menu.dishes.reduce((sum, cat) => sum + cat.items.length, 0);
      expect(total).toBe(9);
    });

    it("has correct category counts: 前菜×2, 冷盘×1, 汤×1, 主菜×3, 饭面×1, 甜品×1", () => {
      const menu = generateMenu(10000);
      const countByCategory: Record<string, number> = {};
      for (const cat of menu.dishes) {
        countByCategory[cat.category] = cat.items.length;
      }
      expect(countByCategory["前菜"]).toBe(2);
      expect(countByCategory["冷盘"]).toBe(1);
      expect(countByCategory["汤"]).toBe(1);
      expect(countByCategory["主菜"]).toBe(3);
      expect(countByCategory["饭面"]).toBe(1);
      expect(countByCategory["甜品"]).toBe(1);
    });
  });

  describe("¥30,000 tier", () => {
    it("returns exactly 13 dishes total", () => {
      const menu = generateMenu(30000);
      const total = menu.dishes.reduce((sum, cat) => sum + cat.items.length, 0);
      expect(total).toBe(13);
    });

    it("has correct category counts: 前菜×3, 冷盘×2, 汤×1, 主菜×4, 饭面×1, 甜品×2", () => {
      const menu = generateMenu(30000);
      const countByCategory: Record<string, number> = {};
      for (const cat of menu.dishes) {
        countByCategory[cat.category] = cat.items.length;
      }
      expect(countByCategory["前菜"]).toBe(3);
      expect(countByCategory["冷盘"]).toBe(2);
      expect(countByCategory["汤"]).toBe(1);
      expect(countByCategory["主菜"]).toBe(4);
      expect(countByCategory["饭面"]).toBe(1);
      expect(countByCategory["甜品"]).toBe(2);
    });
  });

  describe("¥50,000 tier", () => {
    it("returns exactly 16 dishes total", () => {
      const menu = generateMenu(50000);
      const total = menu.dishes.reduce((sum, cat) => sum + cat.items.length, 0);
      expect(total).toBe(16);
    });
  });

  describe("¥100,000 tier", () => {
    it("returns exactly 21 dishes total", () => {
      const menu = generateMenu(100000);
      const total = menu.dishes.reduce((sum, cat) => sum + cat.items.length, 0);
      expect(total).toBe(21);
    });
  });

  describe("allergen filtering", () => {
    it("excludes dishes containing specified allergens", () => {
      const allergens = ["甲壳类"]; // shellfish
      const menu = generateMenu(30000, allergens);
      for (const cat of menu.dishes) {
        for (const dish of cat.items) {
          const hasAllergen = dish.allergens.some((a) => allergens.includes(a));
          expect(hasAllergen).toBe(false);
        }
      }
    });

    it("excludes dishes with pork allergen", () => {
      const allergens = ["豚肉"];
      const menu = generateMenu(30000, allergens);
      for (const cat of menu.dishes) {
        for (const dish of cat.items) {
          expect(dish.allergens).not.toContain("豚肉");
        }
      }
    });

    it("excludes dishes with fish allergen", () => {
      const allergens = ["鱼类"];
      const menu = generateMenu(50000, allergens);
      for (const cat of menu.dishes) {
        for (const dish of cat.items) {
          expect(dish.allergens).not.toContain("鱼类");
        }
      }
    });

    it("handles multiple allergens simultaneously", () => {
      const allergens = ["甲壳类", "豚肉", "鱼类"];
      const menu = generateMenu(30000, allergens);
      for (const cat of menu.dishes) {
        for (const dish of cat.items) {
          const hasAnyAllergen = dish.allergens.some((a) =>
            allergens.includes(a)
          );
          expect(hasAnyAllergen).toBe(false);
        }
      }
    });
  });

  describe("main ingredient uniqueness within category", () => {
    it("does not repeat the same main ingredient in the same category for 主菜", () => {
      const menu = generateMenu(100000); // largest tier, 6 main dishes
      const mainDishes = menu.dishes.find((c) => c.category === "主菜");
      expect(mainDishes).toBeDefined();

      if (mainDishes) {
        const mainIngredients = mainDishes.items.map(
          (d) => d.ingredients[0]
        );
        const uniqueIngredients = new Set(mainIngredients);
        expect(uniqueIngredients.size).toBe(mainDishes.items.length);
      }
    });

    it("does not repeat the same main ingredient in 前菜 category", () => {
      const menu = generateMenu(100000); // 5 appetizers
      const category = menu.dishes.find((c) => c.category === "前菜");
      expect(category).toBeDefined();

      if (category) {
        const mainIngredients = category.items.map((d) => d.ingredients[0]);
        const uniqueIngredients = new Set(mainIngredients);
        expect(uniqueIngredients.size).toBe(category.items.length);
      }
    });
  });

  describe("menu metadata", () => {
    it("sets tier correctly", () => {
      const menu = generateMenu(30000);
      expect(menu.tier).toBe(30000);
    });

    it("sets guest_count correctly", () => {
      const menu = generateMenu(30000, [], "2025-01-01", 8);
      expect(menu.guest_count).toBe(8);
    });

    it("sets reservation_date correctly", () => {
      const menu = generateMenu(30000, [], "2025-12-31");
      expect(menu.reservation_date).toBe("2025-12-31");
    });

    it("throws on invalid tier", () => {
      expect(() => generateMenu(99999)).toThrow();
    });

    it("has created_at timestamp", () => {
      const menu = generateMenu(10000);
      expect(menu.created_at).toBeTruthy();
      expect(new Date(menu.created_at).getTime()).toBeGreaterThan(0);
    });
  });
});
