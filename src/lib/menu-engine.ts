import { Dish, dishes } from "@/data/dishes";

export interface Menu {
  tier: number;
  reservation_date: string;
  guest_count: number;
  special_notes: string;
  dishes: {
    category: string;
    items: Dish[];
  }[];
  created_at: string;
}

interface TierConfig {
  前菜: number;
  冷盘: number;
  汤: number;
  主菜: number;
  饭面: number;
  甜品: number;
}

const TIER_CONFIG: Record<number, TierConfig> = {
  10000: { 前菜: 2, 冷盘: 1, 汤: 1, 主菜: 3, 饭面: 1, 甜品: 1 },
  30000: { 前菜: 3, 冷盘: 2, 汤: 1, 主菜: 4, 饭面: 1, 甜品: 2 },
  50000: { 前菜: 4, 冷盘: 2, 汤: 2, 主菜: 5, 饭面: 1, 甜品: 2 },
  100000: { 前菜: 5, 冷盘: 3, 汤: 2, 主菜: 6, 饭面: 2, 甜品: 3 },
};

const CATEGORY_ORDER: Array<keyof TierConfig> = [
  "前菜",
  "冷盘",
  "汤",
  "主菜",
  "饭面",
  "甜品",
];

function getMainIngredient(dish: Dish): string {
  return dish.ingredients[0] || "";
}

function selectDishes(
  pool: Dish[],
  count: number,
  selected: Dish[] = []
): Dish[] {
  const result: Dish[] = [...selected];
  const usedMainIngredients = new Set(result.map(getMainIngredient));

  // First, try to fill with signature dishes
  const signatures = pool.filter(
    (d) =>
      d.is_signature &&
      !result.find((r) => r.id === d.id) &&
      !usedMainIngredients.has(getMainIngredient(d))
  );

  for (const sig of signatures) {
    if (result.length >= count) break;
    result.push(sig);
    usedMainIngredients.add(getMainIngredient(sig));
  }

  // Fill remaining with non-signature
  const remaining = pool.filter(
    (d) =>
      !d.is_signature &&
      !result.find((r) => r.id === d.id) &&
      !usedMainIngredients.has(getMainIngredient(d))
  );

  for (const dish of remaining) {
    if (result.length >= count) break;
    result.push(dish);
    usedMainIngredients.add(getMainIngredient(dish));
  }

  // If still not enough, allow duplicate main ingredients (last resort)
  if (result.length < count) {
    const fallback = pool.filter((d) => !result.find((r) => r.id === d.id));
    for (const dish of fallback) {
      if (result.length >= count) break;
      result.push(dish);
    }
  }

  return result.slice(0, count);
}

export function generateMenu(
  tier: number,
  allergens: string[] = [],
  reservation_date: string = new Date().toISOString().split("T")[0],
  guest_count: number = 2,
  special_notes: string = ""
): Menu {
  const config = TIER_CONFIG[tier];
  if (!config) {
    throw new Error(`Invalid tier: ${tier}. Valid tiers: 10000, 30000, 50000, 100000`);
  }

  const menuCategories: { category: string; items: Dish[] }[] = [];

  for (const category of CATEGORY_ORDER) {
    const count = config[category];

    // Filter by tier suitability and allergens
    const eligible = dishes.filter(
      (d) =>
        d.category === category &&
        d.suitable_tiers.includes(tier) &&
        !d.allergens.some((a) => allergens.includes(a))
    );

    const selected = selectDishes(eligible, count);

    if (selected.length > 0) {
      menuCategories.push({ category, items: selected });
    }
  }

  return {
    tier,
    reservation_date,
    guest_count,
    special_notes,
    dishes: menuCategories,
    created_at: new Date().toISOString(),
  };
}

export function getTierLabel(tier: number): string {
  const labels: Record<number, string> = {
    10000: "¥10,000",
    30000: "¥30,000",
    50000: "¥50,000",
    100000: "¥100,000",
  };
  return labels[tier] || `¥${tier.toLocaleString()}`;
}

export function getMenuSummary(menu: Menu): string {
  const total = menu.dishes.reduce((sum, cat) => sum + cat.items.length, 0);
  return `${getTierLabel(menu.tier)} コース · ${total}品 · ${menu.guest_count}名様`;
}
