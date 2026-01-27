import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase";
import { PROFILES } from "@/lib/types";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Props = {
  params: Promise<{ id: string }>;
};

function quadrantLabel(ch: number, dd: number) {
  const heatCold = ch >= 0 ? "열" : "한";
  const dampDry = dd >= 0 ? "습" : "조";
  return `${heatCold}${dampDry}`;
}

export default async function OpenGraphImage({ params }: Props) {
  const { id } = await params;

  // 1) DB에서 결과 가져오기
  let data: any = null;
  let errMsg: string | null = null;

  try {
    const sb = supabaseAdmin();
    const res = await sb.from("surveys").select("*").eq("id", id).single();
    data = res.data;
    if (res.error) errMsg = res.error.message;
  } catch (e: any) {
    errMsg = e?.message ?? "unknown error";
  }

  // 2) profile 결정
  const typeCode = data?.type_code as keyof typeof PROFILES | undefined;
  const p = typeCode ? PROFILES[typeCode] : undefined;

  const title = p?.nameKo ?? "한열조습 좌표 테스트";
  const emoji = p?.emoji ?? "🧭";
  const definition = p?.definition ?? "내 몸 타입을 좌표로 확인해보세요.";
  const mission = p?.mission ?? "오늘은 수분·휴식을 먼저 챙겨보세요.";

  const ch = typeof data?.ch === "number" ? data.ch : 0;
  const dd = typeof data?.dd === "number" ? data.dd : 0;
  const label = quadrantLabel(ch, dd);

  // OG는 Tailwind className을 직접 못 쓰고, style 객체를 써야 안정적
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          gap: 24,
        }}
      >
        {/* 상단 작은 라벨 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 22, opacity: 0.75 }}>🧭</div>
          <div style={{ fontSize: 22, opacity: 0.75 }}>
            한열조습 좌표 테스트
          </div>
        </div>

        {/* 메인 타이틀 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={{ fontSize: 64 }}>{emoji}</div>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>
            {title}
          </div>
        </div>

        {/* 정의 */}
        <div
          style={{
            fontSize: 34,
            opacity: 0.95,
            lineHeight: 1.25,
          }}
        >
          “{definition}”
        </div>

        {/* 좌표/요약 */}
        <div style={{ marginTop: 8, fontSize: 28, opacity: 0.85 }}>
          좌표: CH {ch >= 0 ? "+" : ""}
          {ch} / DD {dd >= 0 ? "+" : ""}
          {dd}
          <span style={{ marginLeft: 18, opacity: 0.75 }}>요약: {label}</span>
        </div>

        {/* 오늘 미션 */}
        <div
          style={{
            marginTop: 16,
            padding: "22px 26px",
            borderRadius: 18,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: 30,
            lineHeight: 1.25,
          }}
        >
          🎯 오늘 미션: {mission}
        </div>

        {/* 디버그(필요하면 유지, 싫으면 삭제 가능) */}
        <div style={{ marginTop: 14, fontSize: 18, opacity: 0.45 }}>
          id={id} {errMsg ? `err=${errMsg}` : "err=null"}
        </div>
      </div>
    ),
    size
  );
}
