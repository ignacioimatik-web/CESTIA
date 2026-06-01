import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
          background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
          color: 'white',
          fontSize: 80,
          fontWeight: 700,
        }}
      >
        C
      </div>
    ),
    size
  )
}
