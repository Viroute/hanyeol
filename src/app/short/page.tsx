"use client";

import { useState } from "react";
import { SHORT_QUESTIONS } from "@/lib/shortSurvey";

const labels = ["전혀 아니다", "거의 없다", "보통", "자주", "거의 항상"];

export default function ShortSurveyPage() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const q = SHORT_QUESTIONS[idx];
  const progress = Math.round((idx / SHORT_QUESTIONS.length) * 100);
  const canNext = answers[q.id] !== undefined;

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-short", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      
      if (!res.ok) {
        throw new Error("Submit failed");
      }
      
      const data = await res.json();
      window.location.href = `/r/${data.id}`;
    } catch (error) {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto bg-white dark:bg-gray-950">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">60초 체질 테스트</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">{progress}%</div>
        </div>
        
        {/* 프로그레스 바 */}
        <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 질문 카드 */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Q{idx + 1} / {SHORT_QUESTIONS.length}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {q.axis === "C" ? "한(寒)" : 
             q.axis === "H" ? "열(熱)" : 
             q.axis === "D" ? "조(燥)" : "습(濕)"}
          </div>
        </div>
        
        <div className="text-lg font-semibold leading-relaxed text-gray-900 dark:text-gray-100 mb-6">
          {q.text}
        </div>

        {/* 답변 옵션 */}
        <div className="space-y-2.5">
          {labels.map((lb, v) => {
            const isSelected = answers[q.id] === v;
            return (
              <button
                key={lb}
                className={[
                  "w-full text-left rounded-xl border-2 p-4 transition-all duration-200",
                  isSelected
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md scale-[1.02]"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
                ].join(" ")}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: v }))}
              >
                <div className="flex items-center gap-3">
                  <div className={[
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected 
                      ? "border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-400" 
                      : "border-gray-300 dark:border-gray-600"
                  ].join(" ")}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{lb}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex gap-3">
        <button
          className="flex-1 rounded-xl border-2 border-gray-300 dark:border-gray-600 py-3.5 font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          ← 이전
        </button>

        {idx < SHORT_QUESTIONS.length - 1 ? (
          <button
            className="flex-1 rounded-xl bg-blue-500 dark:bg-blue-600 text-white py-3.5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            disabled={!canNext}
            onClick={() => setIdx((i) => i + 1)}
          >
            다음 →
          </button>
        ) : (
          <button
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white py-3.5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 transition-all shadow-lg"
            disabled={!canNext || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "제출 중..." : "결과 보기 🎯"}
          </button>
        )}
      </div>

      {/* 하단 안내 */}
      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        💡 최근 3개월 기준으로 답변하면 정확도가 높아집니다
      </div>
    </main>
  );
}
