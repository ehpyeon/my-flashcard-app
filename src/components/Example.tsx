import { Box } from '@/components/ui/Box'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

export function Example() {
  const [inputValue, setInputValue] = useState('')

  return (
    <Box className="p-4">
      <Text variant="h1" className="mb-4">
        예시 컴포넌트
      </Text>
      <Text variant="body" className="mb-4">
        이것은 예시 텍스트입니다.
      </Text>
      <Input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="입력해주세요" 
        className="w-full mb-4"
      />
      <Button variant="default" onClick={() => console.log('clicked')}>
        버튼
      </Button>
    </Box>
  )
} 