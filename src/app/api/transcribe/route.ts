import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('file') as File
    
    if (!audioFile) {
      throw new Error('오디오 파일이 없습니다.')
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
    })

    return NextResponse.json(transcription)
  } catch (error) {
    console.error('Error in transcribe route:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : '음성 변환에 실패했습니다.'
      },
      { status: 500 }
    )
  }
} 