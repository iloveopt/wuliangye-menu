import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { menuId } = body;

    // Export is handled client-side via html2canvas
    // This endpoint exists for future server-side export features
    return NextResponse.json({
      success: true,
      message: "Export initiated",
      menuId: menuId || null,
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Export endpoint ready. Use POST with menu data for export.",
  });
}
