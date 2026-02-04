import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeCode = searchParams.get("typeCode");

    if (!typeCode) {
      return NextResponse.json({ error: "typeCode required" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // 전체 테스트 수
    const { count: totalCount } = await sb
      .from("surveys")
      .select("*", { count: "exact", head: true });

    // 이 체질의 수
    const { count: typeCount } = await sb
      .from("surveys")
      .select("*", { count: "exact", head: true })
      .eq("type_code", typeCode);

    if (!totalCount || totalCount === 0) {
      return NextResponse.json({ 
        percentage: 0, 
        total: 0 
      });
    }

    const percentage = Math.round((typeCount || 0) / totalCount * 100);

    return NextResponse.json({
      percentage,
      total: totalCount,
      typeCount
    });

  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ 
      error: "통계 조회 실패",
      message: error.message 
    }, { status: 500 });
  }
}
