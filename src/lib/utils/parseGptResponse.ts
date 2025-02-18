export interface ParsedSentence {
  title: string;
  before_versa_after_sentence: string;
  before_sentence: string;
  before_intent: string;
  after_sentence: string;
  after_detail: string;
  // DB 저장을 위한 추가 필드들
  meaning?: string | null;
  grammar?: string | null;
  expression?: string | null;
  before_intention?: string;  // 이전 코드와의 호환성을 위해
}

interface GptAnalysis {
  title: string;
  before_versa_after_sentence: string;
  before_sentence: string;
  before_intent: string;
  after_sentence: string;
  after_details: string;
}

export function parseGptResponse(response: string): ParsedSentence[] {
  try {
    const analysis = JSON.parse(response) as ParsedSentence[]
    
    if (!Array.isArray(analysis)) {
      throw new Error('GPT 응답이 배열 형식이 아닙니다')
    }

    return analysis.map(item => ({
      ...item,
      // 필요한 추가 필드들 처리
      meaning: item.title, // 한글 번역을 meaning으로 사용
      grammar: extractGrammarPoints(item.after_detail),
      expression: extractExpressionPoints(item.after_detail),
      before_intention: item.before_intent // 호환성을 위한 매핑
    }))
  } catch (error) {
    console.error('Error parsing GPT response:', error)
    throw new Error('GPT 응답 파싱에 실패했습니다: ' + (error as Error).message)
  }
}

function extractGrammarPoints(details: string): string {
  // 문법 관련 설명만 추출
  return details.split('/')
    .filter(detail => detail.includes('문법') || detail.includes('grammar'))
    .join(' / ')
}

function extractExpressionPoints(details: string): string {
  // 표현 관련 설명만 추출
  return details.split('/')
    .filter(detail => detail.includes('표현') || detail.includes('expression'))
    .join(' / ')
} 