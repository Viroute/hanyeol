"use client";

import { useMemo, useState } from "react";

function extractUuidStrict(raw: string) {
  if (!raw) return null;

  // 어디에 있든 UUID만 뽑기
  const m = raw.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return m?.[0] ?? null;
}

function stripLinks(text: string) {
  return (text || "")
    // https://... 제거
    .replace(/https?:\/\/\S+/gi, "")
    // 스킴 없는 도메인도 제거 (hanyeol.vercel.app/.... 등)
    .replace(/\b[a-z0-9.-]+\.(?:vercel\.app|com|net|org)(?:\/\S*)?/gi, "")
    // 여러 줄 정리
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function copyToClipboard(text: string) {
  // 1) 표준 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // 2) 폴백 (일부 환경/권한 문제 대비)
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export default function ResultClient({
  id,
  title,
  mission,
  hashtagText,
}: {
  id: string;
  title: string;
  mission: string;
  hashtagText: string;
}) {
  const [copied, setCopied] = useState(false);

  // UUID만 “엄격하게” 추출 (실패하면 null)
  const uuid = useMemo(() => extractUuidStrict(id), [id]);

  // URL은 정식 URL 생성기로 생성 (중복/오염 방지)
  // 공유 링크에는 shared=true 추가 (AI 분석 숨김)
  const shareUrl = useMemo(() => {
    if (!uuid) return null;
    const url = new URL(`/r/${uuid}`, window.location.origin);
    url.searchParams.set('shared', 'true');
    return url.toString();
  }, [uuid]);

  // 캡션 조립: title + mission + hashtags
  const rawCaption = useMemo(() => {
    const parts = [
      title?.trim(),
      mission ? `오늘 미션: ${mission}` : "",
      hashtagText?.trim(),
    ].filter(Boolean);
    return parts.join("\n");
  }, [title, mission, hashtagText]);

  // caption 안에 링크가 섞여 있으면 제거 (중복 방지)
  const cleanCaption = useMemo(() => stripLinks(rawCaption), [rawCaption]);

  // 최종 복사 텍스트: “캡션 + 링크(1회)”
  const message = useMemo(() => {
    if (!shareUrl) return cleanCaption;
    return `${cleanCaption}\n${shareUrl}`;
  }, [cleanCaption, shareUrl]);

  async function onCopy() {
    if (!shareUrl) {
      alert("공유 링크를 만들 수 없습니다. (id가 UUID가 아닙니다)");
      return;
    }
    await copyToClipboard(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className="mt-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60 mb-2">
          MVP: 링크 복사만 제공합니다. (캡션+링크가 함께 복사됩니다)
        </div>

        <button
          onClick={onCopy}
          className="w-full rounded-xl bg-white text-black py-3 font-semibold"
        >
          {copied ? "복사됨 ✅" : "링크 복사 (캡션+링크)"}
        </button>

        {/* 필요하면 디버그 잠깐 켜서 확인 가능 */}
        {/* <pre className="mt-3 text-[10px] text-white/50">{JSON.stringify({ id, uuid, shareUrl }, null, 2)}</pre> */}
      </div>
    </section>
  );
}
