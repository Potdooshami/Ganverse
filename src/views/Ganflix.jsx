import { Play, Info, Plus } from 'lucide-react'

export default function Ganflix({ videos, onVideoClick }) {
  if (!videos || videos.length === 0) return null

  // 1. Find Hero Video (where isHero is true, or fallback to first video)
  const heroVideo = videos.find(v => v.isHero) || videos[0]

  // 2. Group videos by playlist for rows
  const groupedVideos = videos.reduce((acc, video) => {
    if (!acc[video.playlist]) {
      acc[video.playlist] = []
    }
    acc[video.playlist].push(video)
    return acc
  }, {})

  return (
    <div className="bg-zinc-950 text-zinc-50 pb-20 select-none">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[56.25vw] md:h-[70vh] max-h-[600px] overflow-hidden flex items-end">
        {/* Banner Background Image */}
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${heroVideo.aniThumbnailUrl})` }}>
          {/* Overlay gradient for dark, cinematic look */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl px-6 md:px-12 pb-8 md:pb-16 flex flex-col gap-3">
          <span className="text-red-600 font-extrabold text-xs uppercase tracking-widest bg-red-600/10 border border-red-600/30 px-2.5 py-1 rounded w-fit">
            HIT SERIES
          </span>
          <h1 className="text-2xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
            {heroVideo.videoTitle}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 font-medium">
            재생목록: {heroVideo.playlist} • 업로드: {heroVideo.uploadDate}
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => onVideoClick(heroVideo)}
              className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 py-2 rounded font-bold text-sm transition-all shadow-lg cursor-pointer"
            >
              <Play fill="black" size={16} />
              재생
            </button>
            <button
              onClick={() => onVideoClick(heroVideo)}
              className="flex items-center gap-2 bg-zinc-600/60 hover:bg-zinc-600/80 text-white px-6 py-2 rounded font-bold text-sm transition-all border border-zinc-500/30 cursor-pointer"
            >
              <Info size={16} />
              상세 정보
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Rows Section */}
      <div className="px-6 md:px-12 mt-8 flex flex-col gap-10">
        {Object.entries(groupedVideos).map(([playlistName, playlistVideos]) => (
          <div key={playlistName} className="flex flex-col gap-3">
            {/* Playlist Title */}
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-zinc-100 hover:text-white transition-all cursor-pointer flex items-center gap-1">
              {playlistName}
              <span className="text-[10px] text-red-500 font-extrabold opacity-0 hover:opacity-100 transition-opacity">모두 보기 ›</span>
            </h2>

            {/* Horizontal Scroll Row */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {playlistVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onVideoClick(video)}
                  className="flex-shrink-0 w-[180px] sm:w-[240px] md:w-[280px] bg-zinc-900 rounded-md overflow-hidden shadow-lg border border-zinc-800/40 hover:border-zinc-700/80 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-10 group relative snap-start"
                >
                  {/* Card Thumbnail */}
                  <div className="aspect-video relative overflow-hidden bg-zinc-950">
                    <img
                      src={video.aniThumbnailUrl}
                      alt={video.videoTitle}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white backdrop-blur-sm">
                        <Play fill="white" size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-red-500 tracking-wider">
                      {video.category}
                    </span>
                    <h3 className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                      {video.videoTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-zinc-500 font-medium">
                      <span>{video.uploadDate}</span>
                      {video.tags && video.tags.length > 0 && (
                        <span className="line-clamp-1">
                          {video.tags.map(t => `#${t}`).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
