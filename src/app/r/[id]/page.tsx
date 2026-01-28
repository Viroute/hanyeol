import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ResultClient from "./ResultClient";
import { PROFILES } from "@/lib/profiles";
import QuadrantMap from "./QuadrantMap";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const resolved = await Promise.resolve(params as any);
  const id = resolved?.id;

  if (!id) return notFound();

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("surveys")
    .select("id,type_code,ch,dd,answers")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  const profile = (PROFILES as any)[data.type_code] || (PROFILES as any)["HD"];

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-sm text-gray-500 mb-2">나의 체질은</div>
        <div className="text-5xl mb-3">{profile.emoji}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {profile.nameKo}
        </h1>
        <div className="text-sm text-gray-600">{profile.nameEn}</div>
      </div>

      {/* 좌표 맵 */}
      <div className="mb-8">
        <QuadrantMap ch={data.ch} dd={data.dd} typeCode={data.type_code} />
      </div>

      {/* 프로필 카드 */}
      <div className="space-y-4 mb-8">
        {/* 설명 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs text-gray-500 mb-2 font-semibold">이런 몸이에요</div>
          <div className="text-base leading-relaxed text-gray-800">
            {profile.definition}
          </div>
        </div>

        {/* 주의사항 */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <div className="text-xs text-orange-600 mb-2 font-semibold">⚠️ 주의하세요</div>
          <div className="text-sm leading-relaxed text-gray-800">
            {profile.warning}
          </div>
        </div>

        {/* 오늘의 미션 */}
        <div 
          className="rounded-2xl border p-5 shadow-sm"
          style={{ 
            backgroundColor: `${profile.color}15`,
            borderColor: `${profile.color}40`
          }}
        >
          <div className="text-xs font-semibold mb-2" style={{ color: profile.color }}>
            💡 오늘의 미션
          </div>
          <div className="text-base font-medium leading-relaxed text-gray-800">
            {profile.mission}
          </div>
        </div>
      </div>

      {/* 공유 컴포넌트 - title 간소화 */}
      <ResultClient
        id={data.id}
        title={`나는 ${profile.nameKo}`}
        mission={profile.mission}
        hashtagText="#한열조습 #체질테스트"
      />

      {/* 하단 안내 */}
      <div className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
        본 테스트는 의료행위가 아닌,<br/>
        몸의 경향을 이해하기 위한 자기점검 도구입니다.
      </div>
    </main>
  );
}
