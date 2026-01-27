"use client";

import { useMemo, useState } from "react";

function extractUuid(raw: string) {
  const m = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return m?.[0] ?? raw;
}

export default function ResultClient({
  id,
  caption,
}: {
  id: string;
  caption: string;
}) {
  const [copied, setCopied] = useState(false);

  // ✅ id는 혹시 URL이 들어와도 UUID만 뽑아서 안전하게
  const uuid = useMemo(() => extractUuid(id), [id]);

  // ✅ 배포/로컬 모두 현재 origin이 가장 정확함
  const baseUrl = useMemo(() => window.location.origin, []);

  // ✅ URL은 여기서 "딱 1번"만 생성
  const shareUrl = useMemo(() => `${baseUrl}/r/${uuid}`, [baseUrl, uuid]);

  // ✅ 카톡에 붙여넣을 최종 텍스트 (링크 1번만)
  const message = useMemo(() => `${caption}\n${shareUrl}`, [caption, shareUrl]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function onCopyLink() {
    await copy(shareUrl); // 링크만 복사
  }

  async function onCopyCaption() {
    await copy(message); // 캡션+링크 복사
  }

  async function onShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "한열조습 좌표 테스트",
          text: caption,
          url: shareUrl, // ✅ 카톡 링크 인식 핵심
        });
        return;
      } catch {
        // 취소/미지원 시 폴백
      }
    }

    // 공유 미지원이면 메시지 복사로 폴백
    await copy(message);
    alert("이 기기에서는 공유 기능이 없어 메시지를 복사했어요. 카톡에 붙여넣기 해주세요.");
  }

  return (
    <section className="mt-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60 mb-2">
          인스타/카톡은 ‘캡션 복사’ → 붙여넣기가 가장 빠릅니다.
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

        <p className="mt-3 text-xs text-white/60">
          링크를 공유하면 상대방에게 미리보기 카드(OG 이미지)가 표시됩니다.
        </p>

        {/* 디버그 (문제 해결되면 지워도 됨) */}
        {/* <pre className="mt-2 text-[10px] text-white/40">{JSON.stringify({ id, uuid, shareUrl }, null, 2)}</pre> */}
      </div>
    </section>
  );
}
