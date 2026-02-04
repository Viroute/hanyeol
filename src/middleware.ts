import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 간단한 in-memory rate limiter
// 프로덕션에서는 Redis 사용 권장
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// 설정
const RATE_LIMIT = 20; // 분당 20회
const WINDOW_MS = 60 * 1000; // 1분 (밀리초)

// 주기적으로 오래된 데이터 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000); // 1분마다 정리

export function middleware(request: NextRequest) {
  // API 경로만 제한
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // IP 주소 가져오기
  const ip = 
    request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') ||
    'anonymous';

  const now = Date.now();

  // Rate limit 체크
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // 새로운 윈도우 시작
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return NextResponse.next();
  }

  if (userLimit.count >= RATE_LIMIT) {
    // 제한 초과!
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Too many requests',
        message: '잠시 후 다시 시도해주세요.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((userLimit.resetTime - now) / 1000)),
        },
      }
    );
  }

  // 카운트 증가
  userLimit.count++;
  
  // 남은 횟수를 헤더로 전달 (디버깅용)
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT));
  response.headers.set('X-RateLimit-Remaining', String(RATE_LIMIT - userLimit.count));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(userLimit.resetTime / 1000)));
  
  return response;
}

// 어떤 경로에 적용할지 설정
export const config = {
  matcher: '/api/:path*', // 모든 /api/* 경로
};
