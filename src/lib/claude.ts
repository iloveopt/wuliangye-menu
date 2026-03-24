import Anthropic from "@anthropic-ai/sdk";
import { dishes } from "@/data/dishes";
import { Menu, generateMenu } from "@/lib/menu-engine";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy-key",
  // Allow browser-like environments (needed for test environments like jsdom)
  dangerouslyAllowBrowser: true,
});

function buildSystemPrompt(): string {
  const dishesJson = JSON.stringify(dishes, null, 2);

  return `你是五粮液东京高端中餐厅的AI排菜系统助手。你帮助餐厅工作人员根据预算档次、客人人数和特殊需求安排菜单。

## 餐厅背景
五粮液东京是一家位于东京的顶级中餐厅，提供正宗中国高端料理，融合了川菜、粤菜、淮扬菜等各大菜系精华，专注于为日本高端客户提供极致的中华饮食体验。

## 菜品数据库
以下是餐厅所有菜品的完整数据：
${dishesJson}

## 价位档次规则
- ¥10,000: 前菜×2, 冷盘×1, 汤×1, 主菜×3, 饭面×1, 甜品×1（共9道）
- ¥30,000: 前菜×3, 冷盘×2, 汤×1, 主菜×4, 饭面×1, 甜品×2（共13道）
- ¥50,000: 前菜×4, 冷盘×2, 汤×2, 主菜×5, 饭面×1, 甜品×2（共16道）
- ¥100,000: 前菜×5, 冷盘×3, 汤×2, 主菜×6, 饭面×2, 甜品×3（共21道）

## 排菜原则
1. 根据预算档次选择 suitable_tiers 包含该价位的菜品
2. 优先选择 is_signature: true 的招牌菜
3. 同一类别中避免主要食材重复
4. 严格过滤客人的过敏原
5. 考虑季节性（season字段）
6. 荤素搭配均衡
7. 口味（麻辣/清淡/甜酸）搭配多样

## 响应格式
当用户要求生成菜单时，请返回JSON格式：
{
  "message": "说明文字（中文）",
  "action": "generate_menu",
  "menu_config": {
    "tier": 数字,
    "allergens": ["过敏原列表"],
    "guest_count": 数字,
    "reservation_date": "日期字符串",
    "special_notes": "备注"
  }
}

当只是聊天时，返回：
{
  "message": "回复内容",
  "action": null
}

请用中文回复，保持专业、热情的服务态度。`;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  menu?: Menu;
  action?: string;
}

function parseTierFromMessage(message: string): number | null {
  if (message.includes("10万") || message.includes("100000") || message.includes("100,000")) return 100000;
  if (message.includes("5万") || message.includes("50000") || message.includes("50,000")) return 50000;
  if (message.includes("3万") || message.includes("30000") || message.includes("30,000")) return 30000;
  if (message.includes("1万") || message.includes("10000") || message.includes("10,000")) return 10000;
  return null;
}

function createMockResponse(userMessage: string): ChatResponse {
  const tier = parseTierFromMessage(userMessage);

  if (tier || userMessage.includes("菜单") || userMessage.includes("排菜")) {
    const useTier = tier || 30000;
    const menu = generateMenu(useTier);
    return {
      message: `已为您生成${useTier === 10000 ? "¥10,000" : useTier === 30000 ? "¥30,000" : useTier === 50000 ? "¥50,000" : "¥100,000"}档次菜单，共${menu.dishes.reduce((s, c) => s + c.items.length, 0)}道菜品，均为本店精选。如需调整，请告知您的要求。`,
      menu,
      action: "generate_menu",
    };
  }

  return {
    message: "您好！我是五粮液AI排菜系统。我可以帮您根据预算档次（¥1万、¥3万、¥5万、¥10万）、客人人数和特殊要求安排菜单。请告诉我您的需求。",
    action: undefined,
  };
}

export async function chat(
  messages: ChatMessage[],
  currentMenu?: Menu
): Promise<ChatResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Check if API key is valid (not a placeholder)
  if (!apiKey || apiKey === "sk-ant-xxxx" || apiKey === "dummy-key" || apiKey.startsWith("sk-ant-xx")) {
    const lastUserMsg = messages.filter((m) => m.role === "user").pop();
    return createMockResponse(lastUserMsg?.content || "");
  }

  try {
    const systemPrompt = buildSystemPrompt();

    const contextMessages = currentMenu
      ? [
          ...messages,
          {
            role: "user" as const,
            content: `当前菜单信息：${JSON.stringify(currentMenu)}`,
          },
        ]
      : messages;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: systemPrompt,
      messages: contextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude API");
    }

    const text = content.text;

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        let menu: Menu | undefined;

        if (parsed.action === "generate_menu" && parsed.menu_config) {
          const { tier, allergens, guest_count, reservation_date, special_notes } =
            parsed.menu_config;
          menu = generateMenu(
            tier || 30000,
            allergens || [],
            reservation_date,
            guest_count || 2,
            special_notes || ""
          );
        }

        return {
          message: parsed.message || text,
          menu,
          action: parsed.action,
        };
      } catch {
        // Fall through to plain text response
      }
    }

    return { message: text };
  } catch (error) {
    console.error("Claude API error:", error);
    // Fallback to mock on API error
    const lastUserMsg = messages.filter((m) => m.role === "user").pop();
    return createMockResponse(lastUserMsg?.content || "");
  }
}

export { buildSystemPrompt };
