import { z } from "zod";
import type { Quadrant } from "./types";

export type Question = {
  id: string;
  axis: "C" | "H" | "D" | "W"; // Cold/Heat/Dry/Wet(Damp)
  text: string;
};

export const SHORT_QUESTIONS: Question[] = [
  // ========== Cold (한) 8문항 ==========
{ id: "C1", axis: "C", text: "여름에도 배는 따뜻해야 편하다." },
{ id: "C2", axis: "C", text: "에어컨 바람을 오래 맞으면 금방 지친다." },
{ id: "C3", axis: "C", text: "손발이 차가워 양말을 자주 찾는다." },
{ id: "C4", axis: "C", text: "찬 음료를 마시면 속이 바로 불편해진다." },
{ id: "C5", axis: "C", text: "아침에 몸이 쉽게 풀리지 않고 굳어 있는 느낌이다." },
{ id: "C6", axis: "C", text: "따뜻한 국물이나 차를 마시면 컨디션이 좋아진다." },
{ id: "C7", axis: "C", text: "배나 허리가 차갑게 느껴질 때가 많다." },
{ id: "C8", axis: "C", text: "겨울보다 냉방이 강한 실내가 더 힘들다." },

  // ========== Heat (열) 8문항 ==========
{ id: "H1", axis: "H", text: "스트레스를 받으면 얼굴이 먼저 달아오른다." },
{ id: "H2", axis: "H", text: "가만히 있어도 몸이 화끈거리는 느낌이 있다." },
{ id: "H3", axis: "H", text: "조금만 움직여도 얼굴이 쉽게 붉어진다." },
{ id: "H4", axis: "H", text: "밤에 열감 때문에 이불을 걷어차는 경우가 있다." },
{ id: "H5", axis: "H", text: "더운 실내에서는 집중력이 크게 떨어진다." },
{ id: "H6", axis: "H", text: "매운 음식이나 술을 마시면 얼굴이 금방 빨개진다." },
{ id: "H7", axis: "H", text: "목이나 가슴 쪽에서 열이 올라오는 느낌이 있다." },
{ id: "H8", axis: "H", text: "물을 자주 찾는데도 몸이 건조하다기보다 뜨겁다." },

  // ========== Dry (조) 8문항 ==========
{ id: "D1", axis: "D", text: "샤워하고 나오면 바로 보습제를 찾는다." },
{ id: "D2", axis: "D", text: "입술이 자주 갈라지거나 각질이 생긴다." },
{ id: "D3", axis: "D", text: "눈이 건조해서 자주 비비게 된다." },
{ id: "D4", axis: "D", text: "화장이 들뜨거나 피부가 금방 당긴다." },
{ id: "D5", axis: "D", text: "물을 충분히 마셔도 입이 마른 느낌이 있다." },
{ id: "D6", axis: "D", text: "변이 단단하거나 배변이 불편한 편이다." },
{ id: "D7", axis: "D", text: "목이 건조해서 헛기침을 자주 한다." },
{ id: "D8", axis: "D", text: "겨울이나 환절기에 피부 컨디션이 급격히 나빠진다." },

  // ========== Damp/Wet (습) 8문항 ==========
{ id: "W1", axis: "W", text: "밀가루나 기름진 음식을 먹으면 몸이 무거워지는 느낌이 있다." },
{ id: "W2", axis: "W", text: "아침에 일어나면 얼굴이나 몸이 잘 붓는다." },
{ id: "W3", axis: "W", text: "습하거나 비 오는 날에는 컨디션이 떨어진다." },
{ id: "W4", axis: "W", text: "식사 후 몸이 나른하고 졸리다." },
{ id: "W5", axis: "W", text: "땀이 나면 끈적거리는 느낌이 강하다." },
{ id: "W6", axis: "W", text: "두피나 피부가 쉽게 번들거린다." },
{ id: "W7", axis: "W", text: "몸이 개운하지 않고 무거운 느낌이 자주 든다." },
{ id: "W8", axis: "W", text: "물을 많이 마시면 몸이 가벼워지기보다 더 붓는 느낌이 있다." },
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
