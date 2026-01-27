import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { PROFILES } from "@/lib/types";
import ResultClient from "./ResultClient";
import QuadrantMap from "./QuadrantMap";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function quadrantLabel(ch: number, dd: number) {
  const heatCold = ch >= 0 ? "열" : "한";
  const dampDry = dd >= 0 ? "습" : "조";
  return `${heatCold}${dampDry}`;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("surveys")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold">결과를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-white/70">
          링크가 잘못되었거나, 데이터가 아직 저장되지 않았을 수 있어요.
        </p>
        <Link className="mt-4 inline-block underline text-white" href="/">
          홈으로
        </Link>
      </main>
    );
  }

  const profile = PROFILES[data.type_code as keyof typeof PROFILES];
  const label = quadrantLabel(data.ch, data.dd);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/r/${data.id}`;
  const caption = `나는 ${profile.emoji} ${profile.nameKo} (${profile.nameEn}). 오늘 미션: “${profile.mission}” #한열조습 #체질테스트`;

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-xs text-white/60">한열조습 좌표 테스트</div>
          <h1 className="mt-1 text-2xl font-bold">당신의 몸 타입 리포트</h1>
        </div>

        <Link className="text-sm underline text-white/80" href="/">
          다시하기
        </Link>
      </header>

      {/* 타입 카드 (1스크린 핵심) */}
      <section
        className="mt-5 rounded-2xl border p-5"
        style={{ borderColor: profile.color }}
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl leading-none">{profile.emoji}</div>
          <div>
            <div className="text-lg font-semibold">{profile.nameKo}</div>
            <div className="text-sm text-white/60">{profile.nameEn}</div>
          </div>
        </div>

        {/* 정의 */}
        <div className="mt-4 rounded-xl bg-white/5 p-4">
          <div className="text-xs text-white/70">당신의 기후대 정의</div>
          <div className="mt-1 text-base font-semibold text-white">
            “{profile.definition}”
          </div>
        </div>

        {/* 경고 / 오늘 미션 */}
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">⚠ 경고</div>
            <div className="mt-1 font-semibold text-white">{profile.warning}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">🎯 오늘 미션</div>
            <div className="mt-1 font-semibold text-white">{profile.mission}</div>
          </div>
        </div>
      </section>

      {/* 공유 UX (캡션/링크 복사 + 공유하기) */}
      <ResultClient shareUrl={shareUrl} caption={caption} />

      {/* 지도는 접기/펼치기 (기본 접힘) */}
      <details className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <summary className="cursor-pointer select-none text-sm font-semibold text-white">
          🗺 내 몸 지도 보기 (한열×조습)
          <span className="ml-2 text-xs font-normal text-white/60">
            요약: {label} 편향 · CH {data.ch >= 0 ? "+" : ""}
            {data.ch} / DD {data.dd >= 0 ? "+" : ""}
            {data.dd}
          </span>
        </summary>

        <div className="mt-3">
          <QuadrantMap ch={data.ch} dd={data.dd} color={profile.color} />
        </div>

        <p className="mt-3 text-xs text-white/60">
          지도는 “좌↔우=한↔열”, “상↔하=조↔습” 기준입니다.
        </p>
      </details>

      <p className="mt-4 text-xs text-white/60">
        링크를 공유하면 상대방에게 미리보기 카드(OG 이미지)가 표시됩니다.
      </p>
    </main>
  );
}
