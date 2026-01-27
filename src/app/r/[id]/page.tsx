import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ResultClient from "./ResultClient";
import { PROFILES } from "@/lib/profiles";

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
    .select("id,type_code,ch,dd,answers,mission")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  const profile = (PROFILES as any)[data.type_code] || (PROFILES as any)["HD"];

  return (
    <ResultClient
      id={data.id}                 // ✅ UUID만
      title={`한열조습 좌표 테스트 - 나는 ${profile.nameKo} (${profile.nameEn}).`}
      mission={data.mission || profile.mission || "오늘은 물부터 채우고, 속도를 한 단계 낮춰보세요."}
      hashtagText={"#한열조습\n#체질테스트"}
      // 필요한 props만 유지
    />
  );
}
