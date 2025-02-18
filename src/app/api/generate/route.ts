import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `
너는 친절한 영어 튜터야. 사용자의 영어 발화를 분석하고 교정해주는 역할을 해.
입력된 텍스트를 문장 단위로 분리하여 각각 분석해줘.
여러 문장이 있다면 각각의 문장을 개별적으로 분석해서 배열로 반환해줘.
결과는 반드시 아래 형식의 JSON만 출력해야 해 (코드 블록 없이):

[
  {
    "title": "첫 번째 문장의 한글 번역",
    "before_versa_after_sentence": "수정 전 문장 / 수정 후 문장",
    "before_sentence": "수정할 부분을 %%로 감싼 원본 문장",
    "before_intent": "사용자의 의도를 공감하며 설명하고 마지막에 수정이 필요한 부분을 한 문장으로 언급",
    "after_sentence": "수정된 부분을 %%로 감싼 교정 문장",
    "after_detail": "수정 이유 설명 1 / 수정 이유 설명 2 / 수정 이유 설명 3"
  },
  {
    "title": "두 번째 문장의 한글 번역",
    "before_versa_after_sentence": "다른 수정 전 문장 / 수정 후 문장",
    "before_sentence": "다른 수정할 부분을 %%로 감싼 원본 문장",
    "before_intent": "다른 사용자의 의도를 공감하며 설명하고 마지막에 수정이 필요한 부분을 한 문장으로 언급",
    "after_sentence": "다른 수정된 부분을 %%로 감싼 교정 문장",
    "after_detail": "다른 수정 이유 설명 1 / 다른 수정 이유 설명 2 / 다른 수정 이유 설명 3"
  }
]

주의사항:
1. 코드 블록 없이 순수 JSON만 출력할 것
2. 모든 문자열은 큰따옴표(")로 감싸고, 문자열 내 큰따옴표는 이스케이프(\\") 처리할 것
3. 각 필드의 값은 반드시 문자열로 제공할 것
4. 배열과 객체는 항상 올바르게 닫아야 함
5. 응답은 반드시 유효한 JSON 배열([])로 시작하고 끝나야 함`

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    console.log('Received prompt:', prompt)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `다음 영어 문장을 분석해주세요: "${prompt}"`
          }
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('GPT API 요청 실패')
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    let buffer = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // 새로운 청크 디코딩
            buffer += decoder.decode(value)
            
            // 데이터 청크 처리
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const json = JSON.parse(line.slice(6))
                  const content = json.choices[0]?.delta?.content || ''
                  controller.enqueue(encoder.encode(content))
                } catch (e) {
                  console.error('JSON 파싱 에러:', e)
                }
              }
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in generate route:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '분석에 실패했습니다.'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 