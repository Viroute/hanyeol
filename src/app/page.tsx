import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* 로고/브랜드 영역 */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <div className="text-5xl mb-4">🧭</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
              몸도 성향이 있다면??
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              한·열·조·습으로 1분만에 알아보는<br/>
              나만의 몸 타입 리포트
            </p>
          </div>
        </div>

        {/* 메인 CTA 카드 */}
        <Link 
          href="/short"
          className="block group"
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="rounded-2xl bg-white dark:bg-gray-900 p-8">
              {/* 배지 */}
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
                ⚡ 2분 완성
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  몸 타입 테스트
                </h2>
                <div className="text-3xl group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                32문항 · 무료 · 공유 최적화
              </p>
              
              {/* 특징 */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-lg">❄️</span>
                  <span>한열 체크</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-lg">💧</span>
                  <span>조습 분석</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-lg">🎯</span>
                  <span>맞춤 조언</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-lg">📱</span>
                  <span>간편 공유</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* 정밀 테스트 - 주석 처리로 숨김 (나중에 활성화 가능) */}
        {/* 
        <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 opacity-60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              정밀 테스트
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              준비중
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            60문항 · 임상/AI 학습용
          </p>
        </div>
        */}

        {/* 하단 안내 */}
        <div className="mt-12 space-y-4">
          <div className="text-center text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
            본 테스트는 의료행위가 아닌,<br/>
            몸의 경향을 이해하기 위한 자기점검 도구입니다.
          </div>
          
          {/* 청수연 브랜딩 */}
          <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-400 dark:text-gray-600 mb-1">
              Powered by
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              청수연 淸水淵
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 italic">
              조화와 균형
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
