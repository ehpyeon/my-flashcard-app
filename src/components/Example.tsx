import { Box } from '@/components/ui/Box'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Example() {
  return (
    <Box className="max-w-md">
      <Text variant="h2" className="mb-4">
        제목
      </Text>
      <Input
        value=""
        onChange={() => {}}
        placeholder="입력해주세요"
        className="w-full mb-4"
      />
      <Button variant="primary" onClick={() => console.log('clicked')}>
        버튼
      </Button>
    </Box>
  )
} 