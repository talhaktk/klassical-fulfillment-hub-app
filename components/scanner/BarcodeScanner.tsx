'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  active:  boolean
}

export default function BarcodeScanner({ onScan, active }: BarcodeScannerProps) {
  const videoRef       = useRef<HTMLVideoElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const streamRef      = useRef<MediaStream | null>(null)
  const animRef        = useRef<number>(0)
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus('idle')
  }, [])

  const startCamera = useCallback(async () => {
    setStatus('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStatus('scanning')
        scanLoop()
      }
    } catch (err: any) {
      setErrMsg(err.message ?? 'Camera access denied')
      setStatus('error')
    }
  }, [])

  const scanLoop = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video  = videoRef.current
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    if (!ctx || video.readyState < 2) {
      animRef.current = requestAnimationFrame(scanLoop)
      return
    }

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    try {
      // Use BarcodeDetector API if available (Chrome/Edge)
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['code_128','ean_13','ean_8','qr_code','code_39','upc_a','upc_e'] })
        const codes = await detector.detect(canvas)
        if (codes.length > 0) {
          onScan(codes[0].rawValue)
          return
        }
      }
    } catch {}

    animRef.current = requestAnimationFrame(scanLoop)
  }, [onScan])

  useEffect(() => {
    if (active) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [active])

  return (
    <div
      className="relative rounded-xl overflow-hidden flex items-center justify-center"
      style={{ background: '#0A1628', border: '2px solid #C8971A', height: 200 }}
    >
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan overlay */}
      {status === 'scanning' && (
        <>
          <div
            className="scan-line absolute left-0 right-0 h-0.5"
            style={{ background: '#E8B830', boxShadow: '0 0 14px #D4A520,0 0 4px #F5D060', zIndex: 10 }}
          />
          {/* Corner brackets */}
          {[
            { top: 20, left: 20,  borderStyle: 'solid', borderWidth: '3px 0 0 3px',   borderColor: '#E8B830' },
            { top: 20, right: 20, borderStyle: 'solid', borderWidth: '3px 3px 0 0',   borderColor: '#E8B830' },
            { bottom:20, left:20, borderStyle: 'solid', borderWidth: '0 0 3px 3px',   borderColor: '#E8B830' },
            { bottom:20, right:20,borderStyle: 'solid', borderWidth: '0 3px 3px 0',   borderColor: '#E8B830' },
          ].map((s, i) => (
            <div key={i} className="absolute w-4 h-4" style={{ ...s, zIndex: 10 }} />
          ))}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed rounded-lg"
            style={{ width: 160, height: 80, borderColor: 'rgba(200,151,26,.5)', zIndex: 5 }}
          />
        </>
      )}

      {/* Status overlay */}
      {status === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ zIndex: 20 }}>
          <span className="text-3xl">📷</span>
          <span className="text-xs text-[#B8C4D4]">Camera inactive</span>
        </div>
      )}
      {status === 'starting' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C8971A', borderTopColor: 'transparent' }} />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4" style={{ zIndex: 20 }}>
          <span className="text-2xl">🚫</span>
          <span className="text-xs text-[#C0321E] text-center">{errMsg}</span>
          <button className="btn-ghost btn-sm mt-1" onClick={startCamera}>Retry</button>
        </div>
      )}
    </div>
  )
}
