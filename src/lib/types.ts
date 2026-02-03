export type Quadrant = "CD" | "CH" | "HD" | "HH";
// CD: Cold+Dry(한조), CH: Cold+Damp(한습), HD: Heat+Dry(조열), HH: Heat+Damp(습열)

export type ResultProfile = {
  code: Quadrant;
  nameKo: string;
  nameEn: string;
  emoji: string;
  tagline: string;  // “너라서 그렇다” 한 줄
  todayTip: string; // “오늘 할 일” 한 줄
};

export const PROFILES = {
  // 🔥🌵 불꽃 사막형 (열 + 조)
  HD: {
    code: "HD",
    nameKo: "불꽃 사막형",
    nameEn: "Fire Desert",
    emoji: "🔥🌵",
    definition:
      "불꽃처럼 에너지는 강하지만, 수분과 휴식이 늦게 따라오는 기후대형 몸",
    warning:
      "과로와 카페인은 사막의 불을 더 키웁니다",
    mission:
      "물부터 채우고, 속도를 한 단계 낮추세요",
    color: "#E25822", // 불꽃 오렌지
  },

  // 🔥🌴 열대 정글형 (열 + 습)
  HH: {
    code: "HH",
    nameKo: "열대 정글형",
    nameEn: "Tropical Jungle",
    emoji: "🔥🌴",
    definition:
      "에너지가 넘쳐 흐르지만, 과열과 정체가 쉽게 생기는 기후대형 몸",
    warning:
      "과식·야식·스트레스는 정글을 더 복잡하게 만듭니다",
    mission:
      "가볍게 땀을 내고, 몸을 비워내세요",
    color: "#1F8A4C", // 딥그린
  },

  // ❄️💧 북극 늪지형 (한 + 습)
  CH: {
    code: "CH",
    nameKo: "북극 늪지형",
    nameEn: "Arctic Swamp",
    emoji: "❄️💧",
    definition:
      "수분은 많지만 흐르지 못해, 차갑게 고여 있는 기후대형 몸",
    warning:
      "찬 음식과 움직임 부족은 늪을 더 깊게 만듭니다",
    mission:
      "따뜻한 음식과 가벼운 움직임으로 순환을 시작하세요",
    color: "#4A90E2", // 쿨 블루
  },

  // ❄️🌬 시베리아 고원형 (한 + 조)
  CD: {
    code: "CD",
    nameKo: "시베리아 고원형",
    nameEn: "Siberian Plateau",
    emoji: "❄️🌬",
    definition:
      "맑고 차분하지만, 쉽게 메마르고 고갈되는 기후대형 몸",
    warning:
      "수면 부족과 긴장은 고원을 더 차갑게 만듭니다",
    mission:
      "따뜻함과 충분한 휴식으로 기반을 채우세요",
    color: "#B0BEC5", // 아이스 그레이
  },
} as const;
