import { NextRequest, NextResponse } from "next/server";
import { chat, ChatMessage } from "@/lib/claude";
import { Menu } from "@/lib/menu-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, currentMenu } = body as {
      messages: ChatMessage[];
      currentMenu?: Menu;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    const response = await chat(messages, currentMenu);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message: "申し訳ございません。エラーが発生しました。もう一度お試しください。",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
