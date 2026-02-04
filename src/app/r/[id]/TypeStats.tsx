"use client";

import { useEffect, useState } from "react";

type Props = {
  typeCode: string;
};

export default function TypeStats({ typeCode }: Props) {
  const [stats, setStats] = useState<{ percentage: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/stats?typeCode=${typeCode}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Stats error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [typeCode]);

  if (loading || !stats) return null;

  const typeName: Record<string, string> = {
    "CD": "시베리아 고원형",
    "CH": "북극 늪지형",
    "HD": "불꽃 사막형",
    "HH": "열대 정글형",
  };

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.percentage}%
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div className="font-semibold">
              전체의 {stats.percentage}%가
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              당신과 같은 {typeName[typeCode] || "체질"}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          총 {stats.total.toLocaleString()}명 테스트
        </div>
      </div>
    </div>
  );
}
