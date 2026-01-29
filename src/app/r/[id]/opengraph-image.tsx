/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PROFILES } from "@/lib/types";

export const runtime = "edge";
export const alt = "한열조습 좌표 테스트";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { id: string };

function toInt(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default async function Image({ params }: { params: Params }) {
  const id = params?.id;

  // id 없으면 기본 OG
  if (!id) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0b0b0d",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 72,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 28, opacity: 0.7 }}>한열조습 좌표 테스트</div>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>
              내 몸 타입을 좌표로 확인해보세요
            </div>
            <div style={{ fontSize: 30, opacity: 0.8 }}>
              링크를 열면 “오늘 할 일(미션)”까지 확인할 수 있어요.
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // DB에서 결과 읽기
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("surveys")
    .select("id, type_code, ch, dd")
    .eq("id", id)
    .single();

  const ch = toInt(data?.ch, 0);
  const dd = toInt(data?.dd, 0);
  const typeCode = (data?.type_code as string) || "HD";

  // profiles에서 타입 정보 (nameKo, nameEn, emoji, mission/definition 등)
  const p = (PROFILES as any)[typeCode] || (PROFILES as any)["HD"];
  const titleKo = p?.nameKo ?? "한열조습 좌표 테스트";
  const titleEn = p?.nameEn ?? "";
  const emoji = p?.emoji ?? "🧭";
  const mission = p?.mission ?? "오늘은 물부터 채우고, 속도를 한 단계 낮춰보세요.";
  const definition = p?.definition ?? "내 몸 타입을 좌표로 확인해보세요.";

  // OG 렌더러가 싫어하는 구조를 피하기 위해
  // - multi-child div에는 display:flex
  // - 텍스트는 한 div 안에서 줄바꿈/문장으로 처리
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0b0d",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* 상단 라벨 */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: "#1a1a1f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🧭
            </div>
            <div style={{ fontSize: 26, opacity: 0.75 }}>한열조습 좌표 테스트</div>
          </div>

          {/* 타이틀 */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -2 }}>
              {emoji} {titleKo}
            </div>
          </div>

          {/* 영문 서브 */}
          <div style={{ fontSize: 30, opacity: 0.75 }}>{titleEn}</div>

          {/* 설명/미션 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 8,
              maxWidth: 980,
            }}
          >
            <div style={{ fontSize: 34, opacity: 0.92, lineHeight: 1.25 }}>
              {definition}
            </div>
            <div style={{ fontSize: 30, opacity: 0.82, lineHeight: 1.25 }}>
              오늘 미션: {mission}
            </div>
          </div>

          {/* 좌표 */}
          <div style={{ fontSize: 30, opacity: 0.8, marginTop: 10 }}>
            좌표: CH {ch >= 0 ? `+${ch}` : `${ch}`} / DD {dd >= 0 ? `+${dd}` : `${dd}`}
          </div>

          {/* 하단 안내 */}
          <div style={{ fontSize: 26, opacity: 0.6 }}>
            링크를 열면 결과 카드(OG 이미지)가 자동 생성됩니다.
          </div>

          {/* 디버그 (배포 안정화되면 지워도 됨) */}
          <div style={{ fontSize: 22, opacity: 0.45 }}>
            {error ? `err=${String(error.message || error)}` : `id=${id}`}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
