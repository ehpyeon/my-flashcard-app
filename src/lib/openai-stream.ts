import { ChatCompletionChunk } from 'openai/resources/chat/completions'

export function OpenAIStream(response: AsyncIterable<ChatCompletionChunk>) {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
} 