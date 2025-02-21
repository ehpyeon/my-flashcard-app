/*
'use client'

import { Box } from '@/components/ui/Box'
import { Text } from '@/components/ui/Text'
import Generation from '@/components/Generation'

// Generation 컴포넌트에서 타입 가져오기
import type { AnalysisResult } from '@/components/Generation'

export default function StatusPage() {
  const handleAnalysisComplete = (results: AnalysisResult[]) => {
    // 필요한 처리 로직
    console.log('Analysis results:', results)
  }

  return (
    <Box>
      <Text variant="h1">Status Page</Text>
      <Generation onAnalysisComplete={handleAnalysisComplete} />
    </Box>
  )
}
*/ 