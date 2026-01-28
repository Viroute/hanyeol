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
  if (!text) return "";
  
  return text
    // 1. https:// 또는 http:// 로 시작하는 모든 URL 제거
    .replace(/https?:\/\/[^\s]+/gi, "")
    // 2. www.로 시작하는 URL 제거
    .replace(/www\.[^\s]+/gi, "")
    // 3. 도메인 형태 제거 (xxx.xxx.xxx/...)
    .replace(/[a-z0-9-]+\.[a-z0-9-]+\.[a-z]+(?:\/[^\s]*)?/gi, "")
    // 4. vercel.app 관련 모든 패턴 제거
    .replace(/[^\s]*vercel\.app[^\s]*/gi, "")
    // 5. /r/uuid 패턴 제거
    .replace(/\/r\/[a-f0-9-]+/gi, "")
    // 6. 연속된 빈 줄 정리
    .replace(/\n{3,}/g, "\n\n")
    // 7. 앞뒤 공백 제거
    .trim();
}

async function copyToClipboard(text: string) {
  try {
    // 1) 표준 Clipboard API (HTTPS 환경)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API failed, using fallback", err);
  }

  // 2) 폴백 (HTTP, 카카오톡 인앱 브라우저 등)
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    
    // iOS 대응
    const range = document.createRange();
    range.selectNodeContents(ta);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    ta.setSelectionRange(0, 999999);
    const success = document.execCommand("copy");
    document.body.removeChild(ta);
    return success;
  } catch (err) {
    console.error("Fallback copy failed", err);
    return false;
  }
}

// 카카오톡 인앱 브라우저 감지
function isKakaoTalkBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('kakaotalk');
}

// 모바일 감지
function isMobile() {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
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
  const [shareMethod, setShareMethod] = useState<string>("");

  // 1. UUID만 엄격하게 추출
  const uuid = useMemo(() => extractUuidStrict(id), [id]);

  // 2. URL 생성 - origin만 사용 (중복 방지)
  const shareUrl = useMemo(() => {
    if (!uuid) return null;
    if (typeof window === 'undefined') return null;
    
    // window.location.origin만 사용해서 깔끔하게 생성
    const origin = window.location.origin; // https://hanyeol.vercel.app
    return `${origin}/r/${uuid}`;
  }, [uuid]);

  // 3. 캡션 조립 - title과 mission 중복 제거
  const rawCaption = useMemo(() => {
    const parts = [
      title?.trim(),
      mission ? `오늘 미션: "${mission}"` : "",
      hashtagText?.trim(),
    ].filter(Boolean);
    return parts.join("\n");
  }, [title, mission, hashtagText]);

  // 4. 캡션에서 모든 링크/도메인 제거
  const cleanCaption = useMemo(() => stripLinks(rawCaption), [rawCaption]);

  // 5. 최종 메시지 - 캡션 + URL (한 번만)
  const message = useMemo(() => {
    if (!shareUrl) return cleanCaption;
    return `${cleanCaption}\n\n${shareUrl}`;
  }, [cleanCaption, shareUrl]);

  async function handleCopy() {
    if (!shareUrl) {
      alert("공유 링크를 만들 수 없습니다.");
      return;
    }

    // 디버깅: 복사될 내용 확인
    console.log("=== 공유 디버깅 ===");
    console.log("원본 ID:", id);
    console.log("추출된 UUID:", uuid);
    console.log("생성된 URL:", shareUrl);
    console.log("최종 메시지:", message);
    console.log("==================");

    const success = await copyToClipboard(message);
    
    if (success) {
      setCopied(true);
      
      // 카카오톡 인앱 브라우저인 경우 안내 메시지
      if (isKakaoTalkBrowser()) {
        setShareMethod("kakao");
        alert("링크가 복사되었습니다!\n카카오톡 대화방에서 길게 눌러 붙여넣기 해주세요.");
      } else {
        setShareMethod("default");
      }
      
      setTimeout(() => {
        setCopied(false);
        setShareMethod("");
      }, 2000);
    } else {
      alert("복사에 실패했습니다. 다시 시도해주세요.");
    }
  }

  // Web Share API 사용 (모바일 네이티브 공유)
  async function handleNativeShare() {
    if (!shareUrl) {
      alert("공유 링크를 만들 수 없습니다.");
      return;
    }

    if (!navigator.share) {
      // Web Share API 미지원 시 복사로 대체
      handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: title,
        text: cleanCaption,
        url: shareUrl,
      });
    } catch (err: any) {
      // 사용자가 취소한 경우 무시
      if (err.name !== 'AbortError') {
        console.error("Share failed", err);
        // 실패 시 복사로 대체
        handleCopy();
      }
    }
  }

  const canUseNativeShare = typeof window !== 'undefined' && 
    navigator.share && 
    isMobile();

  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-gray-600 mb-3">
          {canUseNativeShare 
            ? "친구들에게 공유해보세요!" 
            : "링크를 복사해서 친구들에게 공유해보세요!"}
        </div>

        <div className="space-y-2">
          {canUseNativeShare ? (
            // 모바일: 네이티브 공유 버튼
            <button
              onClick={handleNativeShare}
              className="w-full rounded-xl bg-black text-white py-3.5 font-semibold hover:bg-gray-800 transition-colors"
            >
              📤 공유하기
            </button>
          ) : (
            // 데스크톱 or Web Share API 미지원: 복사 버튼
            <button
              onClick={handleCopy}
              className="w-full rounded-xl bg-black text-white py-3.5 font-semibold hover:bg-gray-800 transition-colors"
            >
              {copied ? "✅ 복사 완료!" : "📋 링크 복사"}
            </button>
          )}

          {/* 카카오톡 브라우저 전용 안내 */}
          {isKakaoTalkBrowser() && (
            <div className="text-xs text-gray-500 p-3 bg-yellow-50 rounded-lg">
              💡 <strong>카카오톡에서 공유하는 법:</strong><br/>
              1. 위 버튼을 눌러 링크 복사<br/>
              2. 카카오톡 대화방으로 이동<br/>
              3. 메시지 입력창을 길게 눌러 "붙여넣기"
            </div>
          )}
        </div>

        {/* 복사될 내용 미리보기 */}
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            📋 복사될 내용 미리보기
          </summary>
          <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap break-all border border-gray-200">
{message}
          </pre>
          <div className="mt-2 text-[10px] text-gray-400">
            • UUID: {uuid}<br/>
            • URL: {shareUrl}
          </div>
        </details>
      </div>

      {/* 추가 액션 버튼들 */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => window.location.href = '/short'}
          className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          🔄 다시 테스트
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          🏠 홈으로
        </button>
      </div>
    </section>
  );
}
