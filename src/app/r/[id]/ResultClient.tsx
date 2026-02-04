"use client";

import { useMemo, useState } from "react";

function extractUuidStrict(raw: string) {
  if (!raw) return null;
  const m = raw.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return m?.[0] ?? null;
}

function stripLinks(text: string) {
  return (text || "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\b[a-z0-9.-]+\.(?:vercel\.app|com|net|org)(?:\/\S*)?/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
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

  const uuid = useMemo(() => extractUuidStrict(id), [id]);

  // 공유 URL (shared=true 포함)
  const shareUrl = useMemo(() => {
    if (!uuid) return null;
    const url = new URL(`/r/${uuid}`, window.location.origin);
    url.searchParams.set('shared', 'true');
    
    // Google Analytics 추적 파라미터 추가
    url.searchParams.set('utm_source', 'share');
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', 'body_type_test');
    
    return url.toString();
  }, [uuid]);

  const rawCaption = useMemo(() => {
    return `내 몸 타입은 ${title}.\n생각보다 나를 너무 잘 맞춰서 소름…`;
  }, [title]);

  const cleanCaption = useMemo(() => stripLinks(rawCaption), [rawCaption]);

  const message = useMemo(() => {
    if (!shareUrl) return cleanCaption;
    return `${cleanCaption}\n${shareUrl}`;
  }, [cleanCaption, shareUrl]);

  // 일반 복사
  async function onCopy() {
    if (!shareUrl) {
      alert("공유 링크를 만들 수 없습니다.");
      return;
    }
    await copyToClipboard(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  // 카카오톡 공유
  function onKakaoShare() {
    if (!shareUrl) {
      alert("공유 링크를 만들 수 없습니다.");
      return;
    }

    // 모바일 환경 체크
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 모바일: 카카오톡 앱 실행 (메시지에 링크 포함)
      const kakaoUrl = `kakaotalk://send?text=${encodeURIComponent(message)}`;
      window.location.href = kakaoUrl;
      
      // 카카오톡 앱이 없을 경우 대비 (1초 후 복사)
      setTimeout(() => {
        copyToClipboard(message).then(() => {
          alert("카카오톡 앱이 없어요. 링크가 복사되었습니다!");
        });
      }, 1000);
    } else {
      // 데스크톱: 복사만
      onCopy();
    }
  }

  // Web Share API (모바일 네이티브 공유)
  function onNativeShare() {
    if (!shareUrl) return;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: cleanCaption,
        url: shareUrl,
      }).catch(() => {
        // 취소하면 복사로 대체
        onCopy();
      });
    } else {
      onCopy();
    }
  }

  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          친구들에게 공유해보세요!
        </h3>

        <div className="space-y-3">
          {/* 카카오톡 공유 */}
          <button
            onClick={onKakaoShare}
            className="w-full rounded-xl bg-[#FEE500] hover:bg-[#FFE812] text-black py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-xl">💬</span>
            카카오톡으로 공유하기
          </button>

          {/* 일반 공유 (네이티브 or 복사) */}
          <button
            onClick={onNativeShare}
            className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-3.5 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? "✅ 복사 완료!" : "🔗 공유하기"}
          </button>
        </div>

        {/* 미리보기 */}
        <details className="mt-4">
          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            📋 공유될 내용 미리보기
          </summary>
          <pre className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {message}
          </pre>
        </details>
      </div>
    </section>
  );
}
