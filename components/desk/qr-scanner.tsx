"use client"

import { useState, useRef, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Camera, CheckCircle, XCircle, Scan } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  isActive: boolean
}

export function QRScanner({ onScan, isActive }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (isActive && videoRef.current) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [isActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasCamera(true)
        setError(null)

        // Start scanning loop
        if (isActive) {
          startScanningLoop()
        }
      }
    } catch (err) {
      setError("Camera access denied or not available")
      setHasCamera(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setHasCamera(false)
    setIsScanning(false)
  }

  const startScanningLoop = () => {
    if (!isScanning) {
      setIsScanning(true)
      scanFrame()
    }
  }

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isActive) {
      setIsScanning(false)
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // In a real app, you would use a QR detection library here
      // For demo, we'll simulate detection on click

      // Continue scanning
      if (isScanning) {
        requestAnimationFrame(scanFrame)
      }
    } else {
      // Retry if video not ready
      setTimeout(scanFrame, 100)
    }
  }

  const handleVideoClick = () => {
    if (hasCamera) {
      const mockQRData = JSON.stringify({
        type: "booking_checkin",
        bookingId: "booking_" + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        venue: "kolizey",
      })
      onScan(mockQRData)
    }
  }

  return (
    <GlassCard className="p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Scan className="w-5 h-5" />
          <h3 className="text-lg font-semibold">QR Code Scanner</h3>
        </div>

        <div className="relative aspect-square max-w-sm mx-auto bg-black/20 rounded-lg overflow-hidden">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover cursor-pointer"
                onClick={handleVideoClick}
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-400 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  {isScanning && <div className="absolute inset-0 border-2 border-blue-400 rounded-lg animate-pulse" />}
                </div>
              </div>
              {hasCamera && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
                  {isScanning ? "Scanning..." : "Tap to simulate scan"}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/60">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Camera inactive</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {!error && hasCamera && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Camera ready - {isScanning ? "scanning for QR codes" : "point at QR code"}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
