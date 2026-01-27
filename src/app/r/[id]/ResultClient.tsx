"use client";

import { useMemo, useState } from "react";

function extractUuidStrict(raw: string) {
  if (!raw) return null;

  // 1) 어디에 있든 UUID만 뽑기
  const m = raw.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return m?.[0] ?? null;
}

function stripUrls(text: string) {
  return (text || "").replace(/https?:\/\/\S+/gi, "").trim();
}

export default function ResultClient({
  id,
  caption,
}: {
  id: string;
  caption: string;
}) {
  const [copied, setCopied] = useState(false);

  // ✅ UUID만 “엄격하게” 추출 (실패하면 null)
  const uuid = useMemo(() => extractUuidStrict(id), [id]);

  // ✅ URL은 “정식 URL 생성기”로 생성 (절대 중복 안 됨)
  const shareUrl = useMemo(() => {
    if (!uuid) return null;
    return new URL(`/r/${uuid}`, window.location.origin).toString();
  }, [uuid]);

  // ✅ caption 안에 링크가 섞여 있으면 제거 (중복 방지)
  const cleanCaption = useMemo(() => stripUrls(caption), [caption]);

  // ✅ 카톡에 붙여넣을 최종 텍스트 (링크 1번만)
  const message = useMemo(() => {
    if (!shareUrl) return cleanCaption;
    return `${cleanCaption}\n${shareUrl}`;
  }, [cleanCaption, shareUrl]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function onCopyLink() {
    if (!shareUrl) {
      alert("공유 링크를 만들 수 없습니다. (id가 UUID가 아닙니다)");
      return;
    }
    await copy(shareUrl); // 링크만 복사
  }

  async function onCopyCaption() {
    if (!shareUrl) {
      await copy(cleanCaption);
      alert("링크를 만들 수 없어 캡션만 복사했어요.");
      return;
    }
    await copy(message); // 캡션+링크 복사
  }

  async function onShare() {
    // ✅ Web Share API가 있으면: url 필드를 사용 (카톡 링크 인식 최적)
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({
          title: "한열조습 좌표 테스트",
          text: cleanCaption,
          url: shareUrl,
        });
        return;
      } catch {
        // 사용자가 취소하거나 실패하면 폴백
      }
    }

    // ✅ 폴백: 메시지 복사
    await onCopyCaption();
    alert("이 기기에서는 공유가 제한될 수 있어 메시지를 복사했어요. 카톡에 붙여넣기 해주세요.");
  }

  return (
    <section className="mt-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60 mb-2">
          카톡/인스타는 ‘캡션 복사’ → 붙여넣기가 가장 안정적입니다.
        </div>

        <div className="flex gap-3">
          <button
            onClick={onShare}
            className="flex-1 rounded-xl bg-white text-black py-3 font-semibold"
          >
            공유하기
          </button>

          <button
            onClick={onCopyCaption}
            className="flex-1 rounded-xl border border-white/20 py-3 font-semibold"
          >
            {copied ? "캡션 복사됨 ✅" : "캡션 복사"}
          </button>
        </div>

        <button
          onClick={onCopyLink}
          className="mt-3 w-full rounded-xl border border-white/20 py-3 font-semibold"
        >
          링크 복사
        </button>

        {/* 디버그: 문제 해결될 때까지만 */}
        {/* <pre className="mt-3 text-[10px] text-white/50">{JSON.stringify({ id, uuid, shareUrl }, null, 2)}</pre> */}
      </div>
    </section>
  );
}
