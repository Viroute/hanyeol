"use client";

import { useMemo, useState } from "react";

function normalizeId(raw: string) {
  // raw가 "https://hanyeol.vercel.app/r/UUID" 같은 형태로 들어와도 UUID만 뽑아냄
  const uuid =
    raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
  return uuid ?? raw; // 그래도 없으면 원본 사용
}

function getBaseUrl() {
  // 배포 환경에서는 NEXT_PUBLIC_BASE_URL을 쓰고, 없으면 현재 origin을 사용
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_BASE_URL || "https://hanyeol.vercel.app";
}

export default function ResultClient({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const resultId = useMemo(() => normalizeId(id), [id]);
  const shareUrl = useMemo(() => `${getBaseUrl()}/r/${resultId}`, [resultId]);

  async function onCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function onShare() {
    // ✅ 카카오/모바일에서 링크 인식이 확실하도록 "url" 필드에 넣고,
    // text에도 URL을 한 번 더 포함 (앱별 파서 차이 방어)
    const payload: ShareData = {
      title: title || "한열조습 좌표 테스트",
      text: `내 결과 확인하기 👉 ${shareUrl}`,
      url: shareUrl, // 이게 핵심
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // 사용자가 취소해도 여기로 올 수 있음 → 무시
      }
    }

    // WebShare 미지원/실패 시 복사로 폴백
    await onCopy();
    alert("공유를 지원하지 않는 환경이라 링크를 복사했어요.");
  }

  return (
    <div>
      <button onClick={onShare}>공유하기</button>
      <button onClick={onCopy}>{copied ? "복사됨!" : "링크 복사"}</button>

      {/* 디버그: 문제 재발하면 이걸로 id가 뭐로 들어오는지 바로 확인 가능 */}
      {/* <pre style={{ opacity: 0.6 }}>{JSON.stringify({ id, resultId, shareUrl }, null, 2)}</pre> */}
    </div>
  );
}
