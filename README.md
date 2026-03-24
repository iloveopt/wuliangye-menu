# 五粮液 AI排菜系统

A Next.js 14 AI-powered menu planning system for 五粮液東京 — a high-end Chinese restaurant in Tokyo. The system generates curated multi-course menus based on budget tier, guest count, allergens, and special requirements.

## Features

- AI-powered menu generation via Claude (claude-haiku-4-5)
- Four budget tiers: ¥10,000 / ¥30,000 / ¥50,000 / ¥100,000
- Allergen filtering
- Signature dish prioritization
- No-repeat ingredient logic per category
- Export menus as PNG via html2canvas
- Dark theme with gold accents
- Bilingual (Chinese/Japanese) dish display
- Mock fallback when no valid API key is provided

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4
- Claude API (claude-haiku-4-5)
- Supabase (optional persistence)
- Vitest + Testing Library
- html2canvas (client-side export)

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app works without a valid API key — it uses a smart mock fallback that generates real menus locally.

### 3. Run development server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Run tests

```bash
npm test
```

### 5. Build for production

```bash
npm run build
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| ANTHROPIC_API_KEY | Optional | Claude API key. Falls back to local mock if missing or invalid. |
| NEXT_PUBLIC_SUPABASE_URL | Optional | Supabase project URL for menu persistence |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Optional | Supabase anon key |

## Supabase Database Setup

```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 2,
  special_notes TEXT DEFAULT '',
  dishes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads" ON menus FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON menus FOR INSERT WITH CHECK (true);
```

## How to Add or Replace Dishes

All dish data lives in `src/data/dishes.ts`. Each dish follows the Dish interface:

```typescript
interface Dish {
  id: string;
  name: string;           // Chinese name
  name_ja: string;        // Japanese name
  category: "前菜" | "冷盘" | "汤" | "主菜" | "饭面" | "甜品";
  description: string;
  description_ja: string;
  ingredients: string[];        // First element = main ingredient for dedup logic
  suitable_tiers: number[];     // [10000, 30000, 50000, 100000]
  is_signature: boolean;
  allergens: string[];
  season?: "春" | "夏" | "秋" | "冬" | "全年";
}
```

Allergen codes: 甲壳类, 鱼类, 豚肉, 鸡蛋, 大豆, 小麦, 乳制品, 花生, 坚果, 芝麻

## Tier Configuration

| Tier     | 前菜 | 冷盘 | 汤 | 主菜 | 饭面 | 甜品 | Total |
|----------|------|------|----|------|------|------|-------|
| ¥10,000  | 2    | 1    | 1  | 3    | 1    | 1    | 9     |
| ¥30,000  | 3    | 2    | 1  | 4    | 1    | 2    | 13    |
| ¥50,000  | 4    | 2    | 2  | 5    | 1    | 2    | 16    |
| ¥100,000 | 5    | 3    | 2  | 6    | 2    | 3    | 21    |
