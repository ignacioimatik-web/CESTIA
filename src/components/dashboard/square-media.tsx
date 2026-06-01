'use client'

import { useState } from 'react'
import Image from 'next/image'

export function SquareMedia({
  src,
  alt,
  fallback,
}: {
  src: string | null
  alt: string
  fallback: React.ReactNode
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0" aria-label={alt}>
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          width={48}
          height={48}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
          {fallback}
        </div>
      )}
    </div>
  )
}
