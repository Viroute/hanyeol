import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { PROFILES } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type OGProps = {
  params: Promise<{ id: string }>;
};

function fmt(n: number) {
  return `${n >= 0 ? "+" : ""}${n}`;
}

export default async function OG({ params }: OGProps) {
  // ⭐ Next 16 / next-og에서는 params가 Promise로 들어옴
  const { id } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // 환경변수 누락 방어
  if (!url || !anon) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px",
            backgroundColor: "black",
            color: "white",
          }}
        >
          <div style={{ display: "flex", fontSize: 44, fontWeight: 900 }}>
            ❌ OG 환경변수 누락
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 26, opacity: 0.8 }}>
            NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 없습니다.
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Edge에서 확실히 동작하도록 여기서 직접 client 생성
  const sb = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let data: any = null;
  let errMsg: string | null = null;

  try {
    const { data: d, error } = await sb
      .from("surveys")
      .select("id, type_code, ch, dd")
      .eq("id", id)
      .maybeSingle(); // single 대신 maybeSingle

    data = d;
    errMsg = error ? error.message : null;
  } catch (e: any) {
    errMsg = e?.message ?? String(e);
  }

  const typeCode = data?.type_code as string | undefined;
  const p = typeCode ? PROFILES[typeCode as keyof typeof PROFILES] : null;

  const title = p?.nameKo ?? "한열조습 좌표 테스트";
  const emoji = p?.emoji ?? "🧭";
  const tagline = p?.tagline ?? "내 몸 타입을 좌표로 확인해보세요.";

  const ch = typeof data?.ch === "number" ? data.ch : 0;
  const dd = typeof data?.dd === "number" ? data.dd : 0;


  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "black",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, opacity: 0.7 }}>
          🧭 한열조습 좌표 테스트
        </div>

        <div style={{ display: "flex", marginTop: 24, fontSize: 72, fontWeight: 900 }}>
          {emoji} {title}
        </div>

        <div style={{ display: "flex", marginTop: 20, fontSize: 34, opacity: 0.9 }}>
          “{tagline}”
        </div>

        <div style={{ display: "flex", marginTop: 36, fontSize: 26, opacity: 0.75 }}>
          좌표: CH {fmt(ch)} / DD {fmt(dd)}
        </div>

        <div style={{ display: "flex", marginTop: 40, fontSize: 22, opacity: 0.6 }}>
          링크를 열면 “오늘 할 일”까지 확인할 수 있어요.
        </div>

  
      </div>
    ),
    { ...size }
  );
}
