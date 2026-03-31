'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/community?tab=submit')
  }, [router])

  return (
    <div className="min-h-[60vh] px-6 py-10 text-gray-300">
      Redirecting…
    </div>
  )
}
