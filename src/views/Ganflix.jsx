import { useState, useMemo, useRef } from 'react'
import { Play, Info, Plus, Check, ThumbsUp, Volume2, VolumeX, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react'

export default function Ganflix({ videos, onVideoClick }) {
  if (!videos || videos.length === 0) return null

  // 1. States for user interaction
  const [myList, setMyList] = useState({}) // { id: boolean }
  const [likes, setLikes] = useState({}) // { id: boolean }
  const [selectedDetailVideo, setSelectedDetailVideo] = useState(null)
  const [isMuted, setIsMuted] = useState(true)

  // 2. Refs for horizontal slider scrolling
  const rowRefs = useRef({})

  // 3. Find Hero Video (where isHero is true, or fallback to first video)
  const heroVideo = useMemo(() => {
    return videos.find(v => v.isHero) || videos[0]
  }, [videos])

  // 4. Group videos by playlist for rows
  const groupedVideos = useMemo(() => {
    return videos.reduce((acc, video) => {
      if (!acc[video.playlist]) {
        acc[video.playlist] = []
      }
      acc[video.playlist].push(video)
      return acc
    }, {})
  }, [videos])

  // Helper to scroll sliders
  const scroll = (playlistName, direction) => {
    const row = rowRefs.current[playlistName]
    if (row) {
      const scrollAmount = direction === 'left' ? -row.offsetWidth * 0.75 : row.offsetWidth * 0.75
      row.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Helper to toggle myList
  const toggleMyList = (id, e) => {
    e.stopPropagation()
    setMyList(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Helper to toggle like
  const toggleLike = (id, e) => {
    e.stopPropagation()
    setLikes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Generate dynamic match rate
  const getMatchRate = (id) => {
    const seed = (id * 7) % 7
    return 93 + seed // 93% to 99% match
  }

  // Get dynamic synopsis or fallback
  const getSynopsis = (video) => {
    if (video.review && video.review !== '미작성') return video.review
    return `폭간트의 스릴 넘치고 유쾌한 '${video.playlist}' 시리즈! '${video.videoTitle}' 편에서는 현지의 생생한 문화와 대자연, 그리고 예측불허의 유쾌한 돌발 상황들을 폭간트 특유의 날것 그대로의 감성으로 담아냈습니다.`
  }

  return (
    <div className="bg-zinc-950 text-zinc-50 pb-32 select-none min-h-screen relative font-sans">
      {/* 1. Hero Billboard Banner Section */}
      <div className="relative w-full h-[56.25vw] md:h-[80vh] max-h-[800px] overflow-hidden flex items-end">
        {/* Banner Background Image */}
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${heroVideo.aniThumbnailUrl})` }}>
          {/* Fading dark cinematic overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/10 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl px-6 md:px-16 pb-12 md:pb-24 flex flex-col gap-3 md:gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-extrabold text-red-600 tracking-widest bg-red-600/10 border border-red-600/30 px-2 py-0.5 rounded uppercase">
              GANFLIX Original
            </span>
            <span className="text-[10px] font-bold text-yellow-500 tracking-wide flex items-center gap-1">
              🔥 오늘 대한민국의 TOP 10 콘텐츠 1위
            </span>
          </div>
          
          <h1 className="text-3xl md:text-6xl font-black text-white leading-tight drop-shadow-lg tracking-tight select-text max-w-2xl">
            {heroVideo.videoTitle}
          </h1>

          <div className="flex items-center gap-3 text-xs md:text-sm font-semibold">
            <span className="text-emerald-500">{getMatchRate(heroVideo.id)}% 일치</span>
            <span className="text-zinc-400">{heroVideo.uploadDate.split('-')[0]}</span>
            <span className="border border-zinc-500 text-zinc-300 text-[10px] px-1 rounded font-bold">15+</span>
            <span className="text-zinc-400 font-medium">{heroVideo.playlist}</span>
          </div>

          <p className="text-xs md:text-sm text-zinc-300 font-normal leading-relaxed line-clamp-3 max-w-xl select-text drop-shadow">
            {getSynopsis(heroVideo)}
          </p>
          
          {/* Action Buttons & Mute Control */}
          <div className="flex justify-between items-center w-full mt-2 md:mt-4">
            <div className="flex gap-3">
              <button
                onClick={() => onVideoClick(heroVideo)}
                className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 md:px-8 py-2.5 md:py-3 rounded font-extrabold text-sm md:text-base transition-all shadow-lg cursor-pointer transform active:scale-95"
              >
                <Play fill="black" size={18} />
                재생
              </button>
              <button
                onClick={() => setSelectedDetailVideo(heroVideo)}
                className="flex items-center gap-2 bg-zinc-600/50 hover:bg-zinc-600/80 text-white px-6 md:px-8 py-2.5 md:py-3 rounded font-extrabold text-sm md:text-base transition-all border border-zinc-500/20 cursor-pointer backdrop-blur-sm"
              >
                <Info size={18} />
                상세 정보
              </button>
            </div>

            {/* Mute toggle button (simulation) */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="mr-6 md:mr-16 p-2 rounded-full border border-zinc-500/40 hover:border-zinc-300 bg-zinc-900/60 text-zinc-300 hover:text-white backdrop-blur-sm cursor-pointer transition-colors"
              title={isMuted ? "음소거 해제" : "음소거"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Playlist Rows Section */}
      <div className="px-6 md:px-16 mt-8 flex flex-col gap-12 relative z-20">
        {Object.entries(groupedVideos).map(([playlistName, playlistVideos]) => (
          <div key={playlistName} className="flex flex-col gap-2 group/row relative">
            {/* Playlist Title */}
            <h2 className="text-lg md:text-2xl font-black tracking-wide text-zinc-100 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 w-fit">
              {playlistName}
              <span className="text-[10px] md:text-xs text-red-500 font-extrabold opacity-0 group-hover/row:opacity-100 transition-opacity ml-2">모두 보기 ›</span>
            </h2>

            {/* Carousel Container */}
            <div className="relative w-full">
              {/* Left Scroll Button */}
              <button
                onClick={() => scroll(playlistName, 'left')}
                className="absolute left-0 top-0 bottom-4 w-12 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity z-30 border-r border-zinc-900/30 backdrop-blur-sm cursor-pointer rounded-r"
              >
                <ChevronLeft size={28} />
              </button>

              {/* Slider Row Grid */}
              <div
                ref={el => rowRefs.current[playlistName] = el}
                className="flex gap-4 overflow-x-auto py-4 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
              >
                {playlistVideos.map((video) => {
                  const isStarred = likes[video.id]
                  const isAdded = myList[video.id]
                  return (
                    <div
                      key={video.id}
                      className="flex-shrink-0 w-[180px] sm:w-[240px] md:w-[280px] bg-zinc-900 rounded-md overflow-visible cursor-pointer group/card relative snap-start transition-all duration-300 shadow-md border border-zinc-800/40 hover:scale-[1.15] hover:-translate-y-4 hover:z-30"
                    >
                      {/* Card Media Preview */}
                      <div className="aspect-video relative overflow-hidden bg-zinc-950 rounded-t-md" onClick={() => onVideoClick(video)}>
                        <img
                          src={video.aniThumbnailUrl}
                          alt={video.videoTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Hover Overlay Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white backdrop-blur-sm">
                            <Play fill="white" size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Default View Info */}
                      <div className="p-3 flex flex-col gap-1 rounded-b-md bg-zinc-900 group-hover/card:rounded-b-none group-hover/card:border-b-0">
                        <span className="text-[9px] font-extrabold text-red-500 tracking-wider">
                          {video.category}
                        </span>
                        <h3 className="text-xs font-bold text-zinc-200 line-clamp-1 leading-snug group-hover/card:text-white transition-colors">
                          {video.videoTitle}
                        </h3>
                        <div className="flex justify-between items-center mt-1 text-[9px] text-zinc-500 font-semibold">
                          <span>{video.uploadDate}</span>
                          <span>HD</span>
                        </div>
                      </div>

                      {/* Expandable Hover Panel (Netflix hover-zoom card body detail) */}
                      <div className="absolute top-full left-0 right-0 bg-zinc-900 border-x border-b border-zinc-800 rounded-b-md p-4 flex flex-col gap-2.5 shadow-2xl opacity-0 scale-90 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all duration-300 pointer-events-none group-hover/card:pointer-events-auto z-40">
                        {/* Interactive Buttons Row */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {/* Play Circle */}
                            <button
                              onClick={() => onVideoClick(video)}
                              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 cursor-pointer transition-colors shadow mr-1"
                            >
                              <Play fill="black" size={12} />
                            </button>
                            {/* My List (Plus/Check) */}
                            <button
                              onClick={(e) => toggleMyList(video.id, e)}
                              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer mr-1 ${
                                isAdded 
                                  ? 'border-[#26a641] bg-[#26a641]/10 text-[#26a641]' 
                                  : 'border-zinc-500 hover:border-white text-zinc-300 hover:text-white'
                              }`}
                              title={isAdded ? "내가 찜한 콘텐츠에서 삭제" : "내가 찜한 콘텐츠에 추가"}
                            >
                              {isAdded ? <Check size={14} /> : <Plus size={14} />}
                            </button>
                            {/* Like (ThumbsUp) */}
                            <button
                              onClick={(e) => toggleLike(video.id, e)}
                              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                                isStarred 
                                  ? 'border-red-500 bg-red-500/10 text-red-500' 
                                  : 'border-zinc-500 hover:border-white text-zinc-300 hover:text-white'
                              }`}
                              title={isStarred ? "좋아요 취소" : "좋아요"}
                            >
                              <ThumbsUp size={12} fill={isStarred ? "currentColor" : "none"} />
                            </button>
                          </div>

                          {/* More Info Dropdown Trigger */}
                          <button
                            onClick={() => setSelectedDetailVideo(video)}
                            className="w-8 h-8 rounded-full border border-zinc-500 hover:border-white flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="상세 정보 보기"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Extended Details */}
                        <div className="flex flex-col gap-1.5 text-[10px] text-zinc-400 font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500">{getMatchRate(video.id)}% 일치</span>
                            <span className="text-zinc-300">{video.uploadDate.split('-')[0]}</span>
                            <span className="border border-zinc-500 text-zinc-300 text-[8px] px-1 rounded font-extrabold scale-90">15+</span>
                          </div>
                          
                          <p className="text-[10px] font-medium text-zinc-300 line-clamp-2 leading-relaxed">
                            {getSynopsis(video)}
                          </p>

                          {video.tags && video.tags.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-0.5 text-zinc-400">
                              {video.tags.slice(0, 3).map((t, idx) => (
                                <span key={idx} className="hover:text-white">#{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                onClick={() => scroll(playlistName, 'right')}
                className="absolute right-0 top-0 bottom-4 w-12 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity z-30 border-l border-zinc-900/30 backdrop-blur-sm cursor-pointer rounded-l"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Detailed Info Overlay Modal (Netflix Style) */}
      {selectedDetailVideo && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 overflow-y-auto py-8 md:py-16 px-4 scrollbar-none">
          {/* Backdrop click to close */}
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedDetailVideo(null)}></div>

          {/* Modal Content container */}
          <div className="relative w-full max-w-4xl bg-zinc-900 rounded-lg border border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setSelectedDetailVideo(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-500 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header Banner */}
            <div className="relative aspect-video max-h-[420px] w-full overflow-hidden flex items-end">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${selectedDetailVideo.aniThumbnailUrl})` }}>
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent"></div>
              </div>

              <div className="relative z-10 p-6 md:p-10 flex flex-col gap-3 w-full">
                <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest bg-red-600/10 border border-red-600/30 px-2.5 py-1 rounded w-fit">
                  {selectedDetailVideo.playlist}
                </span>
                
                <h2 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md max-w-2xl select-text">
                  {selectedDetailVideo.videoTitle}
                </h2>

                <div className="flex gap-3 mt-3 items-center">
                  <button
                    onClick={() => {
                      onVideoClick(selectedDetailVideo)
                      setSelectedDetailVideo(null)
                    }}
                    className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded font-extrabold text-sm transition-all shadow-lg cursor-pointer"
                  >
                    <Play fill="black" size={14} />
                    재생
                  </button>

                  {/* Add to my list */}
                  <button
                    onClick={(e) => toggleMyList(selectedDetailVideo.id, e)}
                    className={`p-2.5 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      myList[selectedDetailVideo.id] 
                        ? 'border-[#26a641] bg-[#26a641]/10 text-[#26a641]' 
                        : 'border-zinc-500 hover:border-white text-zinc-300 hover:text-white'
                    }`}
                  >
                    {myList[selectedDetailVideo.id] ? <Check size={16} /> : <Plus size={16} />}
                  </button>

                  {/* Like */}
                  <button
                    onClick={(e) => toggleLike(selectedDetailVideo.id, e)}
                    className={`p-2.5 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      likes[selectedDetailVideo.id] 
                        ? 'border-red-500 bg-red-500/10 text-red-500' 
                        : 'border-zinc-500 hover:border-white text-zinc-300 hover:text-white'
                    }`}
                  >
                    <ThumbsUp size={14} fill={likes[selectedDetailVideo.id] ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-10 select-text">
              {/* Left Column: Synopsis */}
              <div className="md:col-span-8 flex flex-col gap-6">
                <div className="flex items-center gap-3 text-xs md:text-sm font-semibold">
                  <span className="text-emerald-500">{getMatchRate(selectedDetailVideo.id)}% 일치</span>
                  <span className="text-zinc-400">{selectedDetailVideo.uploadDate}</span>
                  <span className="border border-zinc-500 text-zinc-300 text-[10px] px-1 rounded font-extrabold">15+</span>
                  <span className="text-zinc-400 font-medium">화질: Ultra HD 4K</span>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed font-normal">
                  {getSynopsis(selectedDetailVideo)}
                </p>
              </div>

              {/* Right Column: Credits */}
              <div className="md:col-span-4 flex flex-col gap-3.5 text-xs text-zinc-400">
                <div>
                  <span className="text-zinc-500 font-bold block mb-0.5">출연</span>
                  <span className="text-zinc-300 hover:underline cursor-pointer">폭간트 (Pokgant)</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold block mb-0.5">장르</span>
                  <span className="text-zinc-300 hover:underline cursor-pointer">{selectedDetailVideo.playlist}</span>
                </div>
                {selectedDetailVideo.tags && selectedDetailVideo.tags.length > 0 && (
                  <div>
                    <span className="text-zinc-500 font-bold block mb-0.5">이 프로그램의 특징</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedDetailVideo.tags.map((t, idx) => (
                        <span key={idx} className="text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded text-[10px]">#{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Episodes List (Videos from the same playlist) */}
            <div className="p-6 md:p-10 border-t border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg md:text-xl font-extrabold text-white">시즌 1: 에피소드</h3>
                <span className="text-xs text-zinc-400 font-bold">
                  {groupedVideos[selectedDetailVideo.playlist]?.length || 0}개 에피소드
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {(groupedVideos[selectedDetailVideo.playlist] || []).map((episode, idx) => {
                  const isCurrent = episode.id === selectedDetailVideo.id
                  return (
                    <div
                      key={episode.id}
                      onClick={() => {
                        onVideoClick(episode)
                        setSelectedDetailVideo(null)
                      }}
                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-zinc-800/60 border-zinc-700'
                          : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-800/40 hover:border-zinc-800'
                      }`}
                    >
                      {/* Episode Thumbnail with Play hover */}
                      <div className="w-full sm:w-48 aspect-video flex-shrink-0 relative overflow-hidden bg-zinc-950 rounded-md">
                        <img
                          src={episode.aniThumbnailUrl}
                          alt={episode.videoTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <Play fill="white" size={16} className="text-white" />
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-bold text-zinc-300">
                          EP {idx + 1}
                        </span>
                      </div>

                      {/* Episode Content */}
                      <div className="flex-grow flex flex-col justify-center gap-1.5 select-text">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-extrabold leading-snug line-clamp-2 ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                            {episode.videoTitle}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 font-medium leading-relaxed">
                          {getSynopsis(episode)}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-bold mt-1">업로드: {episode.uploadDate}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* More Like This (Recommend other videos in the same category) */}
            <div className="p-6 md:p-10 border-t border-zinc-800 bg-zinc-950/20">
              <h3 className="text-lg md:text-xl font-extrabold text-white mb-6">비슷한 콘텐츠</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {videos
                  .filter(v => v.category === selectedDetailVideo.category && v.id !== selectedDetailVideo.id)
                  .slice(0, 6)
                  .map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedDetailVideo(video)}
                      className="bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-md overflow-hidden flex flex-col cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="aspect-video w-full bg-zinc-950 relative">
                        <img
                          src={video.aniThumbnailUrl}
                          alt={video.videoTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute top-2 right-2 border border-zinc-500 text-zinc-300 text-[8px] px-1 rounded font-bold bg-zinc-950/70">15+</span>
                      </div>

                      <div className="p-4 flex flex-col gap-2 flex-grow select-text">
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-500 font-extrabold text-[10px]">{getMatchRate(video.id)}% 일치</span>
                          <span className="text-zinc-500 text-[10px] font-bold">{video.uploadDate.split('-')[0]}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed">
                          {video.videoTitle}
                        </h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-3 leading-relaxed mt-1 font-medium">
                          {getSynopsis(video)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
