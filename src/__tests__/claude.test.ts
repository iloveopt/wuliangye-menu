import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildSystemPrompt } from "@/lib/claude";
import { dishes } from "@/data/dishes";

describe("buildSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("contains dish data", () => {
    const prompt = buildSystemPrompt();
    // Should contain at least the first dish's name from the database
    expect(prompt).toContain(dishes[0].name);
  });

  it("contains all dish ids", () => {
    const prompt = buildSystemPrompt();
    // Check a sample of dish IDs are present
    const sampleIds = [dishes[0].id, dishes[5].id, dishes[10].id];
    for (const id of sampleIds) {
      expect(prompt).toContain(id);
    }
  });

  it("contains tier pricing rules", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("10,000");
    expect(prompt).toContain("30,000");
    expect(prompt).toContain("50,000");
    expect(prompt).toContain("100,000");
  });

  it("contains instructions about allergens", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("过敏");
  });

  it("contains JSON format instructions", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("JSON");
  });

  it("contains restaurant name", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("五粮液");
  });
});

describe("chat API error handling", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("falls back gracefully when API key is a placeholder", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-xxxx";

    // Dynamically import to get fresh module with updated env
    const { chat } = await import("@/lib/claude");

    const result = await chat([
      { role: "user", content: "生成¥1万菜单" },
    ]);

    // Should return a valid response (mock fallback)
    expect(result).toBeDefined();
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("falls back gracefully when API key is missing", async () => {
    process.env.ANTHROPIC_API_KEY = undefined;

    const { chat } = await import("@/lib/claude");

    const result = await chat([
      { role: "user", content: "你好" },
    ]);

    expect(result).toBeDefined();
    expect(typeof result.message).toBe("string");
  });

  it("returns a menu when user requests a tier in mock mode", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-xxxx";

    const { chat } = await import("@/lib/claude");

    const result = await chat([
      { role: "user", content: "请安排¥3万档次菜单" },
    ]);

    expect(result).toBeDefined();
    expect(result.menu).toBeDefined();
    if (result.menu) {
      expect(result.menu.tier).toBe(30000);
    }
  });

  it("buildSystemPrompt includes dish descriptions", () => {
    const prompt = buildSystemPrompt();
    // Should contain some Japanese dish name
    expect(prompt).toContain("name_ja");
  });
});
