"use client";

import { useMemo } from "react";
import type { Quadrant } from "@/lib/types";

export default function QuadrantMap({
  ch,
  dd,
  typeCode,
}: {
  ch: number;
  dd: number;
  typeCode: Quadrant;
}) {
  // 좌표를 -12~+12 범위로 정규화 (각 축 최대 3문항 × 4점 = 12)
  const normalizedCH = Math.max(-12, Math.min(12, ch));
  const normalizedDD = Math.max(-12, Math.min(12, dd));

  // SVG 좌표로 변환 (중심 150, 범위 ±100)
  const x = 150 + (normalizedCH / 12) * 100;
  const y = 150 - (normalizedDD / 12) * 100; // Y축 반전

  const quadrantColors: Record<Quadrant, string> = {
    HD: "#E25822", // 불꽃 오렌지
    HH: "#1F8A4C", // 딥그린
    CH: "#4A90E2", // 쿨 블루
    CD: "#B0BEC5", // 아이스 그레이
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-xs text-gray-500 mb-3 font-semibold">한열조습 좌표</div>
      
      <svg
        viewBox="0 0 300 300"
        className="w-full"
        style={{ maxWidth: "400px", margin: "0 auto", display: "block" }}
      >
        {/* 배경 사분면 */}
        <rect x="150" y="0" width="150" height="150" fill="#ffe5d9" opacity="0.3" />
        <rect x="150" y="150" width="150" height="150" fill="#d9f0e3" opacity="0.3" />
        <rect x="0" y="150" width="150" height="150" fill="#d9e8f7" opacity="0.3" />
        <rect x="0" y="0" width="150" height="150" fill="#e8ebf0" opacity="0.3" />

        {/* 축 */}
        <line
          x1="150"
          y1="0"
          x2="150"
          y2="300"
          stroke="#ddd"
          strokeWidth="2"
        />
        <line
          x1="0"
          y1="150"
          x2="300"
          y2="150"
          stroke="#ddd"
          strokeWidth="2"
        />

        {/* 축 라벨 */}
        <text x="275" y="155" fontSize="12" fill="#666" textAnchor="end">
          열
        </text>
        <text x="25" y="155" fontSize="12" fill="#666" textAnchor="start">
          한
        </text>
        <text x="155" y="20" fontSize="12" fill="#666" textAnchor="start">
          조
        </text>
        <text x="155" y="290" fontSize="12" fill="#666" textAnchor="start">
          습
        </text>

        {/* 사용자 포인트 */}
        <circle
          cx={x}
          cy={y}
          r="8"
          fill={quadrantColors[typeCode]}
          stroke="white"
          strokeWidth="3"
        />
        
        {/* 포인트 펄스 애니메이션 */}
        <circle
          cx={x}
          cy={y}
          r="8"
          fill={quadrantColors[typeCode]}
          opacity="0.4"
        >
          <animate
            attributeName="r"
            from="8"
            to="20"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.4"
            to="0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <div className="mt-4 text-center text-xs text-gray-500">
        한열: {ch > 0 ? "+" : ""}{ch} / 조습: {dd > 0 ? "+" : ""}{dd}
      </div>
    </div>
  );
}
