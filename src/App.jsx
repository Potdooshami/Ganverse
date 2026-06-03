import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { Clapperboard, Play, HelpCircle } from 'lucide-react'

// Views import
import Ganflix from './views/Ganflix'
import Gantube from './views/Gantube'
import Ganhub from './views/Ganhub'
import Gantele from './views/Gantele'

// Global Components import
import VideoPlayerModal from './components/VideoPlayerModal'

// Social SVG Icons
const YoutubeIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 11.75a29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
)

const GithubIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const LaftelIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2" />
    <path d="M2 12h20" />
    <path d="m10 9 5 3-5 3Z" />
  </svg>
)

function App() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentMode, setCurrentMode] = useState('youtube') // 'netflix' | 'youtube' | 'github' | 'laftel'
  const [selectedVideo, setSelectedVideo] = useState(null)

  // 1. Data Fetching Pipeline
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const sheetUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL
      const localFallbackUrl = '/mock_data.csv'

      // We will try fetching from Google Sheets first, if fails we fallback to local CSV
      const urlsToTry = [sheetUrl, localFallbackUrl].filter(Boolean)
      let parsedSuccessfully = false

      for (const url of urlsToTry) {
        try {
          console.log(`fetching data from: ${url}`)
          const response = await fetch(url)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          
          const csvText = await response.text()
          
          // Parse CSV using PapaParse
          const result = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
          })

          if (result.errors && result.errors.length > 0) {
            console.warn("PapaParse parsing warnings/errors:", result.errors)
          }

          // Clean & Refine data
          const cleanedData = result.data.map((item) => {
            const videoId = item.youtubeVideoId || ""
            return {
              id: parseInt(item.id, 10) || Math.random(),
              playlist: item.playlist || '미분류',
              videoTitle: item.videoTitle || '제목 없음',
              youtubeVideoId: videoId,
              aniThumbnailUrl: item.aniThumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              category: item.category || '미분류',
              tags: item.tags ? item.tags.split('#').filter(Boolean) : [],
              uploadDate: item.uploadDate || '2024-01-01',
              isHero: String(item.isHero).toUpperCase() === 'TRUE',
              rating: parseFloat(item.rating) || 0,
              review: item.review || '미작성',
            }
          })

          console.log(`Successfully fetched and parsed ${cleanedData.length} videos from ${url}`)
          setVideos(cleanedData)
          parsedSuccessfully = true
          setError(null)
          break; // break loop if successful
        } catch (err) {
          console.error(`Failed to fetch from ${url}:`, err)
        }
      }

      if (!parsedSuccessfully) {
        setError('데이터를 불러오는 데 실패했습니다. 네트워크 연결 상태를 확인해 주세요.')
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // 2. Global Body Theme Controller (Dynamic background switching)
  useEffect(() => {
    // Reset classes
    document.body.className = 'transition-colors duration-500 overflow-x-hidden'
    
    if (currentMode === 'netflix') {
      document.body.classList.add('bg-zinc-950', 'text-zinc-50')
    } else if (currentMode === 'youtube') {
      document.body.classList.add('bg-[#0f0f0f]', 'text-zinc-100')
    } else if (currentMode === 'github') {
      document.body.classList.add('bg-[#0d1117]', 'text-[#c9d1d9]')
    } else if (currentMode === 'laftel') {
      document.body.classList.add('bg-[#0b0c16]', 'text-slate-200')
    }
  }, [currentMode])

  // Video click handler (global)
  const handleVideoSelect = (video) => {
    setSelectedVideo(video)
  }

  // Header active styles mapping
  const getHeaderStyles = () => {
    switch (currentMode) {
      case 'netflix':
        return {
          headerBg: 'bg-black/90 border-zinc-800 text-white',
          navActive: 'text-red-600 border-red-600',
          logoColor: 'text-red-600 font-black tracking-widest text-2xl uppercase',
          logoText: 'GANFLIX'
        }
      case 'github':
        return {
          headerBg: 'bg-[#161b22]/90 border-[#30363d] text-[#c9d1d9]',
          navActive: 'text-white border-orange-500',
          logoColor: 'text-[#f0f6fc] font-bold text-lg flex items-center gap-2',
          logoText: 'GanHub'
        }
      case 'laftel':
        return {
          headerBg: 'bg-[#141525]/90 border-slate-800 text-slate-100',
          navActive: 'text-violet-500 border-violet-500',
          logoColor: 'text-violet-400 font-extrabold tracking-tight text-xl',
          logoText: 'Gantele'
        }
      case 'youtube':
      default:
        return {
          headerBg: 'bg-[#0f0f0f]/90 border-zinc-800 text-zinc-100',
          navActive: 'text-white border-b-2 border-white',
          logoColor: 'text-white font-bold text-xl flex items-center gap-1',
          logoText: 'GanTube'
        }
    }
  }

  const hStyles = getHeaderStyles()

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-500 px-6 py-4 flex items-center justify-between ${hStyles.headerBg}`}>
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className={hStyles.logoColor}>
            {currentMode === 'youtube' && <Play fill="red" color="red" size={24} className="inline mr-1" />}
            {currentMode === 'github' && <GithubIcon className="inline" />}
            {currentMode === 'netflix' && 'G'}
            {currentMode === 'laftel' && <LaftelIcon className="inline mr-1 text-violet-500" />}
            <span className={currentMode === 'netflix' ? 'ml-0' : 'ml-1'}>{hStyles.logoText}</span>
          </div>

          {/* Mode Tabs */}
          <nav className="flex gap-1 md:gap-4">
            <button
              onClick={() => setCurrentMode('netflix')}
              className={`px-3 py-1.5 border-b-2 font-medium text-sm transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                currentMode === 'netflix' ? hStyles.navActive : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Clapperboard size={15} />
              <span className="hidden sm:inline">간플릭스</span>
            </button>
            <button
              onClick={() => setCurrentMode('youtube')}
              className={`px-3 py-1.5 border-b-2 font-medium text-sm transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                currentMode === 'youtube' ? hStyles.navActive : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <YoutubeIcon />
              <span className="hidden sm:inline">간튜브</span>
            </button>
            <button
              onClick={() => setCurrentMode('github')}
              className={`px-3 py-1.5 border-b-2 font-medium text-sm transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                currentMode === 'github' ? hStyles.navActive : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <GithubIcon />
              <span className="hidden sm:inline">간허브</span>
            </button>
            <button
              onClick={() => setCurrentMode('laftel')}
              className={`px-3 py-1.5 border-b-2 font-medium text-sm transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                currentMode === 'laftel' ? hStyles.navActive : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LaftelIcon />
              <span className="hidden sm:inline">간프텔</span>
            </button>
          </nav>
        </div>
        
        {/* User Info / Channel Link */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.youtube.com/@pokgant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-1 transition-all"
          >
            <YoutubeIcon className="w-3.5 h-3.5 fill-white" />
            폭간트 유튜브
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto transition-all duration-500">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-sm font-medium">데이터 로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
            <HelpCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">오류가 발생했습니다</h2>
            <p className="text-zinc-400 text-sm max-w-md">{error}</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {currentMode === 'netflix' && <Ganflix videos={videos} onVideoClick={handleVideoSelect} />}
            {currentMode === 'youtube' && <Gantube videos={videos} onVideoClick={handleVideoSelect} />}
            {currentMode === 'github' && <Ganhub videos={videos} onVideoClick={handleVideoSelect} />}
            {currentMode === 'laftel' && <Gantele videos={videos} onVideoClick={handleVideoSelect} />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-8 text-center text-xs transition-colors duration-500 border-t ${
        currentMode === 'netflix' ? 'bg-black border-zinc-900 text-zinc-600' :
        currentMode === 'github' ? 'bg-[#0d1117] border-[#21262d] text-[#8b949e]' :
        currentMode === 'laftel' ? 'bg-[#0a0b12] border-slate-900 text-slate-500' :
        'bg-[#0f0f0f] border-zinc-900 text-zinc-500'
      }`}>
        <p>© 2026 간버스 (Ganverse) - 폭간트 팬 메이드 프로젝트. All Rights Reserved.</p>
        <p className="mt-1 opacity-70">이 사이트는 비영리 목적의 팬 페이지입니다.</p>
      </footer>

      {/* Global Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  )
}

export default App
