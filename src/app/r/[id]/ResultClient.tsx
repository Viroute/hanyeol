"use client";

import { useState } from "react";

export default function ResultClient({
  shareUrl,
  caption,
}: {
  shareUrl: string;
  caption: string;
}) {
  const [copied, setCopied] = useState<null | "link" | "caption">(null);

  async function copyText(kind: "link" | "caption") {
    const text = kind === "link" ? shareUrl : caption;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard 실패 시 fallback
      const ok = window.prompt("아래 텍스트를 복사해 주세요:", text);
      if (ok !== null) {
        setCopied(kind);
        setTimeout(() => setCopied(null), 1500);
      }
    }
  }

  async function share() {
    const title = "한열조습 좌표 테스트";
    const text = caption;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
      } else {
        await copyText("caption");
        await copyText("link");
        alert("이 기기에서는 공유 기능이 없어 캡션과 링크를 복사했어요.");
      }
    } catch {
      // 사용자가 공유창을 닫는 등은 에러로 잡힐 수 있음 → 무시
    }
  }

  return (
    <div className="mt-6">
      {/* 캡션 프리뷰 박스 */}
      <div className="rounded-2xl border p-4">
        <div className="text-xs text-gray-500">추천 캡션</div>
        <div className="mt-2 text-sm leading-6 whitespace-pre-wrap">{caption}</div>
      </div>

      {/* 버튼 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="rounded-xl bg-black text-white p-3 text-center"
          onClick={share}
        >
          공유하기
        </button>

        <button
          className="rounded-xl border p-3"
          onClick={() => copyText("caption")}
        >
          {copied === "caption" ? "캡션 복사됨 ✅" : "캡션 복사"}
        </button>

        <button
          className="col-span-2 rounded-xl border p-3"
          onClick={() => copyText("link")}
        >
          {copied === "link" ? "링크 복사됨 ✅" : "링크 복사"}
        </button>

        <div className="col-span-2 mt-1 text-xs text-gray-500">
          인스타/카톡은 <b>캡션 복사 → 링크 복사</b> 후 붙여넣으면 가장 빠릅니다.
        </div>
      </div>
    </div>
  );
}
