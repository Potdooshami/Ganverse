import { useState } from 'react'
import { Home, Compass, PlaySquare, Clock, ThumbsUp, Search, SlidersHorizontal, Play } from 'lucide-react'

export default function Gantube({ videos, onVideoClick }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState('전체')

  if (!videos || videos.length === 0) return null

  // 1. Get unique playlists for filter chips
  const playlists = ['전체', ...new Set(videos.map(v => v.playlist))]

  // 2. Filter videos by search query and playlist chip
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesPlaylist = selectedPlaylist === '전체' || video.playlist === selectedPlaylist
    return matchesSearch && matchesPlaylist
  })

  // Channel Profile Avatar
  const channelAvatar = "https://yt3.googleusercontent.com/ytc/AIdro_k3p_1i2y5Gv6-Hj8C7Yy6l6A6t=s160-c-k-c0x00ffffff-no-rj" // fallback to Poggant avatar if possible, or a nice styled placeholder. Let's use a nice initial/avatar.

  return (
    <div className="bg-[#0f0f0f] text-zinc-100 min-h-screen flex select-none">
      
      {/* YouTube Sidebar (Left side) - Hidden on mobile, fixed on desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0f0f0f] p-3 gap-1 flex-shrink-0 border-r border-zinc-900">
        <button className="flex items-center gap-6 px-4 py-2.5 rounded-xl bg-zinc-800 text-white font-medium text-sm w-full text-left cursor-pointer">
          <Home size={18} />
          홈
        </button>
        <button className="flex items-center gap-6 px-4 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-white font-medium text-sm w-full text-left cursor-pointer transition-colors">
          <Compass size={18} />
          탐색 (Shorts)
        </button>
        <button className="flex items-center gap-6 px-4 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-white font-medium text-sm w-full text-left cursor-pointer transition-colors">
          <PlaySquare size={18} />
          구독
        </button>
        <hr className="border-zinc-800 my-3" />
        <span className="px-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">보관함</span>
        <button className="flex items-center gap-6 px-4 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-white font-medium text-sm w-full text-left cursor-pointer transition-colors">
          <Clock size={18} />
          시청 기록
        </button>
        <button className="flex items-center gap-6 px-4 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-white font-medium text-sm w-full text-left cursor-pointer transition-colors">
          <ThumbsUp size={18} />
          좋아요 표시한 영상
        </button>
      </aside>

      {/* Main Grid Area (Right side) */}
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Search Bar & Filter Chips Header */}
        <div className="flex flex-col gap-4">
          
          {/* Internal Search */}
          <div className="flex max-w-xl w-full mx-auto bg-zinc-800/40 rounded-full border border-zinc-700/80 overflow-hidden focus-within:border-blue-500 focus-within:bg-black transition-all">
            <input
              type="text"
              placeholder="검색할 영상 제목이나 #태그 입력..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-5 py-2.5 bg-transparent border-none text-zinc-100 text-sm focus:outline-none placeholder-zinc-500"
            />
            <div className="px-6 flex items-center bg-zinc-800 hover:bg-zinc-700 border-l border-zinc-700 cursor-pointer text-zinc-300 hover:text-white transition-colors">
              <Search size={16} />
            </div>
          </div>

          {/* Filter Playlist Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
            {playlists.map((plName) => (
              <button
                key={plName}
                onClick={() => setSelectedPlaylist(plName)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer snap-start ${
                  selectedPlaylist === plName
                    ? 'bg-white text-black font-bold'
                    : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200'
                }`}
              >
                {plName}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid list */}
        {filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <SlidersHorizontal size={36} className="mb-2" />
            <p className="text-sm font-medium">검색 결과에 맞는 영상이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onVideoClick(video)}
                className="flex flex-col gap-3 group cursor-pointer"
              >
                {/* Video Card Thumbnail */}
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/30 relative">
                  <img
                    src={video.aniThumbnailUrl}
                    alt={video.videoTitle}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    loading="lazy"
                  />
                  {/* YouTube Style Hover play icon */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform transform scale-90 group-hover:scale-100 duration-200">
                      <Play size={20} fill="white" className="ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Card Info Row */}
                <div className="flex gap-3 px-1">
                  {/* Channel Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-800">
                    <img src={channelAvatar} alt="폭간트" className="w-full h-full object-cover" />
                  </div>

                  {/* Title & Stats */}
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                      {video.videoTitle}
                    </h3>
                    <div className="flex flex-col text-xs text-zinc-400 font-medium">
                      <span>폭간트</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500">
                        <span>업로드: {video.uploadDate}</span>
                        <span>•</span>
                        <span>{video.playlist}</span>
                      </div>
                    </div>

                    {/* Hashtags list */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {video.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] text-blue-400 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
