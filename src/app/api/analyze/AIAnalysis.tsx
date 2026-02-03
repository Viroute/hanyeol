"use client";

import { useEffect, useState } from "react";

type Props = {
  surveyId: string;
  typeCode: string;
  ch: number;
  dd: number;
  answers: Record<string, number>;
};

export default function AIAnalysis({ surveyId, typeCode, ch, dd, answers }: Props) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, typeCode, ch, dd }),
        });

        if (!res.ok) throw new Error("API failed");

        const data = await res.json();
        setAnalysis(data.analysis);
      } catch (err) {
        console.error("AI Analysis Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [surveyId, typeCode, ch, dd, answers]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            AI가 당신의 체질을 분석하고 있어요...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          AI 분석을 불러올 수 없어요. 기본 결과는 위에서 확인하세요!
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 shadow-sm">
      {/* AI 배지 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
          ✨ AI 맞춤 분석
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          당신의 답변 패턴 기반
        </div>
      </div>

      {/* AI 분석 내용 */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div 
          className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatAnalysis(analysis) }}
        />
      </div>
    </div>
  );
}

// 마크다운 스타일 텍스트를 HTML로 변환
function formatAnalysis(text: string): string {
  return text
    // ## 헤더를 HTML로
    .replace(/^## (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">$1</h3>')
    // ### 서브헤더
    .replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">$4</h4>')
    // 리스트
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
    // 볼드
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 줄바꿈
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
