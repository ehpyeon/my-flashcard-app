import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const SYSTEM_PROMPT = `You are an English teacher who analyzes English sentences and provides corrections and explanations in Korean.
Please analyze the given English sentence and return the result in the following JSON format for each sentence that needs correction:

[{
  "title": "한글로 된 문장 의미 설명",
  "before_versa_after_sentence": "원문 / 수정된 문장",
  "before_sentence": "원문에서 수정이 필요한 부분을 %%로 감싸서 표시",
  "before_intent": "원문의 의도 설명 (한글)",
  "after_sentence": "수정된 문장에서 수정된 부분을 %%로 감싸서 표시",
  "after_detail": "수정 이유와 설명 (한글)"
},
{
  "title": "한글로 된 문장 의미 설명",
  "before_versa_after_sentence": "원문 / 수정된 문장",
  "before_sentence": "원문에서 수정이 필요한 부분을 %%로 감싸서 표시",
  "before_intent": "원문의 의도 설명 (한글)",
  "after_sentence": "수정된 문장에서 수정된 부분을 %%로 감싸서 표시",
  "after_detail": "수정 이유와 설명 (한글)"
}]`

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `다음 영어 글을 분석해주세요: "${prompt}"`
        }
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content in response')
    }

    try {
      // JSON 파싱 시도
      const parsedContent = JSON.parse(content)
      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // JSON 파싱에 실패하면 원본 content를 반환
      return NextResponse.json({ content })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
} 