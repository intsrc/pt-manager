// QR Code generation utility
export function generateQRCodeDataURL(data: string): string {
  // In a real app, you would use a QR code library like 'qrcode'
  // For demo purposes, we'll create a simple SVG QR-like pattern
  const size = 200
  const modules = 21 // Standard QR code size
  const moduleSize = size / modules

  // Create a simple pattern based on the data hash
  const hash = simpleHash(data)
  const pattern = generatePattern(hash, modules)

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      ${pattern
        .map((row, y) =>
          row
            .map((cell, x) =>
              cell
                ? `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
                : "",
            )
            .join(""),
        )
        .join("")}
      <!-- Finder patterns (corners) -->
      <rect x="0" y="0" width="${moduleSize * 7}" height="${moduleSize * 7}" fill="black"/>
      <rect x="${moduleSize}" y="${moduleSize}" width="${moduleSize * 5}" height="${moduleSize * 5}" fill="white"/>
      <rect x="${moduleSize * 2}" y="${moduleSize * 2}" width="${moduleSize * 3}" height="${moduleSize * 3}" fill="black"/>
      
      <rect x="${(modules - 7) * moduleSize}" y="0" width="${moduleSize * 7}" height="${moduleSize * 7}" fill="black"/>
      <rect x="${(modules - 6) * moduleSize}" y="${moduleSize}" width="${moduleSize * 5}" height="${moduleSize * 5}" fill="white"/>
      <rect x="${(modules - 5) * moduleSize}" y="${moduleSize * 2}" width="${moduleSize * 3}" height="${moduleSize * 3}" fill="black"/>
      
      <rect x="0" y="${(modules - 7) * moduleSize}" width="${moduleSize * 7}" height="${moduleSize * 7}" fill="black"/>
      <rect x="${moduleSize}" y="${(modules - 6) * moduleSize}" width="${moduleSize * 5}" height="${moduleSize * 5}" fill="white"/>
      <rect x="${moduleSize * 2}" y="${(modules - 5) * moduleSize}" width="${moduleSize * 3}" height="${moduleSize * 3}" fill="black"/>
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

function generatePattern(hash: number, size: number): boolean[][] {
  const pattern: boolean[][] = []
  let seed = hash

  for (let y = 0; y < size; y++) {
    pattern[y] = []
    for (let x = 0; x < size; x++) {
      // Skip finder pattern areas
      if ((x < 9 && y < 9) || (x >= size - 8 && y < 9) || (x < 9 && y >= size - 8)) {
        pattern[y][x] = false
        continue
      }

      // Simple pseudo-random pattern based on position and seed
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      pattern[y][x] = seed % 100 < 45 // ~45% fill rate
    }
  }

  return pattern
}

export function generateBookingQRData(bookingId: string): string {
  // In a real app, this would be a secure token or encrypted data
  return JSON.stringify({
    type: "booking_checkin",
    bookingId,
    timestamp: Date.now(),
    venue: "kolizey",
  })
}
