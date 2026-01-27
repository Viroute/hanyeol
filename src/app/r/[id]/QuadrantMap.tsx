type Props = {
  ch: number; // -10 ~ +10 정도를 가정 (클램프 처리함)
  dd: number; // -10 ~ +10 정도를 가정 (클램프 처리함)
  color?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// -10..+10 -> 0..100%
function toPct(v: number) {
  const x = clamp(v, -10, 10);
  return ((x + 10) / 20) * 100;
}

export default function QuadrantMap({ ch, dd, color = "#111827" }: Props) {
  const x = toPct(ch);          // 한(-) -> 좌 / 열(+) -> 우
  const y = 100 - toPct(dd);    // 조(-) -> 상 / 습(+) -> 하 (화면 좌표계 반전)

  return (
    <div className="mt-4 rounded-2xl border p-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-gray-500">내 몸 지도</div>
          <div className="text-sm font-semibold">한열(좌↔우) × 조습(상↔하)</div>
        </div>
        <div className="text-xs text-gray-500">
          CH {ch >= 0 ? "+" : ""}{ch} / DD {dd >= 0 ? "+" : ""}{dd}
        </div>
      </div>

      <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-xl bg-white">
        {/* 격자 */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="border-r border-b bg-gray-50" />
          <div className="border-b bg-gray-50" />
          <div className="border-r bg-gray-50" />
          <div className="bg-gray-50" />
        </div>

        {/* 축 라벨 */}
        <div className="absolute left-3 top-3 text-xs text-gray-500">조(건조)</div>
        <div className="absolute left-3 bottom-3 text-xs text-gray-500">습(습함)</div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          한(차가움) ←
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          → 열(뜨거움)
        </div>

        {/* 현재 위치 점 */}
        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            backgroundColor: color,
          }}
          title={`CH ${ch}, DD ${dd}`}
        />

        {/* 중심점 */}
        <div
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300"
          style={{ left: "50%", top: "50%" }}
          title="중심(0,0)"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="rounded-lg bg-gray-50 p-2">
          <div className="font-semibold">❄️🌬 한·조</div>
          <div>시베리아 고원형</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <div className="font-semibold">🔥🌵 열·조</div>
          <div>불꽃 사막형</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <div className="font-semibold">❄️💧 한·습</div>
          <div>북극 늪지형</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <div className="font-semibold">🔥🌴 열·습</div>
          <div>열대 정글형</div>
        </div>
      </div>
    </div>
  );
}
