import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">한열조습 좌표 테스트</h1>
      <p className="mt-2 text-sm text-gray-600">
        60초 버전(공유/반복용)과 정밀 버전(연구/임상용)을 분리해 운영합니다.
      </p>

      <div className="mt-6 space-y-3">
        <Link className="block rounded-xl border p-4 hover:bg-gray-50" href="/short">
          <div className="font-semibold">60초 테스트</div>
          <div className="text-sm text-gray-600">12문항 · 공유 최적화</div>
        </Link>

        <div className="block rounded-xl border p-4 opacity-60">
          <div className="font-semibold">정밀 테스트(준비중)</div>
          <div className="text-sm text-gray-600">60문항 · 임상/AI 학습용</div>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-500">
        * 본 테스트는 의료행위가 아닌, 몸의 경향을 이해하기 위한 자기점검 도구입니다.
      </div>
    </main>
  );
}
