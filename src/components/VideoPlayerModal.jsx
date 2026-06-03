import { useState, useEffect } from 'react'
import { X, SkipForward, Play, AlertCircle } from 'lucide-react'

export default function VideoPlayerModal({ video, onClose }) {
  const [introState, setIntroState] = useState('playing') // 'playing' | 'ended' | 'skipped' | 'none'
  const [introNum] = useState(() => Math.floor(Math.random() * 10) + 1)
  const [loadError, setLoadError] = useState(false)

  // Auto-skip intro if it takes too long to load or error occurs
  const handleIntroError = () => {
    console.log("Intro video not found or failed to load. Falling back to YouTube video directly.")
    setIntroState('none')
  }

  const handleSkipIntro = () => {
    setIntroState('skipped')
  }

  const handleIntroEnded = () => {
    setIntroState('ended')
  }

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const showYouTube = introState === 'ended' || introState === 'skipped' || introState === 'none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      {/* Backdrop overlay (click to close) */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden aspect-video z-10 flex flex-col justify-between">
        
        {/* Top Control Bar */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {/* Skip Intro Button (Only show when playing intro) */}
          {!showYouTube && (
            <button
              onClick={handleSkipIntro}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 border border-zinc-700/50 hover:border-zinc-500 rounded-full text-xs font-semibold text-white tracking-wide transition-all cursor-pointer"
            >
              <SkipForward size={14} />
              인트로 건너뛰기
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex items-center justify-center p-1.5 bg-black/60 hover:bg-red-600/90 border border-zinc-700/50 hover:border-red-500/50 rounded-full text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Screen */}
        <div className="relative w-full h-full flex-1 bg-black flex items-center justify-center">
          
          {/* 1. Intro Video Player */}
          {!showYouTube && (
            <div className="relative w-full h-full">
              {/* Note: Try to load from public/videos/intro_{num}.mp4 or intro_{num}.webm */}
              <video
                src={`/videos/intro_${introNum}.mp4`}
                autoPlay
                onEnded={handleIntroEnded}
                onError={handleIntroError}
                className="w-full h-full object-cover"
              />
              
              {/* Intro Overlay Text */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md border border-zinc-800/40 p-3 rounded-lg pointer-events-none">
                <span className="text-red-500 font-extrabold text-[10px] uppercase tracking-wider block mb-0.5">
                  AI Anime Intro
                </span>
                <span className="text-white font-bold text-xs">
                  {video.videoTitle}
                </span>
              </div>
            </div>
          )}

          {/* 2. Youtube Iframe Player */}
          {showYouTube && (
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1&modestbranding=1&rel=0`}
              title={video.videoTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  )
}
