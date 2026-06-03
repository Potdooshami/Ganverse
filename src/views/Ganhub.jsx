import { useState, useMemo } from 'react'
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, GitBranch, Star, Eye, Calendar, Tag, ShieldCheck, Play } from 'lucide-react'

// Helper to slugify playlist names to make them look like git folders
const slugify = (text) => {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\uAC00-\uD7A3]/g, '');
}

export default function Ganhub({ videos, onVideoClick }) {
  const [openFolders, setOpenFolders] = useState({})
  const [selectedVideo, setSelectedVideo] = useState(null)

  // 1. Group videos by playlist for folder tree
  const folders = useMemo(() => {
    return videos.reduce((acc, video) => {
      const folderName = slugify(video.playlist)
      if (!acc[folderName]) {
        acc[folderName] = {
          originalName: video.playlist,
          files: []
        }
      }
      acc[folderName].files.push(video)
      return acc
    }, {})
  }, [videos])

  // Select the first video automatically if none selected
  useMemo(() => {
    if (videos && videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0])
      // Ensure its parent folder is open
      const parentFolder = slugify(videos[0].playlist)
      setOpenFolders(prev => ({ ...prev, [parentFolder]: true }))
    }
  }, [videos, selectedVideo])

  const toggleFolder = (folderName) => {
    setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }))
  }

  // 2. Generate Contribution Graph Grass
  const grassGrid = useMemo(() => {
    // Generate dates for the past 53 weeks (371 days) starting from a Sunday
    const result = []
    const today = new Date()
    const currentDayOfWeek = today.getDay()
    
    // Start date is exactly 52 weeks ago, aligned to Sunday
    const totalDays = 53 * 7
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - totalDays + (6 - currentDayOfWeek))
    
    // Create a map of upload date -> video count
    const uploadMap = videos.reduce((acc, video) => {
      acc[video.uploadDate] = (acc[video.uploadDate] || 0) + 1
      return acc
    }, {})

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const count = uploadMap[dateStr] || 0
      
      // Determine green shade level
      let colorClass = 'bg-[#161b22]' // 0 uploads
      if (count === 1) colorClass = 'bg-[#0e4429]' // Level 1
      else if (count === 2) colorClass = 'bg-[#006d32]' // Level 2
      else if (count === 3) colorClass = 'bg-[#26a641]' // Level 3
      else if (count >= 4) colorClass = 'bg-[#39d353]' // Level 4
      
      result.push({
        date: dateStr,
        count,
        colorClass
      })
    }
    return result
  }, [videos])

  // Total commits (uploads) count
  const totalCommits = videos.length

  return (
    <div className="bg-[#0d1117] text-[#c9d1d9] min-h-screen p-4 md:p-8 flex flex-col gap-6 select-none font-mono">
      
      {/* GitHub Repository Header Mockup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#21262d] pb-4 gap-4">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <GitBranch size={16} className="text-[#8b949e]" />
          <span className="text-[#58a6ff] hover:underline cursor-pointer font-bold">pokgant</span>
          <span className="text-[#8b949e]">/</span>
          <span className="text-[#c9d1d9] hover:underline cursor-pointer font-bold">Ganverse</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#30363d] text-[#8b949e] font-semibold bg-[#161b22]">Public</span>
        </div>

        <div className="flex gap-2">
          <div className="flex border border-[#30363d] rounded-md overflow-hidden text-xs bg-[#161b22]">
            <span className="px-3 py-1.5 border-r border-[#30363d] hover:bg-[#21262d] cursor-pointer flex items-center gap-1.5 text-zinc-300">
              <Star size={12} /> Star
            </span>
            <span className="px-3 py-1.5 hover:bg-[#21262d] cursor-pointer font-bold text-white bg-[#0d1117]">
              282
            </span>
          </div>
          <div className="flex border border-[#30363d] rounded-md overflow-hidden text-xs bg-[#161b22]">
            <span className="px-3 py-1.5 border-r border-[#30363d] hover:bg-[#21262d] cursor-pointer flex items-center gap-1.5 text-zinc-300">
              <Eye size={12} /> Watch
            </span>
            <span className="px-3 py-1.5 hover:bg-[#21262d] cursor-pointer font-bold text-white bg-[#0d1117]">
              99+
            </span>
          </div>
        </div>
      </div>

      {/* Code / Explorer Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Repository File Explorer Sidebar (col-span-4) */}
        <div className="lg:col-span-4 border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]/50">
          <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] text-xs font-bold text-[#c9d1d9] flex justify-between items-center">
            <span>FILE EXPLORER</span>
            <span className="text-[10px] text-zinc-500 font-medium">BRANCH: main</span>
          </div>

          <div className="p-3 flex flex-col gap-1 text-xs">
            {/* Root Repository Folder */}
            <div className="flex items-center gap-2 py-1 font-bold text-white">
              <ChevronDown size={14} className="text-zinc-500" />
              <FolderOpen size={14} className="text-[#58a6ff]" />
              <span>Ganverse/</span>
            </div>

            {/* Folder Tree */}
            <div className="pl-4 flex flex-col gap-1.5">
              {Object.entries(folders).map(([folderSlug, folderData]) => {
                const isOpen = openFolders[folderSlug]
                return (
                  <div key={folderSlug} className="flex flex-col gap-1">
                    {/* Folder Header */}
                    <div
                      onClick={() => toggleFolder(folderSlug)}
                      className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#21262d] rounded cursor-pointer transition-colors text-zinc-200"
                    >
                      {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {isOpen ? <FolderOpen size={13} className="text-[#58a6ff]" /> : <Folder size={13} className="text-[#58a6ff]" />}
                      <span className="font-semibold line-clamp-1">{folderSlug}/</span>
                    </div>

                    {/* File List (under folder) */}
                    {isOpen && (
                      <div className="pl-6 flex flex-col gap-1 border-l border-[#30363d] ml-3.5 mt-0.5">
                        {folderData.files.map((file) => {
                          const isSelected = selectedVideo && selectedVideo.id === file.id
                          const fileSlug = file.videoTitle.replace(/\s+/g, '_').replace(/[^\w\uAC00-\uD7A3]/g, '').slice(0, 20) + '.md'
                          return (
                            <div
                              key={file.id}
                              onClick={() => setSelectedVideo(file)}
                              className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-[#1f6feb]/25 border border-[#1f6feb]/50 text-white font-semibold'
                                  : 'hover:bg-[#21262d]/50 text-[#8b949e] hover:text-[#c9d1d9] border border-transparent'
                              }`}
                            >
                              <FileText size={12} className={isSelected ? 'text-[#58a6ff]' : 'text-[#8b949e]'} />
                              <span className="line-clamp-1 text-[11px]">{fileSlug}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Code/Readme Markdown Viewer (col-span-8) */}
        <div className="lg:col-span-8 border border-[#30363d] rounded-lg overflow-hidden bg-[#0d1117] flex flex-col">
          {/* File Header */}
          <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[#8b949e]" />
              <span className="font-semibold text-white">
                {selectedVideo ? selectedVideo.videoTitle.replace(/\s+/g, '_').replace(/[^\w\uAC00-\uD7A3]/g, '').slice(0, 30) + '.md' : 'README.md'}
              </span>
            </div>
            <button
              onClick={() => selectedVideo && onVideoClick(selectedVideo)}
              className="px-3 py-1 bg-[#238636] hover:bg-[#2ea043] text-white font-semibold rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-md"
            >
              <Play size={10} fill="white" /> Run File
            </button>
          </div>

          {/* Markdown Content Panel */}
          {selectedVideo ? (
            <div className="p-6 md:p-8 flex flex-col gap-6 text-sm text-[#c9d1d9] leading-relaxed border-b border-[#21262d] max-h-[500px] overflow-y-auto">
              
              {/* File Title */}
              <h1 className="text-xl md:text-3xl font-bold text-white border-b border-[#21262d] pb-2 leading-snug">
                {selectedVideo.videoTitle}
              </h1>

              {/* Video Thumbnail (Click to Run) */}
              <div
                onClick={() => onVideoClick(selectedVideo)}
                className="relative aspect-video max-w-lg w-full bg-zinc-900 border border-[#30363d] rounded-lg overflow-hidden cursor-pointer group shadow-lg"
              >
                <img
                  src={selectedVideo.aniThumbnailUrl}
                  alt={selectedVideo.videoTitle}
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors">
                  <div className="px-4 py-2 bg-black/60 rounded-full border border-zinc-700/50 flex items-center gap-2 text-xs font-semibold text-white tracking-wider backdrop-blur-sm group-hover:scale-105 transition-transform duration-200">
                    <Play size={12} fill="white" /> CLICK TO COMPILE & RUN
                  </div>
                </div>
              </div>

              {/* File Meta Information Table */}
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full border-collapse text-left border border-[#30363d]">
                  <thead>
                    <tr className="bg-[#161b22] text-[#8b949e]">
                      <th className="px-4 py-2 border border-[#30363d] font-semibold text-xs">PROPERTY</th>
                      <th className="px-4 py-2 border border-[#30363d] font-semibold text-xs">VALUE</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr>
                      <td className="px-4 py-2 border border-[#30363d] font-bold text-[#8b949e]">PLAYLIST</td>
                      <td className="px-4 py-2 border border-[#30363d] text-[#58a6ff] font-semibold">{selectedVideo.playlist}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-[#30363d] font-bold text-[#8b949e]">UPLOAD DATE</td>
                      <td className="px-4 py-2 border border-[#30363d] flex items-center gap-1"><Calendar size={12} /> {selectedVideo.uploadDate}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-[#30363d] font-bold text-[#8b949e]">CATEGORY</td>
                      <td className="px-4 py-2 border border-[#30363d]"><span className="px-2 py-0.5 rounded-full border border-orange-500/30 text-orange-400 text-[10px] bg-orange-500/5">{selectedVideo.category}</span></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-[#30363d] font-bold text-[#8b949e]">TAGS</td>
                      <td className="px-4 py-2 border border-[#30363d]">
                        <div className="flex flex-wrap gap-1">
                          {selectedVideo.tags.map((tag, idx) => (
                            <span key={idx} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#30363d] bg-[#161b22] text-[#8b949e]">
                              <Tag size={8} /> {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
              <ShieldCheck size={36} className="text-zinc-600" />
              <p>선택된 파일이 없습니다. 왼쪽 파일 트리에서 파일을 클릭하세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Contribution Graph Section */}
      <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]/30 p-5 mt-4">
        <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
          <span>{totalCommits} contributions in the last year</span>
          <span className="text-[10px] text-zinc-500 font-medium">({videos.length} videos scraped)</span>
        </h3>

        {/* Contribution Graph Flex Box */}
        <div className="flex flex-col gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Days Grid Container */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 auto-cols-[10px] md:auto-cols-[11px] justify-start w-max">
            {grassGrid.map((day, idx) => (
              <div
                key={idx}
                title={`${day.date}: ${day.count} uploads`}
                className={`w-2.5 h-2.5 md:w-[11px] md:h-[11px] rounded-[2px] transition-all hover:ring-1 hover:ring-white cursor-pointer ${day.colorClass}`}
              ></div>
            ))}
          </div>

          {/* Graph Legend */}
          <div className="flex justify-between items-center text-[10px] text-[#8b949e] mt-1.5 px-1">
            <span>Learn how we count contributions</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#161b22]"></div>
              <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#0e4429]"></div>
              <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#006d32]"></div>
              <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#26a641]"></div>
              <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#39d353]"></div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
