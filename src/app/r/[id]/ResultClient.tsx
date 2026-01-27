"use client";

import { useMemo, useState } from "react";

type ResultClientProps = {
  id: string; // UUID 또는 실수로 URL이 들어올 수도 있어 방어 처리함
  title?: string; // 있으면 사용, 없으면 기본값
  description?: string; // 있으면 사용, 없으면 기본값
};

function normalizeId(raw: string) {
  // raw가 "https://hanyeol.vercel.app/r/UUID" 같은 형태여도 UUID만 추출
  const uuid =
    raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
  return uuid ?? raw;
}

function getOrigin() {
  // 브라우저에서는 현재 origin이 가장 안전
  if (typeof window !== "undefined") return window.location.origin;
  // SSR fallback
  return process.env.NEXT_PUBLIC_BASE_URL || "https://hanyeol.vercel.app";
}

declare global {
  interface Window {
    Kakao?: any;
  }
}

async function loadKakaoSdk(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Kakao) return true;

  return await new Promise((resolve) => {
    const existing = document.querySelector('script[data-kakao-sdk="1"]');
    if (existing) return resolve(true);

    const s = document.createElement("script");
    s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    s.async = true;
    s.setAttribute("data-kakao-sdk", "1");
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

async function ensureKakaoReady(): Promise<boolean> {
  const ok = await loadKakaoSdk();
  if (!ok) return false;

  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key) return false;

  try {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(key);
    }
    return true;
  } catch {
    return false;
  }
}

export default function ResultClient({ id, title, description }: ResultClientProps) {
  const [copied, setCopied] = useState(false);

  const resultId = useMemo(() => normalizeId(id), [id]);
  const origin = useMemo(() => getOrigin(), []);
  const shareUrl = useMemo(() => `${origin}/r/${resultId}`, [origin, resultId]);
  const ogImageUrl = useMemo(() => `${origin}/r/${resultId}/opengraph-image`, [origin, resultId]);

  const shareTitle = title || "한열조습 좌표 테스트";
  const shareDesc = description || "내 몸 타입 결과를 확인해보세요.";

  async function onCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      alert("링크를 복사했어요. 카카오톡에 붙여넣기만 하면 됩니다.");
    } catch {
      // clipboard 실패 시 fallback
      window.prompt("아래 링크를 복사하세요:", shareUrl);
    }
  }

  async function onShareKakao() {
    const ready = await ensureKakaoReady();

    // SDK/키 준비 안되면 폴백: 링크 복사
    if (!ready) {
      await onCopyLink();
      return;
    }

    try {
      window.Kakao!.Share.sendDefault({
        objectType: "feed",
        content: {
          title: shareTitle,
          description: shareDesc,
          imageUrl: ogImageUrl, // ✅ 결과별 OG 이미지
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "결과 보기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } catch {
      // 예외 시에도 안전하게 링크 복사
      await onCopyLink();
    }
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onShareKakao}
        className="h-12 rounded-xl bg-[#FEE500] text-black font-semibold"
      >
        카카오로 공유
      </button>

      <button
        type="button"
        onClick={onCopyLink}
        className="h-12 rounded-xl border border-white/20 bg-white/5 text-white font-semibold"
      >
        {copied ? "복사됨!" : "링크 복사"}
      </button>
    </div>
  );
}
