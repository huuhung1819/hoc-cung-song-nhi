import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return new Response('User ID is required', { status: 400 })
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  })

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode('data: {"type":"connected","message":"Connected to notification stream"}\n\n'))

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode('data: {"type":"heartbeat","timestamp":' + Date.now() + '}\n\n'))
        } catch (error) {
          clearInterval(heartbeatInterval)
        }
      }, 30000)

      // Clean up on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval)
        controller.close()
      })

      // Clean up intervals when stream closes
      const originalClose = controller.close.bind(controller)
      controller.close = () => {
        clearInterval(heartbeatInterval)
        originalClose()
      }
    }
  })

  return new Response(stream, { headers })
}
