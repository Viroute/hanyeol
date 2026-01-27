import { z } from "zod";
import type { Quadrant } from "./types";

export type Question = {
  id: string;
  axis: "C" | "H" | "D" | "W"; // Cold/Heat/Dry/Wet(Damp)
  text: string;
};

export const SHORT_QUESTIONS: Question[] = [
  // Cold (3)
  { id: "C1", axis: "C", text: "냉방이 강한 곳에 오래 있으면 쉽게 피곤해진다." },
  { id: "C2", axis: "C", text: "찬 음료를 마시면 배가 불편해지거나 설사를 한다." },
  { id: "C3", axis: "C", text: "겨울이 여름보다 훨씬 힘들다." },

  // Heat (3)
  { id: "H1", axis: "H", text: "더운 날에는 얼굴이 쉽게 붉어지거나 열이 오른다." },
  { id: "H2", axis: "H", text: "매운 음식이나 술을 마시면 얼굴이 빨개진다." },
  { id: "H3", axis: "H", text: "밤에 몸이 달아올라 잠들기 어려운 날이 있다." },

  // Dry (3)
  { id: "D1", axis: "D", text: "세안 후 피부가 바로 당기는 느낌이 든다." },
  { id: "D2", axis: "D", text: "입술이 쉽게 트고 립밤이 자주 필요하다." },
  { id: "D3", axis: "D", text: "변이 딱딱하고 힘을 줘야 나오는 편이다." },

  // Damp/Wet (3)
  { id: "W1", axis: "W", text: "비 오거나 습한 날에 몸이 더 무겁다." },
  { id: "W2", axis: "W", text: "아침에 일어나도 개운하지 않다." },
  { id: "W3", axis: "W", text: "땀이 끈적하고 잘 마르지 않는다." },
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
    ch >= 0 && dd >= 0 ? "HH"
    : ch >= 0 && dd < 0 ? "HD"
    : ch < 0 && dd >= 0 ? "CH"
    : "CD";

  return { ch, dd, type_code };
}
