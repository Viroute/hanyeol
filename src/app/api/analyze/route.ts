import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { answers, typeCode, ch, dd } = body;

    if (!answers || !typeCode) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Gemini Pro 모델 (가장 안정적)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro"
    });

    // 프롬프트 생성
    const prompt = generatePrompt(answers, typeCode, ch, dd);

    // AI 분석 요청
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    return NextResponse.json({ 
      success: true,
      analysis: analysis 
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ 
      error: "AI 분석 실패",
      message: error.message 
    }, { status: 500 });
  }
}

function generatePrompt(answers: Record<string, number>, typeCode: string, ch: number, dd: number) {
  // 체질별 기본 정보
  const typeInfo: Record<string, string> = {
    "CD": "시베리아 고원형 (한+조): 차갑고 건조한 체질",
    "CH": "북극 늪지형 (한+습): 차갑고 습한 체질",
    "HD": "불꽃 사막형 (열+조): 뜨겁고 건조한 체질",
    "HH": "열대 정글형 (열+습): 뜨겁고 습한 체질",
  };

  // 답변 분석
  const answerSummary = analyzeAnswers(answers);

  return `당신은 한의학 전문가이자 체질 분석 전문가입니다.

# 사용자 체질 정보
- 체질 유형: ${typeInfo[typeCode] || "알 수 없음"}
- 한열 지수 (CH): ${ch} ${ch > 0 ? "(열 경향)" : ch < 0 ? "(한 경향)" : "(중립)"}
- 조습 지수 (DD): ${dd} ${dd > 0 ? "(습 경향)" : dd < 0 ? "(조 경향)" : "(중립)"}

# 사용자 답변 패턴
${answerSummary}

# 요청사항
위 정보를 바탕으로 **개인화된 상세 분석**을 작성해주세요. 
친근하고 공감하는 톤으로, 마치 한의사가 직접 상담하는 것처럼 작성하세요.

다음 형식으로 작성:

## 🔍 당신의 몸 상태 분석
[사용자의 답변 패턴에서 발견한 특징을 구체적으로 언급]
[3-4문장, 공감하며 시작]

## 🍽️ 맞춤 식습관 가이드
### 추천 식품
- [구체적인 음식 3-4가지, 각각 이유 포함]

### 피해야 할 음식
- [구체적인 음식 3-4가지, 각각 이유 포함]

### 식사 타이밍
- [아침/점심/저녁 각각 조언]

## 💪 생활습관 조언
### 운동
- [이 체질에 맞는 운동 종류와 강도]

### 수면
- [수면 패턴 조언, 취침/기상 시간]

### 일상 관리
- [계절별, 온도별 조언]

## ⚠️ 특별히 주의할 점
[이 체질이 조심해야 할 증상이나 상황 2-3가지]

## 💡 오늘부터 실천하기
[바로 시작할 수 있는 간단한 실천 3가지, 번호로]

---
**중요:** 
- 의학적 진단이 아님을 명시하지 말고 자연스럽게 작성
- 전문 용어는 최소화하고 쉬운 말로
- 각 섹션은 구체적이고 실용적으로
- 이모지 적절히 사용
- 총 700-900자 정도`;
}

function analyzeAnswers(answers: Record<string, number>): string {
  const summary: string[] = [];
  
  // 한(Cold) 분석
  const coldScores = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']
    .map(id => ({ id, score: answers[id] || 0 }))
    .filter(a => a.score >= 3);
  
  if (coldScores.length >= 3) {
    summary.push(`- 손발이 차갑고 추위를 많이 타는 편 (한 체질 특징)`);
  }

  // 열(Heat) 분석
  const heatScores = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']
    .map(id => ({ id, score: answers[id] || 0 }))
    .filter(a => a.score >= 3);
  
  if (heatScores.length >= 3) {
    summary.push(`- 얼굴이 쉽게 달아오르고 더위를 많이 탐 (열 체질 특징)`);
  }

  // 조(Dry) 분석
  const dryScores = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']
    .map(id => ({ id, score: answers[id] || 0 }))
    .filter(a => a.score >= 3);
  
  if (dryScores.length >= 3) {
    summary.push(`- 피부 건조, 변비 경향 (조 체질 특징)`);
  }

  // 습(Damp) 분석
  const dampScores = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
    .map(id => ({ id, score: answers[id] || 0 }))
    .filter(a => a.score >= 3);
  
  if (dampScores.length >= 3) {
    summary.push(`- 몸이 무겁고 부종 경향 (습 체질 특징)`);
  }

  return summary.length > 0 ? summary.join('\n') : '- 균형잡힌 답변 패턴';
}
