import { useState } from 'react'
import { Star, MessageSquare, Flame, Award, Heart, Plus } from 'lucide-react'

// Sub-component to manage its own input form state and avoid React Hook Rule violations (useState inside loop)
function GanteleReviewCard({ video, onVideoClick, localReviews, onAddReview }) {
  const [inputText, setInputText] = useState('')
  const [inputRating, setInputRating] = useState(5)
  
  const customReview = localReviews[video.id] || {
    rating: video.rating,
    review: video.review
  }
  const displayRating = customReview.rating
  const displayReview = customReview.review

  const handleSubmit = () => {
    if (!inputText.trim()) return
    onAddReview(video.id, inputRating, inputText)
    setInputText('')
  }

  return (
    <div className="bg-[#181a2e] border border-violet-950/40 rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-violet-600/30">
      {/* Video Reference */}
      <div
        onClick={() => onVideoClick(video)}
        className="flex gap-3 cursor-pointer group"
      >
        <div className="w-14 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black">
          <img src={video.aniThumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-violet-400 transition-colors">
            {video.videoTitle}
          </span>
          <span className="text-[9px] text-slate-500">{video.playlist}</span>
        </div>
      </div>

      {/* Active Review View */}
      <div className="bg-[#101121] rounded-lg p-2.5 flex flex-col gap-1 text-xs">
        <div className="flex justify-between items-center">
          <div className="flex text-yellow-400 gap-0.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                size={11}
                fill={idx < displayRating ? "currentColor" : "none"}
                className="text-yellow-400"
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-500">
            평점: {displayRating > 0 ? `${displayRating.toFixed(1)} / 5` : '리뷰 없음'}
          </span>
        </div>
        <p className={`mt-1 text-[11px] leading-relaxed italic ${displayRating > 0 ? 'text-zinc-200' : 'text-slate-600'}`}>
          "{displayReview}"
        </p>
      </div>

      {/* Rating / Write Review form */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400">내 평가 입력:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setInputRating(star)}
                className="text-yellow-400 focus:outline-none cursor-pointer"
              >
                <Star size={12} fill={star <= inputRating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex bg-[#101121] rounded-lg overflow-hidden border border-slate-900 focus-within:border-violet-600">
          <input
            type="text"
            placeholder="재치있는 드립 평 작성..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
            }}
            className="flex-1 px-3 py-1.5 bg-transparent border-none text-[11px] text-white focus:outline-none placeholder-slate-600"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] flex items-center justify-center cursor-pointer transition-colors"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Gantele({ videos, onVideoClick }) {
  const [selectedGenre, setSelectedGenre] = useState('전체')
  const [localReviews, setLocalReviews] = useState({}) // Stores user-submitted mock reviews

  if (!videos || videos.length === 0) return null

  // 1. Get unique playlists as "animation genres"
  const genres = ['전체', ...new Set(videos.map(v => v.playlist))]

  // 2. Filter videos by genre
  const filteredVideos = videos.filter(
    video => selectedGenre === '전체' || video.playlist === selectedGenre
  )

  // Handle local review submission (interactive parody feature!)
  const handleAddReview = (videoId, ratingValue, text) => {
    setLocalReviews(prev => ({
      ...prev,
      [videoId]: {
        rating: ratingValue,
        review: text
      }
    }))
  }

  return (
    <div className="bg-[#0b0c16] text-[#b4b7c9] min-h-screen p-4 md:p-8 select-none flex flex-col gap-8 font-sans">
      
      {/* Laftel Style Banner */}
      <div className="relative w-full h-[180px] md:h-[240px] rounded-2xl overflow-hidden bg-gradient-to-r from-violet-900 to-indigo-950 flex items-center p-6 md:p-12 border border-violet-950">
        <div className="relative z-10 flex flex-col gap-2 max-w-lg">
          <span className="text-[10px] font-bold text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded border border-violet-500/20 w-fit uppercase tracking-wider">
            Laftel Parody Theme
          </span>
          <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            전 세계를 덕질하는 아재,<br/>
            폭간트 애니메이션 극장!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            별점과 한줄평 레이아웃 제공 • 애니메이션 필터 썸네일 탑재
          </p>
        </div>
        {/* Abstract background graphics */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 scale-150">
          <Flame size={200} />
        </div>
      </div>

      {/* Genre Filter Chip Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-900">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              selectedGenre === genre
                ? 'bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-600/20'
                : 'bg-[#181a2e] hover:bg-[#222542] text-slate-400 hover:text-slate-200'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Animation Grid List (col-span-8) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award size={16} className="text-violet-500" />
            인기 스트리밍 순위 ({filteredVideos.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
            {filteredVideos.map(video => {
              // Retrieve review data
              const customReview = localReviews[video.id] || {
                rating: video.rating,
                review: video.review
              }
              const displayRating = customReview.rating > 0 ? customReview.rating.toFixed(1) : "평가 없음"

              // Regular YouTube high-quality thumbnail URL for crossfade hover fallback
              const ytThumbnail = `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`

              return (
                <div
                  key={video.id}
                  className="flex flex-col gap-2 group cursor-pointer"
                  onClick={() => onVideoClick(video)}
                >
                  {/* Poster Thumbnail (Anime Cross-fade hover styling!) */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#181a2e] border border-violet-950/20 shadow-md">
                    
                    {/* Layer 1 (Bottom): Youtube original thumbnail */}
                    <img
                      src={ytThumbnail}
                      alt={video.videoTitle}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Layer 2 (Top): Anime stylized thumbnail */}
                    <img
                      src={video.aniThumbnailUrl}
                      alt={video.videoTitle}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
                      loading="lazy"
                    />

                    {/* Left Top Badge: Star Rating display */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-yellow-400 font-extrabold flex items-center gap-0.5 border border-yellow-500/20">
                      <Star size={10} fill="currentColor" />
                      <span>{displayRating}</span>
                    </div>

                    {/* Right Top Badge: Category */}
                    <div className="absolute top-2 right-2 bg-violet-600/90 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-white font-extrabold tracking-wide uppercase">
                      {video.category}
                    </div>

                    {/* Hover Overlay Play button */}
                    <div className="absolute inset-0 bg-violet-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-violet-600 border border-violet-400/30 flex items-center justify-center text-white shadow-xl shadow-violet-600/30">
                        <Play fill="white" size={18} className="ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="flex flex-col gap-1 px-1 mt-1">
                    <h4 className="text-xs md:text-sm font-bold text-[#e1e2e9] group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug">
                      {video.videoTitle}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                      {video.playlist}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: User Parody One-Line Reviews Feed (col-span-4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare size={16} className="text-violet-500" />
            라프텔 한줄평 피드
          </h3>

          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredVideos.slice(0, 10).map(video => (
              <GanteleReviewCard
                key={video.id}
                video={video}
                onVideoClick={onVideoClick}
                localReviews={localReviews}
                onAddReview={handleAddReview}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Play icon SVG
const Play = ({ fill = "none", size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill={fill} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
)
