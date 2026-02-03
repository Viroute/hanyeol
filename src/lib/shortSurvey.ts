import { z } from "zod";
import type { Quadrant } from "./types";

export type Question = {
  id: string;
  axis: "C" | "H" | "D" | "W"; // Cold/Heat/Dry/Wet(Damp)
  text: string;
};

export const SHORT_QUESTIONS: Question[] = [
  // ========== Cold (한) 8문항 ==========
  { id: "C1", axis: "C", text: "손발이 항상 차가운 편이다." },
  { id: "C2", axis: "C", text: "추위를 남들보다 많이 탄다." },
  { id: "C3", axis: "C", text: "찬 음식을 먹으면 속이 불편해진다." },
  { id: "C4", axis: "C", text: "겨울이 여름보다 훨씬 힘들다." },
  { id: "C5", axis: "C", text: "냉방이 강한 곳에 오래 있으면 쉽게 피곤해진다." },
  { id: "C6", axis: "C", text: "따뜻한 음식을 먹으면 컨디션이 좋아진다." },
  { id: "C7", axis: "C", text: "손이나 발이 차가워 잠들기 어려운 적이 있다." },
  { id: "C8", axis: "C", text: "배가 차가운 느낌이 자주 든다." },

  // ========== Heat (열) 8문항 ==========
  { id: "H1", axis: "H", text: "얼굴이나 몸이 쉽게 달아오른다." },
  { id: "H2", axis: "H", text: "더위를 남들보다 많이 탄다." },
  { id: "H3", axis: "H", text: "여름이 겨울보다 훨씬 힘들다." },
  { id: "H4", axis: "H", text: "매운 음식을 먹으면 얼굴이 붉어진다." },
  { id: "H5", axis: "H", text: "밤에 열이 올라 잠들기 어렵다." },
  { id: "H6", axis: "H", text: "갈증이 자주 난다." },
  { id: "H7", axis: "H", text: "따뜻한 환경보다 시원한 환경이 편하다." },
  { id: "H8", axis: "H", text: "몸속에 열이 몰려 있는 느낌이 든다." },

  // ========== Dry (조) 8문항 ==========
  { id: "D1", axis: "D", text: "입이 자주 마른다." },
  { id: "D2", axis: "D", text: "피부가 쉽게 건조해진다." },
  { id: "D3", axis: "D", text: "변이 딱딱한 편이다." },
  { id: "D4", axis: "D", text: "변비가 자주 생긴다." },
  { id: "D5", axis: "D", text: "피부 각질이 잘 생긴다." },
  { id: "D6", axis: "D", text: "눈이 건조하다고 느낀다." },
  { id: "D7", axis: "D", text: "피부가 당기는 느낌이 자주 든다." },
  { id: "D8", axis: "D", text: "전반적으로 몸이 마른 느낌이다." },

  // ========== Damp/Wet (습) 8문항 ==========
  { id: "W1", axis: "W", text: "몸이 무겁고 처지는 느낌이 자주 든다." },
  { id: "W2", axis: "W", text: "땀이 많고 끈적하다." },
  { id: "W3", axis: "W", text: "비 오거나 습한 날씨에 컨디션이 나빠진다." },
  { id: "W4", axis: "W", text: "몸이 잘 붓는다." },
  { id: "W5", axis: "W", text: "아침에 몸이 무겁고 개운하지 않다." },
  { id: "W6", axis: "W", text: "피부나 두피에 유분이 많다." },
  { id: "W7", axis: "W", text: "속이 더부룩한 느낌이 자주 든다." },
  { id: "W8", axis: "W", text: "전반적으로 몸이 탁한 느낌이다." },
];

// answers 검증(0~4)
export const ShortAnswersSchema = z.record(
  z.string(),
  z.number().int().min(0).max(4)
);

export function scoreShort(answers: Record<string, number>) {
  let cold = 0, heat = 0, dry = 0, damp = 0;

  for (const q of SHORT_QUESTIONS) {
    const v = Number(answers[q.id] ?? 0);
    if (q.axis === "C") cold += v;
    if (q.axis === "H") heat += v;
    if (q.axis === "D") dry += v;
    if (q.axis === "W") damp += v;
  }

  const ch = heat - cold; // + heat / - cold
  const dd = damp - dry;  // + damp / - dry

  const type_code: Quadrant =
    ch >= 0 && dd >= 0 ? "HH"  // 열+습 (열대 정글형)
    : ch >= 0 && dd < 0 ? "HD"  // 열+조 (불꽃 사막형)
    : ch < 0 && dd >= 0 ? "CH"  // 한+습 (북극 늪지형)
    : "CD";                      // 한+조 (시베리아 고원형)

  return { ch, dd, type_code };
}
