"use client";

import { useState } from "react";
import { SHORT_QUESTIONS } from "@/lib/shortSurvey";

const labels = ["전혀 아니다", "거의 없다", "가끔", "자주", "거의 항상"];

export default function ShortSurveyPage() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const q = SHORT_QUESTIONS[idx];
  const progress = Math.round((idx / SHORT_QUESTIONS.length) * 100);
  const canNext = answers[q.id] !== undefined;

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <div className="text-sm text-gray-600">진행률 {progress}%</div>
      <div className="mt-3 h-2 rounded bg-gray-200">
        <div className="h-2 rounded bg-black" style={{ width: `${progress}%` }} />
      </div>

      <h1 className="mt-6 text-xl font-bold">60초 테스트</h1>

      <div className="mt-6 rounded-2xl border p-5">
        <div className="text-xs text-gray-500 mb-2">
          Q{idx + 1}/{SHORT_QUESTIONS.length}
        </div>
        <div className="text-base font-semibold leading-relaxed">{q.text}</div>

        <div className="mt-4 space-y-2">
          {labels.map((lb, v) => (
            <button
              key={lb}
              className={[
                "w-full text-left rounded-xl border p-3",
                answers[q.id] === v ? "border-black" : "border-gray-200",
              ].join(" ")}
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: v }))}
            >
              {v}. {lb}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          className="flex-1 rounded-xl border p-3 disabled:opacity-40"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          이전
        </button>

        {idx < SHORT_QUESTIONS.length - 1 ? (
          <button
            className="flex-1 rounded-xl bg-black text-white p-3 disabled:opacity-40"
            disabled={!canNext}
            onClick={() => setIdx((i) => i + 1)}
          >
            다음
          </button>
        ) : (
          <button
            className="flex-1 rounded-xl bg-black text-white p-3 disabled:opacity-40"
            disabled={!canNext}
            onClick={async () => {
              const res = await fetch("/api/submit-short", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers }),
              });
              if (!res.ok) {
                alert("저장에 실패했습니다. 다시 시도해주세요.");
                return;
              }
              const data = await res.json();
              location.href = `/r/${data.id}`;
            }}
          >
            결과 보기
          </button>
        )}
      </div>

      <div className="mt-8 text-xs text-gray-500">
        최근 3개월 기준으로 답변하면 정확도가 올라갑니다.
      </div>
    </main>
  );
}
