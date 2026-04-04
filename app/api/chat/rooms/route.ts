import { NextResponse } from 'next/server'
import { listChatRoomsFromDb } from '@/lib/server/platform-db'

export async function GET() {
  const items = await listChatRoomsFromDb()
  return NextResponse.json({ items })
}
