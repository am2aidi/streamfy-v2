'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  createUpload,
  deleteUpload,
  listUploads,
  setUploadStatus,
  subscribeToUploads,
  updateUpload,
  type UploadSubmission,
  type UploadStatus,
} from '@/lib/uploads-store'

export function useUploads() {
  const [items, setItems] = useState<UploadSubmission[]>(() => listUploads())

  useEffect(() => {
    return subscribeToUploads(() => setItems(listUploads()))
  }, [])

  return useMemo(
    () => ({
      items,
      createUpload,
      updateUpload,
      setUploadStatus: (id: string, status: UploadStatus, reason?: string) => setUploadStatus(id, status, reason),
      deleteUpload,
    }),
    [items],
  )
}

