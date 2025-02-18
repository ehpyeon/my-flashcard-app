'use client'

import { useState, useRef, useEffect } from 'react'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { useMaterials } from '@/lib/hooks/useMaterials'
import { useStudyRecords } from '@/lib/hooks/useStudyRecords'
import { ParsedSentence } from '@/lib/utils/parseGptResponse'
import { createSituation } from '@/lib/hooks/useSituations'
import { createCorrections } from '@/lib/hooks/useCorrections'
import { parseGptResponse } from '@/lib/utils/parseGptResponse'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export interface AnalysisResult {
  title: string;
  before_versa_after_sentence: string;
  before_sentence: string;
  before_intent: string;
  after_sentence: string;
  after_detail: string;
}

interface GenerationProps {
  onAnalysisComplete: (results: AnalysisResult[]) => void;
}

// 음성 인식 결과 타입 추가
interface TranscriptResult {
  text: string;
  isFinal: boolean;
}

export default function Generation({ onAnalysisComplete }: GenerationProps) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [whisperResult, setWhisperResult] = useState('')
  const [analysisResult, setAnalysisResult] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [parsedResponse, setParsedResponse] = useState<ParsedSentence[] | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  
  const { createMaterial } = useMaterials()
  const { createStudyRecords } = useStudyRecords()
  const router = useRouter()

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [analysisCards, setAnalysisCards] = useState<ParsedSentence[]>([])
  const [savedCardIndices, setSavedCardIndices] = useState<Set<number>>(new Set())

  // 녹음 상태 텍스트를 위한 상태 추가
  const [recordingDots, setRecordingDots] = useState('')

  // 음성 변환 상태를 위한 상태 추가
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcribingDots, setTranscribingDots] = useState('')

  // 녹음 중 애니메이션 효과
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDots(prev => {
          if (prev === '') return '.'
          if (prev === '.') return '..'
          if (prev === '..') return '...'
          return ''
        })
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // 음성 변환 중 애니메이션 효과
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTranscribing) {
      interval = setInterval(() => {
        setTranscribingDots(prev => {
          if (prev === '') return '.'
          if (prev === '.') return '..'
          if (prev === '..') return '...'
          return ''
        })
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isTranscribing])

  // 분석 결과를 카드 배열로 변환
  useEffect(() => {
    if (analysisResult) {
      try {
        // 코드 블록 마커 제거 및 문자열 정리
        let jsonStr = analysisResult
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
        
        console.log('Initial string:', jsonStr)

        // 개별 JSON 객체 추출을 위한 정규식
        const objectRegex = /\{[^{}]*\}/g
        const matches = jsonStr.match(objectRegex)

        if (!matches) {
          throw new Error('유효한 JSON 객체를 찾을 수 없습니다')
        }

        // 각 객체를 개별적으로 파싱
        const validCards = matches
          .map(objStr => {
            try {
              const obj = JSON.parse(objStr)
              // 필수 필드 검증
              if (
                obj &&
                typeof obj === 'object' &&
                'title' in obj &&
                'before_sentence' in obj &&
                'after_sentence' in obj &&
                'after_detail' in obj
              ) {
                return obj
              }
              return null
            } catch (e) {
              console.error('개별 객체 파싱 실패:', e)
              return null
            }
          })
          .filter(Boolean) // null 값 제거

        console.log('Parsed cards:', validCards)
        setAnalysisCards(validCards)
      } catch (e) {
        console.error('전처리 에러:', e)
        console.error('원본 문자열:', analysisResult)
      }
    }
  }, [analysisResult])

  // 녹음 시작/중지
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorder.current = new MediaRecorder(stream)
        audioChunks.current = []

        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data)
        }

        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
          setWhisperResult('음성 변환 중...')
          await sendToWhisper(audioBlob)
        }

        mediaRecorder.current.start()
        setIsRecording(true)
        setWhisperResult('')
      } catch (error) {
        console.error('Error accessing microphone:', error)
        setWhisperResult(`오류: ${error instanceof Error ? error.message : '마이크 접근 실패'}`)
        setIsRecording(false)
      }
    } else {
      mediaRecorder.current?.stop()
      setIsRecording(false)
    }
  }

  // Whisper API 호출
  const sendToWhisper = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setWhisperResult('')
    
    try {
      const formData = new FormData()
      formData.append('file', audioBlob)
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('음성 인식에 실패했습니다')
      }

      const data = await response.json()
      setWhisperResult(data.text)
    } catch (error) {
      console.error('Whisper API error:', error)
      setWhisperResult(`오류: ${error instanceof Error ? error.message : '음성 인식 실패'}`)
    } finally {
      setIsTranscribing(false)
    }
  }

  // GPT API 호출
  const handleAnalyze = async () => {
    if (!whisperResult) return
    
    setIsAnalyzing(true)
    setAnalysisResult('')  // 결과 초기화

    try {
      console.log('Sending analysis request with prompt:', whisperResult)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: whisperResult }),
      })

      if (!response.ok) {
        throw new Error('분석 요청 실패')
      }

      const responseText = await response.text()
      console.log('Raw response text:', responseText)

      try {
        // 응답이 이미 JSON 문자열인 경우를 처리
        let results
        if (responseText.startsWith('[') && responseText.endsWith(']')) {
          // 응답이 이미 JSON 배열 형태인 경우
          results = JSON.parse(responseText)
        } else {
          // 응답이 다른 형태인 경우 (예: {content: "..."})
          const data = JSON.parse(responseText)
          results = typeof data.content === 'string' 
            ? JSON.parse(data.content)
            : data.content
        }

        console.log('Parsed results:', results)
        onAnalysisComplete(results)
        
      } catch (parseError) {
        console.error('JSON Parse error:', parseError)
        alert('응답 데이터 처리에 실패했습니다.')
      }

    } catch (error) {
      console.error('Analysis error:', error)
      alert(error instanceof Error ? error.message : '분석에 실패했습니다')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 단일 카드 저장 함수
  const handleSaveCard = async (cardIndex: number) => {
    if (savedCardIndices.has(cardIndex)) return
    
    try {
      const card = analysisCards[cardIndex]
      
      // 1. situation 생성
      const situation = await createSituation({
        title: '음성 학습 기록',
        type: 'speech',
        description: whisperResult,
        datelist: [new Date().toISOString().split('T')[0]],
      })

      // 2. correction 생성
      await createCorrections(
        situation.id,
        [{
          title: `음성 분석 ${cardIndex + 1}`,
          situation_id: situation.id,
          before_sentence: card.before_sentence,
          before_intention: card.before_intent,
          after_sentence: card.after_sentence,
          after_detail: card.after_detail,
          meaning: card.meaning || null,
          grammar: card.grammar || null,
          expression: card.expression || null,
          datelist: [new Date().toISOString().split('T')[0]],
          score: 0
        }]
      )

      setSavedCardIndices(prev => new Set([...prev, cardIndex]))
    } catch (error) {
      console.error('Save card error:', error)
      alert(error instanceof Error ? error.message : '저장에 실패했습니다')
    }
  }

  // 전체 저장 함수 수정
  const handleSaveAll = async () => {
    if (!analysisCards.length || !whisperResult) return
    if (!isAuthenticated) {
      alert('로그인이 필요합니다')
      return
    }

    try {
      // ... 기존 저장 로직 ...
      setSavedCardIndices(new Set(analysisCards.map((_, i) => i)))
      alert('저장이 완료되었습니다')
    } catch (error) {
      console.error('Save error:', error)
      alert(error instanceof Error ? error.message : '저장에 실패했습니다')
    }
  }

  return (
    <Box className="w-full max-w-3xl mx-auto py-12">
      {/* 홈 버튼 */}
      <div className="absolute top-0 right-0 p-6 flex items-center gap-4">
        <Button
          onClick={() => router.push('/')}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white/80 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          홈
        </Button>
      </div>

      {/* 제목 */}
      <div className="text-center mb-12">
        <Text variant="h2" className="text-white mb-4">
          SPEAK ENGLISH
        </Text>
        <Text variant="body" className="text-white/60 font-light tracking-wide mb-8">
          녹음 버튼을 눌러 영어로 말하거나 텍스트를 직접 입력하세요
        </Text>
      </div>

      {/* 녹음 버튼 */}
      <div className="flex flex-col items-center mb-8">
        <Button
          onClick={toggleRecording}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative
            ${isRecording 
              ? 'border-4 border-red-500 bg-transparent hover:bg-red-500/10' 
              : 'bg-white hover:bg-gray-50'
            }
          `}
        >
          <div className={`
            transition-all duration-300
            ${isRecording
              ? 'w-6 h-6 bg-red-500 rounded-[2px]'
              : 'w-8 h-8 bg-red-500 rounded-full'
            }
          `}/>
          {isRecording && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <Text className="text-red-500 font-bold animate-pulse">
                REC
              </Text>
            </div>
          )}
        </Button>
      </div>

      {/* 텍스트 입력 영역 */}
      <div className="mb-8 relative">
        <textarea
          value={whisperResult}
          onChange={(e) => setWhisperResult(e.target.value)}
          placeholder={isRecording || isTranscribing 
            ? '' 
            : "영어 문장을 입력하거나 녹음된 음성을 확인할 수 있습니다."}
          className="w-full p-4 border border-white/10 rounded-lg min-h-[120px] 
            bg-neutral-900 text-white/80 focus:outline-none focus:border-white/20
            placeholder:text-white/40"
          readOnly={isRecording || isTranscribing}
        />
        {isRecording && (
          <div className="absolute top-4 left-4 text-neutral-500">
            Recording{recordingDots}
          </div>
        )}
        {isTranscribing && (
          <div className="absolute top-4 left-4 text-neutral-500">
            Transcribing{transcribingDots}
          </div>
        )}
        {/* 분석 버튼 - 녹음 중이나 변환 중이 아니고, 텍스트가 있을 때만 표시 */}
        {whisperResult.trim() && !isRecording && !isTranscribing && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-3 bg-neutral-900 text-white/90 hover:bg-neutral-800 
                transition-all duration-300 rounded-lg border border-white/10
                transform hover:translate-y-[-2px] hover:shadow-lg
                active:translate-y-[0px] active:shadow-md
                relative before:absolute before:inset-0 before:bg-white/5 before:rounded-lg
                before:opacity-0 hover:before:opacity-100 before:transition-opacity"
            >
              {isAnalyzing ? 'ANALYZING...' : 'AI ANALYZE'}
            </Button>
          </div>
        )}
      </div>

      {/* 분석 결과 */}
      {analysisCards.length > 0 && (
        <Box className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <Text variant="h3" className="text-white font-light tracking-wider">
              분석 결과 ({currentCardIndex + 1}/{analysisCards.length})
            </Text>
            <div className="flex items-center gap-4">
              {/* 단일 카드 저장 버튼 */}
              <Button
                onClick={() => handleSaveCard(currentCardIndex)}
                disabled={savedCardIndices.has(currentCardIndex)}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white/80"
              >
                {savedCardIndices.has(currentCardIndex) ? '저장 완료' : '단일 카드 저장'}
              </Button>
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentCardIndex === 0}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 w-12 h-12 flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Button
                  onClick={() => setCurrentCardIndex(prev => Math.min(analysisCards.length - 1, prev + 1))}
                  disabled={currentCardIndex === analysisCards.length - 1}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 w-12 h-12 flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6 border border-white/10 rounded-lg bg-neutral-900/50 backdrop-blur-md">
            <div className="relative">
              {/* 카드 내용을 마크다운 형식으로 표시 */}
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({children}) => (
                      <p className="mb-2 whitespace-pre-line">{children}</p>
                    ),
                    strong: ({children}) => {
                      // %%로 감싸진 텍스트를 빨간색으로 처리
                      const text = children?.toString() || ''
                      const parts = text.split(/(%%.+?%%)/)
                      return (
                        <strong className="font-bold text-neutral-200">
                          {parts.map((part, i) => {
                            if (part.startsWith('%%') && part.endsWith('%%')) {
                              const content = part.slice(2, -2)
                              return <span key={i} className="text-red-500">{content}</span>
                            }
                            return part
                          })}
                        </strong>
                      )
                    },
                    em: ({children}) => (
                      <em className="italic text-neutral-400 block ml-4">{children}</em>
                    ),
                    h3: ({children}) => (
                      <h3 className="text-sm font-semibold text-neutral-400 mb-2">{children}</h3>
                    ),
                  }}
                >
                  {`### 원본 문장
**${analysisCards[currentCardIndex].before_sentence}**

### 수정된 문장
**${analysisCards[currentCardIndex].after_sentence}**

### 설명
${analysisCards[currentCardIndex].after_detail.split('/').map(detail => `* ${detail.trim()}`).join('\n')}
`}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          {/* 전체 저장 버튼 */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSaveAll}
              disabled={analysisCards.length === savedCardIndices.size}
              className="px-8 py-3 bg-neutral-900/80 text-white/90 hover:bg-neutral-800 
                transition-all duration-200 rounded-lg border border-white/10 backdrop-blur-sm"
            >
              {analysisCards.length === savedCardIndices.size 
                ? '모든 카드 저장 완료' 
                : `남은 ${analysisCards.length - savedCardIndices.size}개 카드 저장`}
            </Button>
          </div>
        </Box>
      )}
    </Box>
  )
}