"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CTAButtons() {
  const searchParams = useSearchParams();
  const isShared = searchParams.get("shared") === "true";

  if (isShared) {
    // 공유 링크로 온 경우: "내 체질 알아보기"
    return (
      <div className="mb-8">
        <Link
          href="/?utm_source=result_page&utm_medium=cta&utm_campaign=shared_user"
          className="block w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 font-bold text-center transition-all shadow-lg"
        >
          🧪 내 체질 알아보기
        </Link>
      </div>
    );
  }

  // 직접 테스트한 경우: "다시 테스트하기"
  return (
    <div className="mb-8">
      <Link
        href="/short?utm_source=result_page&utm_medium=cta&utm_campaign=retry"
        className="block w-full rounded-xl border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 py-4 font-bold text-center transition-all"
      >
        🔄 다시 테스트하기
      </Link>
    </div>
  );
}
