'use client'

import ReactMarkdown, { Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { ComponentProps } from 'react'

interface FlashcardProps {
  frontContent: string;  // 앞면 내용
  backContent: string;   // 뒷면 내용
  isFlipped: boolean;
  onFlip: () => void;
  formatText?: (text: string) => React.ReactNode;
}

export default function Flashcard({ 
  frontContent, 
  backContent, 
  isFlipped, 
  onFlip,
  formatText = (text) => text
}: FlashcardProps) {
  const markdownComponents: Components = {
    p: ({ children, ...props }: ComponentProps<'p'>) => {
      const text = children?.toString() || ''
      const content = text.replace(
        /(->\s*)/g, 
        '→ '
      )
      return (
        <p {...props} className="mb-4 whitespace-pre-line text-neutral-800">
          {content}
        </p>
      )
    },
    strong: ({ children, ...props }: ComponentProps<'strong'>) => {
      const text = children?.toString() || ''
      const parts = text.split(/(%%.+?%%)/)
      return (
        <strong {...props} className="font-bold text-neutral-900">
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
    em: ({ children, ...props }: ComponentProps<'em'>) => (
      <em {...props} className="italic text-neutral-600 block">
        {children}
      </em>
    ),
    h3: ({ children, ...props }: ComponentProps<'h3'>) => {
      const text = children?.toString() || ''
      if (text === 'Before' || text === 'After') {
        return (
          <h3 {...props} className="
            text-[0.7em]                // 70% 크기
            font-normal                 // 얇은 폰트 무게
            text-blue-600/75           // 고급스러운 파란색
            tracking-wide              // 자간 넓게
            uppercase                  // 대문자로 변환
            mb-3 mt-5 first:mt-2      // 여백 조정
            select-none                // 텍스트 선택 방지
          ">
            {text}
          </h3>
        )
      }
      return (
        <h3 {...props} className="text-[0.7em] font-normal text-blue-600/75 mb-4 mt-6 first:mt-0">
          {children}
        </h3>
      )
    },
    ul: ({ children, ...props }: ComponentProps<'ul'>) => (
      <ul {...props} className="list-disc list-inside space-y-2 text-neutral-700 mb-4">
        {children}
      </ul>
    ),
    li: ({ children, ...props }: ComponentProps<'li'>) => (
      <li {...props} className="text-neutral-700">
        {children}
      </li>
    ),
    br: () => <br />,
  }

  return (
    <div 
      className="relative w-full max-w-2xl aspect-[2/1] cursor-pointer"
      onClick={onFlip}
    >
      <div className="absolute w-full h-full">
        {/* 앞면 */}
        <div className={`
          absolute w-full h-full bg-white 
          border border-neutral-200 rounded-lg p-8 
          flex items-center justify-center
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}>
          <div className="prose max-w-none w-full">
            <ReactMarkdown
              components={{
                p: ({ children, ...props }: ComponentProps<'p'>) => (
                  <p {...props} className="mb-4 whitespace-pre-line text-neutral-800">
                    {children}
                  </p>
                ),
                strong: ({ children, ...props }: ComponentProps<'strong'>) => {
                  const text = children?.toString() || ''
                  const parts = text.split(/(%%.+?%%)/)
                  return (
                    <strong {...props} className="font-bold text-neutral-900">
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
                em: ({ children, ...props }: ComponentProps<'em'>) => (
                  <em {...props} className="italic text-neutral-600 block">
                    {children}
                  </em>
                ),
                h3: ({ children, ...props }: ComponentProps<'h3'>) => (
                  <h3 {...props} className="text-lg font-semibold text-neutral-800 mb-4 mt-6 first:mt-0">
                    {children}
                  </h3>
                ),
                ul: ({ children, ...props }: ComponentProps<'ul'>) => (
                  <ul {...props} className="list-disc list-inside space-y-2 text-neutral-700 mb-4">
                    {children}
                  </ul>
                ),
                li: ({ children, ...props }: ComponentProps<'li'>) => (
                  <li {...props} className="text-neutral-700">
                    {children}
                  </li>
                ),
              }}
              rehypePlugins={[rehypeRaw]}
            >
              {frontContent}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* 뒷면 */}
        <div className={`
          absolute w-full h-full bg-white 
          border border-neutral-200 rounded-lg p-8 
          flex items-center justify-center
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div className="prose max-w-none w-full">
            <ReactMarkdown
              components={{
                p: ({ children, ...props }: ComponentProps<'p'>) => (
                  <p {...props} className="mb-4 whitespace-pre-line text-neutral-800">
                    {children}
                  </p>
                ),
                strong: ({ children, ...props }: ComponentProps<'strong'>) => {
                  const text = children?.toString() || ''
                  const parts = text.split(/(%%.+?%%)/)
                  return (
                    <strong {...props} className="font-bold text-neutral-900">
                      {parts.map((part, i) => {
                        if (part.startsWith('%%') && part.endsWith('%%')) {
                          const content = part.slice(2, -2)
                          return <span key={i} style={{ color: 'red' }}>{content}</span>
                        }
                        return part
                      })}
                    </strong>
                  )
                },
                em: ({ children, ...props }: ComponentProps<'em'>) => (
                  <em {...props} className="italic text-neutral-600 block">
                    {children}
                  </em>
                ),
                h3: ({ children, ...props }: ComponentProps<'h3'>) => (
                  <h3 {...props} className="text-lg font-semibold text-neutral-800 mb-4 mt-6 first:mt-0">
                    {children}
                  </h3>
                ),
                ul: ({ children, ...props }: ComponentProps<'ul'>) => (
                  <ul {...props} className="list-disc list-inside space-y-2 text-neutral-700 mb-4">
                    {children}
                  </ul>
                ),
                li: ({ children, ...props }: ComponentProps<'li'>) => (
                  <li {...props} className="text-neutral-700">
                    {children}
                  </li>
                ),
              }}
              rehypePlugins={[rehypeRaw]}
            >
              {backContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
} 