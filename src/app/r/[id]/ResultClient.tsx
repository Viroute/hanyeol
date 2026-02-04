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
    .replace(/\b[a-z0-9.-]+\.(?:vercel\.app|com|net|org|kr)(?:\/\S*)?/gi, "")
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
    
    // Google Analytics 추적
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
    return `${cleanCaption}\n\n${shareUrl}`;
  }, [cleanCaption, shareUrl]);

  // 공유하기 (네이티브 공유 팝업)
  async function handleShare() {
    if (!shareUrl) {
      alert("공유 링크를 만들 수 없습니다.");
      return;
    }

    // Web Share API 지원 확인 (모든 모바일 브라우저)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `한열조습 체질 테스트 - ${title}`,
          text: cleanCaption,
          url: shareUrl,
        });
      } catch (err: any) {
        // 사용자가 취소한 경우는 무시
        if (err.name !== 'AbortError') {
          // 공유 실패 시 복사로 폴백
          await copyToClipboard(message);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } else {
      // Web Share API 미지원 (데스크톱) → 복사
      await copyToClipboard(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          친구들에게 공유해보세요!
        </h3>

        {/* 공유하기 버튼 (네이티브 팝업) */}
        <button
          onClick={handleShare}
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          {copied ? (
            <>
              <span className="text-xl">✅</span>
              복사 완료!
            </>
          ) : (
            <>
              <span className="text-xl">📤</span>
              공유하기
            </>
          )}
        </button>

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
