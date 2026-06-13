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

// Map playlists to GitHub repositories styled after Pokgant's playlists
const playlistToRepoMap = {
  '먹고놀기_국내': 'korea-domestic-trips',
  '유라시아_오토바이_여행_시즌1': 'eurasia-motorcycle-travel-s1',
  '인도인같은_한국인의_인도여행': 'india-travel-vlog',
  '다이어트_동남아_자전거_여행': 'southeast-asia-bicycle-diet',
  '히말라야와_미소의_나라_네팔여행': 'nepal-himalaya-trekking',
  '각종_영상_몰아보기': 'video-marathon-binge-watch',
  '인도네시아_북수마트라_여행': 'north-sumatra-adventure',
  '압도적_대자연과_뜨거운_사람들_환상의_파키스탄_여행기': 'pakistan-wilderness-travel',
  '일본_큐슈_미니벨로_자전거_여행': 'kyushu-minivelo-bicycle',
  '일본인같은_한국인의_큐슈_소도시_여행': 'kyushu-small-town-exploration',
  '촉간트의_삼국지_성지순례': 'three-kingdoms-pilgrimage',
  '총성이_울리는_미소의_나라_미얀마_여행': 'myanmar-civil-war-travel',
  '매우_짧은_해외여행_모음집': 'short-global-trips',
  '큐슈_구석구석_렌트카_여행': 'kyushu-rentacar-roadtrip',
  '혼자서_주절주절_모음집': 'soliloquy-talk-archive',
  '남의_채널_출연한_영상': 'guest-collaborations'
};

const repoToPlaylistMap = {
  'korea-domestic-trips': '먹고놀기_국내',
  'eurasia-motorcycle-travel-s1': '유라시아_오토바이_여행_시즌1',
  'india-travel-vlog': '인도인같은_한국인의_인도여행',
  'southeast-asia-bicycle-diet': '다이어트_동남아_자전거_여행',
  'nepal-himalaya-trekking': '히말라야와_미소의_나라_네팔여행',
  'video-marathon-binge-watch': '각종_영상_몰아보기',
  'north-sumatra-adventure': '인도네시아_북수마트라_여행',
  'pakistan-wilderness-travel': '압도적_대자연과_뜨거운_사람들_환상의_파키스탄_여행기',
  'kyushu-minivelo-bicycle': '일본_큐슈_미니벨로_자전거_여행',
  'kyushu-small-town-exploration': '일본인같은_한국인의_큐슈_소도시_여행',
  'three-kingdoms-pilgrimage': '촉간트의_삼국지_성지순례',
  'myanmar-civil-war-travel': '총성이_울리는_미소의_나라_미얀마_여행',
  'short-global-trips': '매우_짧은_해외여행_모음집',
  'kyushu-rentacar-roadtrip': '큐슈_구석구석_렌트카_여행',
  'soliloquy-talk-archive': '혼자서_주절주절_모음집',
  'guest-collaborations': '남의_채널_출연한_영상'
};

export default function Ganhub({ videos, onVideoClick }) {
  const [openFolders, setOpenFolders] = useState({})
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'repositories' | 'repo-explorer'
  const [selectedYear, setSelectedYear] = useState('lastYear')

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

  const handleRepoClick = (repoName) => {
    const folderSlug = repoToPlaylistMap[repoName] || repoName
    setOpenFolders(prev => ({ ...prev, [folderSlug]: true }))
    setActiveTab('repo-explorer')
    const folderFiles = folders[folderSlug]?.files || []
    if (folderFiles.length > 0) {
      setSelectedVideo(folderFiles[0])
    }
  }

  // 2. Generate Contribution Graph Grass
  const grassGrid = useMemo(() => {
    const result = []
    let startDate, endDate
    
    if (selectedYear === 'lastYear') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const totalDays = 52 * 7 // 364 days (52 weeks)
      startDate = new Date(today)
      startDate.setDate(today.getDate() - totalDays - today.getDay())
      
      endDate = new Date(today)
      endDate.setDate(today.getDate() + (6 - today.getDay()))
    } else {
      const year = parseInt(selectedYear, 10)
      // Start from the Sunday on or before Jan 1 of that year
      const jan1 = new Date(year, 0, 1)
      const jan1Day = jan1.getDay() // 0 = Sunday, 1 = Monday, etc.
      startDate = new Date(year, 0, 1 - jan1Day)
      
      // End on the Saturday on or after Dec 31 of that year
      const dec31 = new Date(year, 11, 31)
      const dec31Day = dec31.getDay()
      endDate = new Date(year, 11, 31 + (6 - dec31Day))
    }
    
    // Calculate total days
    const totalDays = Math.round((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1
    
    // Create a map of upload date -> video count
    const uploadMap = videos.reduce((acc, video) => {
      acc[video.uploadDate] = (acc[video.uploadDate] || 0) + 1
      return acc
    }, {})

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      
      // Format d to YYYY-MM-DD in local time to avoid timezone offset shifts!
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const date = String(d.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${date}`
      
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
  }, [videos, selectedYear])

  const totalCommits = useMemo(() => {
    return grassGrid.reduce((sum, day) => sum + day.count, 0)
  }, [grassGrid])

  const channelAvatar = "https://yt3.googleusercontent.com/klyjzplPDuBPXX3KOc6EH5BeUVJL98KRYOUmogit9vCeBW0L_jbBrQWsucdheBsY-NJdR5XM=s176-c-k-c0x00ffffff-no-rj"

  // 3. Extract lists of unique playlists contributed in selected period
  const contributedPlaylists = useMemo(() => {
    const yearFilteredVideos = videos.filter(video => {
      if (selectedYear === 'lastYear') {
        const today = new Date()
        const videoDate = new Date(video.uploadDate)
        const diffDays = Math.ceil(Math.abs(today - videoDate) / (1000 * 60 * 60 * 24))
        return diffDays <= 371
      } else {
        return video.uploadDate.startsWith(selectedYear)
      }
    })
    return Array.from(new Set(yearFilteredVideos.map(v => v.playlist)))
  }, [videos, selectedYear])

  // 4. Calculate commits, issues, PRs, code reviews activity overview
  const activityOverview = useMemo(() => {
    let commits = 0
    let issues = 0
    let prs = 0
    let codeReviews = 0

    const yearFilteredVideos = videos.filter(video => {
      if (selectedYear === 'lastYear') {
        const today = new Date()
        const videoDate = new Date(video.uploadDate)
        const diffDays = Math.ceil(Math.abs(today - videoDate) / (1000 * 60 * 60 * 24))
        return diffDays <= 371
      } else {
        return video.uploadDate.startsWith(selectedYear)
      }
    })

    yearFilteredVideos.forEach(video => {
      const p = video.playlist
      if (p.includes('국내') || p.includes('몰아보기') || p.includes('기타')) {
        commits++
      } else if (p.includes('자전거') || p.includes('인도여행') || p.includes('수마트라')) {
        issues++
      } else if (p.includes('남의 채널') || p.includes('짧은') || p.includes('네팔')) {
        prs++
      } else {
        codeReviews++
      }
    })

    const total = commits + issues + prs + codeReviews
    if (total === 0) {
      return { commits: 0, issues: 0, prs: 0, codeReviews: 0, commitPct: 0, issuePct: 0, prPct: 0, crPct: 0, total: 0 }
    }

    return {
      commits,
      issues,
      prs,
      codeReviews,
      commitPct: Math.round((commits / total) * 100),
      issuePct: Math.round((issues / total) * 100),
      prPct: Math.round((prs / total) * 100),
      crPct: Math.round((codeReviews / total) * 100),
      total
    }
  }, [videos, selectedYear])

  // 5. Generate month labels aligned with columns
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = ''
    let lastPlacedWeek = -10
    const weeksCount = Math.ceil(grassGrid.length / 7)
    
    for (let w = 0; w < weeksCount; w++) {
      const dayIdx = w * 7
      if (dayIdx < grassGrid.length) {
        const day = grassGrid[dayIdx]
        const dateParts = day.date.split('-')
        const monthNum = parseInt(dateParts[1], 10)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const currentMonth = monthNames[monthNum - 1]
        
        if (currentMonth !== lastMonth) {
          // If it is a calendar year (not lastYear) and the very first week is Dec, skip placing Dec
          // so that the first month label displayed is Jan at week 1.
          if (selectedYear !== 'lastYear' && w === 0 && currentMonth === 'Dec') {
            lastMonth = currentMonth
            continue
          }

          if (w - lastPlacedWeek >= 3) {
            labels.push({
              weekIndex: w,
              label: currentMonth
            })
            lastPlacedWeek = w
          }
          lastMonth = currentMonth
        }
      }
    }
    return labels
  }, [grassGrid, selectedYear])

  // 6. Generate Contribution Activity Feed
  const activityTimeline = useMemo(() => {
    const yearFilteredVideos = videos.filter(video => {
      if (selectedYear === 'lastYear') {
        const today = new Date()
        const videoDate = new Date(video.uploadDate)
        const diffDays = Math.ceil(Math.abs(today - videoDate) / (1000 * 60 * 60 * 24))
        return diffDays <= 371
      } else {
        return video.uploadDate.startsWith(selectedYear)
      }
    })

    const sorted = [...yearFilteredVideos].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))

    const groups = {}
    sorted.forEach(video => {
      const date = new Date(video.uploadDate)
      const year = date.getFullYear()
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      const monthName = monthNames[date.getMonth()]
      const key = `${monthName} ${year}`

      if (!groups[key]) {
        groups[key] = {
          month: monthName,
          year,
          videos: []
        }
      }
      groups[key].videos.push(video)
    })

    return Object.values(groups).map(g => {
      const playlistCounts = g.videos.reduce((acc, v) => {
        acc[v.playlist] = (acc[v.playlist] || 0) + 1
        return acc
      }, {})

      const commitsList = Object.entries(playlistCounts).map(([playlist, count]) => ({
        playlist,
        count
      })).sort((a, b) => b.count - a.count)

      // Find first upload dates of playlists to see if "created" in this month
      const playlistFirstUpload = videos.reduce((acc, v) => {
        if (!acc[v.playlist] || v.uploadDate < acc[v.playlist]) {
          acc[v.playlist] = v.uploadDate
        }
        return acc
      }, {})

      const reposCreated = Object.entries(playlistFirstUpload)
        .filter(([playlist, dateStr]) => {
          const d = new Date(dateStr)
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
          const mName = monthNames[d.getMonth()]
          return d.getFullYear() === g.year && mName === g.month
        })
        .map(([playlist, dateStr]) => {
          const d = new Date(dateStr)
          const day = d.getDate()
          const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]
          
          let lang = 'JavaScript'
          let langColor = 'bg-yellow-500'
          if (playlist.includes('먹고놀기')) {
            lang = 'Jupyter Notebook'
            langColor = 'bg-orange-500'
          } else if (playlist.includes('오토바이')) {
            lang = 'Python'
            langColor = 'bg-blue-500'
          } else if (playlist.includes('인도여행')) {
            lang = 'HTML'
            langColor = 'bg-red-500'
          } else if (playlist.includes('자전거')) {
            lang = 'JavaScript'
            langColor = 'bg-yellow-500'
          } else if (playlist.includes('네팔')) {
            lang = 'TeX'
            langColor = 'bg-green-500'
          }

          return {
            playlist,
            lang,
            langColor,
            dateLabel: `${monthShort} ${day}`
          }
        })

      return {
        key: g.key,
        month: g.month,
        year: g.year,
        totalCommits: g.videos.length,
        totalRepos: commitsList.length,
        commitsList,
        reposCreated
      }
    })
  }, [videos, selectedYear])

  // Profile Sidebar Component
  const renderProfileSidebar = () => (
    <div className="w-full md:w-1/4 flex flex-col gap-5 flex-shrink-0 select-none md:sticky md:top-4">
      {/* Avatar Container */}
      <div className="relative group rounded-full overflow-hidden border border-[#30363d] aspect-square w-full max-w-[296px] mx-auto md:mx-0">
        <img src={channelAvatar} alt="Avatar" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor" className="text-white">
            <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75 .75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086zM11.189 6.25 9.75 4.81 3.507 11.05a.25.25 0 0 0-.064.108l-.547 1.913 1.912-.547a.25.25 0 0 0 .108-.064L11.189 6.25z" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[10px] text-zinc-400 group-hover:text-white shadow-md cursor-pointer">
          💬
        </div>
      </div>

      {/* Name and Handle */}
      <div className="flex flex-col select-text">
        <h1 className="text-xl md:text-2xl font-bold text-white leading-none">pokgant</h1>
        <span className="text-[#8b949e] text-sm md:text-base mt-2">Pokgant</span>
      </div>

      {/* Edit Bio Button */}
      <button className="w-full py-1.5 border border-[#30363d] bg-[#21262d] hover:bg-[#30363c] text-xs font-semibold rounded-md text-white transition-colors cursor-pointer">
        Edit profile
      </button>

      {/* Follower Stats */}
      <div className="flex items-center gap-1 text-[11px] text-[#8b949e] font-medium">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236 5.507 5.507 0 0 1 3.11-4.09A3.5 3.5 0 0 1 2 5.5zM5.5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
        <span className="text-[#c9d1d9] font-bold">1</span> follower
        <span>·</span>
        <span className="text-[#c9d1d9] font-bold">9</span> following
      </div>

      {/* Achievements Section */}
      <div className="flex flex-col gap-2 select-none border-t border-[#30363d]/50 pt-4">
        <h4 className="text-xs font-bold text-white">Achievements</h4>
        <div className="flex gap-2">
          <img src="/achievement_badge.png" alt="Achievement badge" className="w-9 h-9 object-cover border border-[#30363d]/50 rounded-full p-0.5" title="YOLO: Pull request merged without tests" />
        </div>
      </div>

      {/* Organizations Section */}
      <div className="flex flex-col gap-2 select-none border-t border-[#30363d]/50 pt-4">
        <h4 className="text-xs font-bold text-white">Organizations</h4>
        <div className="flex gap-1.5">
          <img src="/cloud_fluff_logo.png" alt="Cloud Fluff 9" className="w-7 h-7 rounded object-cover border border-[#30363d]" title="Cloud Fluff 9" />
          <img src="/achievement_badge.png" alt="MINDS" className="w-7 h-7 rounded-full object-cover border border-[#30363d] p-0.5" title="MINDS Organization" />
        </div>
      </div>
    </div>
  )

  // Overview Tab Component
  const renderOverviewTab = () => (
    <div className="flex flex-col gap-6 w-full">
      {/* Pinned Repositories Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs text-[#8b949e] font-semibold">
          <span>Pinned</span>
          <span className="hover:text-blue-500 cursor-pointer">Customize your pins</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'three-kingdoms-pilgrimage', desc: '삼국지 매니아 폭간트의 촉나라 도읍지 및 삼국지 역사 유적지 성지순례', lang: 'CSS', color: 'bg-purple-500', stars: 12 },
            { name: 'eurasia-motorcycle-travel-s1', desc: '7년 다닌 공기업 퇴사 후 125cc 오토바이로 유라시아 대륙을 횡단한 무모한 여행기', lang: 'Shell', color: 'bg-green-600', stars: 45 },
            { name: 'india-travel-vlog', desc: '인도인보다 더 인도인 같은 한국인의 리얼하고 다이내믹한 인도 배낭 여행기', lang: 'Python', color: 'bg-blue-500', stars: 38 },
            { name: 'southeast-asia-bicycle-diet', desc: '동남아 1,650km 자전거 종주와 길거리 먹방을 병행하는 다이어트(?) 여행', lang: 'HTML', color: 'bg-red-500', stars: 24 }
          ].map((repo, idx) => (
            <div key={idx} className="border border-[#30363d] rounded-lg p-4 bg-[#161b22]/30 flex flex-col justify-between h-36">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => handleRepoClick(repo.name)}
                    className="text-xs font-bold text-[#58a6ff] hover:underline cursor-pointer"
                  >
                    {repo.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] border border-[#30363d] text-[#8b949e] font-semibold bg-[#161b22]">Public</span>
                </div>
                <p className="text-[11px] text-[#8b949e] leading-snug line-clamp-2">{repo.desc}</p>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-[#8b949e] mt-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${repo.color}`}></span>
                  <span>{repo.lang}</span>
                </div>
                {repo.stars > 0 && (
                  <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                    <Star size={10} />
                    <span>{repo.stars}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Grid Section (with settings and months) */}
      <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]/30 p-5 flex flex-col mt-2">
        <div className="flex justify-between items-center mb-4 text-xs md:text-sm font-semibold text-white">
          <span>{totalCommits} contributions {selectedYear === 'lastYear' ? 'in the last year' : `in ${selectedYear}`}</span>
          <div className="relative group">
            <button className="text-[11px] text-[#8b949e] hover:text-[#c9d1d9] flex items-center gap-1 cursor-pointer font-medium bg-[#161b22]/80 px-2.5 py-1 rounded border border-[#30363d] hover:bg-[#21262d] transition-colors">
              Contribution settings <span className="text-[8px]">▼</span>
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-1 w-44 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg p-2 z-10 text-[11px] text-[#8b949e]">
              <label className="flex items-center gap-2 py-1 px-1.5 hover:bg-[#21262d] rounded cursor-pointer text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0 focus:ring-offset-0" />
                <span>Private contributions</span>
              </label>
              <label className="flex items-center gap-2 py-1 px-1.5 hover:bg-[#21262d] rounded cursor-pointer text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0 focus:ring-offset-0" />
                <span>Activity overview</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-grow min-w-0 flex flex-col gap-1 overflow-x-auto pb-2 scrollbar-none">
            {/* Month Labels Grid */}
            <div className="grid grid-flow-col gap-[2px] auto-cols-[10px] justify-start w-max pl-[28px] text-[9px] text-[#8b949e] mb-1">
              {Array.from({ length: Math.ceil(grassGrid.length / 7) }).map((_, w) => {
                const labelObj = monthLabels.find(m => m.weekIndex === w)
                return (
                  <div key={w} className="w-[10px] h-3 relative">
                    {labelObj && (
                      <span className="absolute left-0 bottom-0 whitespace-nowrap">
                        {labelObj.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Day Labels + Grid Flex Box */}
            <div className="flex gap-[2px] items-start">
              <div className="grid grid-rows-7 gap-[2px] text-[9px] text-[#8b949e] pr-2 items-center text-right w-[28px] flex-shrink-0">
                <span className="h-[10px]"></span>
                <span className="h-[10px] leading-none">Mon</span>
                <span className="h-[10px]"></span>
                <span className="h-[10px] leading-none">Wed</span>
                <span className="h-[10px]"></span>
                <span className="h-[10px] leading-none">Fri</span>
                <span className="h-[10px]"></span>
              </div>
              
              <div className="grid grid-flow-col grid-rows-7 gap-[2px] auto-cols-[10px] justify-start w-max">
                {grassGrid.map((day, idx) => (
                  <div
                    key={idx}
                    title={`${day.date}: ${day.count} uploads`}
                    className={`w-[10px] h-[10px] rounded-[1.5px] transition-all hover:ring-1 hover:ring-white cursor-pointer ${day.colorClass}`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#8b949e] mt-2.5 px-1 pl-[28px]">
              <span className="hover:text-blue-500 hover:underline cursor-pointer">Learn how we count contributions</span>
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

          {/* Year Selector Sidebar */}
          <div className="flex lg:flex-col gap-1 flex-shrink-0 lg:w-32 border-t lg:border-t-0 lg:border-l border-[#30363d]/50 pt-4 lg:pt-0 lg:pl-4">
            {[
              { id: 'lastYear', label: 'Last Year' },
              { id: '2026', label: '2026' },
              { id: '2025', label: '2025' },
              { id: '2024', label: '2024' },
              { id: '2023', label: '2023' },
              { id: '2022', label: '2022' },
              { id: '2021', label: '2021' },
              { id: '2020', label: '2020' }
            ].map((y) => {
              const isSelected = selectedYear === y.id
              return (
                <button
                  key={y.id}
                  onClick={() => setSelectedYear(y.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-normal text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0969da] text-white font-medium shadow-sm'
                      : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50'
                  }`}
                >
                  {y.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contribution Activity Feed Section */}
      <div className="flex flex-col gap-4 mt-2">
        <h4 className="text-sm font-semibold text-white border-b border-[#21262d] pb-2">Contribution activity</h4>
        
        {activityTimeline.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">No activity recorded for this period.</p>
        ) : (
          <div className="flex flex-col gap-6 pl-1.5 mt-2">
            {activityTimeline.map((monthGroup) => (
              <div key={monthGroup.key} className="flex flex-col gap-2 relative">
                <h5 className="text-[11px] font-bold text-[#8b949e] mb-1 select-none">
                  {monthGroup.month} {monthGroup.year}
                </h5>
                
                <div className="border-l border-[#30363d] ml-3 pl-6 flex flex-col gap-6">
                  {/* Event 1: Commits */}
                  {monthGroup.commitsList.length > 0 && (
                    <div className="relative">
                      <div className="absolute -left-[33px] top-0.5 w-6 h-6 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#8b949e]">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                          <path d="M10.5 7.75a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm.5 0a3.5 3.5 0 1 0-7 0 .5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5 2.5 2.5 0 0 1 4.9 0h5.6a.5.5 0 0 1 0 1h-5.6a.5.5 0 0 1-.5-.5Z" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-white">Created {monthGroup.totalCommits} commits in {monthGroup.totalRepos} repositories</span>
                        <div className="flex flex-col gap-2 pl-1">
                          {monthGroup.commitsList.map((c, idx) => {
                            const slug = slugify(c.playlist)
                            const repoName = playlistToRepoMap[slug] || slug
                            const displayRepo = repoName.includes('/') ? repoName : `pokgant/${repoName}`
                            const maxCommits = Math.max(...monthGroup.commitsList.map(item => item.count))
                            const pct = (c.count / maxCommits) * 100
                            return (
                              <div key={idx} className="flex items-center gap-3 text-xs">
                                <span
                                  onClick={() => handleRepoClick(repoName)}
                                  className="text-[#58a6ff] hover:underline cursor-pointer font-semibold w-1/3 md:w-1/4 line-clamp-1"
                                >
                                  {displayRepo}
                                </span>
                                <span className="text-zinc-500 text-[10px] w-16">{c.count} commits</span>
                                <div className="flex-grow bg-[#21262d] h-2 rounded-full overflow-hidden max-w-[120px]">
                                  <div className="bg-[#26a641] h-full" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event 2: Repos Created */}
                  {monthGroup.reposCreated.length > 0 && (
                    <div className="relative">
                      <div className="absolute -left-[33px] top-0.5 w-6 h-6 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#8b949e]">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8Z" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-white">Created {monthGroup.reposCreated.length} repositories</span>
                        <div className="flex flex-col gap-2.5 pl-1">
                          {monthGroup.reposCreated.map((repo, idx) => {
                            const slug = slugify(repo.playlist)
                            const repoName = playlistToRepoMap[slug] || slug
                            const displayRepo = repoName.includes('/') ? repoName : `pokgant/${repoName}`
                            return (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                  <span
                                    onClick={() => handleRepoClick(repoName)}
                                    className="text-[#58a6ff] hover:underline cursor-pointer font-semibold"
                                  >
                                    {displayRepo}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[#8b949e] text-[10px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${repo.langColor}`}></span>
                                    <span>{repo.lang}</span>
                                  </div>
                                  <span>{repo.dateLabel}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event 3: Joined Org */}
                  {(monthGroup.month === 'June' && monthGroup.year === 2026) && (
                    <div className="relative">
                      <div className="absolute -left-[33px] top-0.5 w-6 h-6 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#8b949e]">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                          <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236 5.507 5.507 0 0 1 3.11-4.09A3.5 3.5 0 0 1 2 5.5z" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-white">Joined the <span className="font-semibold text-white">Cloud Fluff 9</span> organization <span className="text-[#8b949e] text-[10px] ml-2">on Jun 2</span></span>
                        <div className="flex gap-4 items-center border border-[#30363d] rounded-lg p-3 bg-[#161b22]/30 mt-1 max-w-sm">
                          <img src="/cloud_fluff_logo.png" alt="Cloud Fluff 9" className="w-10 h-10 rounded object-cover border border-[#30363d]" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Cloud Fluff 9</span>
                            <span className="text-[10px] text-[#8b949e]">Developer Organization · 1 repository</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="w-full py-1.5 border border-[#30363d] rounded-md text-xs font-semibold text-[#58a6ff] hover:bg-[#21262d] transition-colors mt-4 cursor-pointer">
          Show more activity
        </button>
      </div>

      {/* Overview Card (Contributed to repos list & Radar axis graph) */}
      <div className="border border-[#30363d] rounded-lg bg-[#161b22]/30 p-5 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-white">Activity overview</h4>
            
            <div className="flex items-start gap-3 text-xs leading-relaxed text-[#c9d1d9]">
              <div className="p-1.5 rounded-full bg-[#161b22] text-[#8b949e] border border-[#30363d]/50 flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8Z" />
                </svg>
              </div>
              <div>
                <span>Contributed to </span>
                {contributedPlaylists.length > 0 ? (
                  <>
                    {contributedPlaylists.slice(0, 3).map((p, idx) => {
                      const slug = slugify(p)
                      const repoName = playlistToRepoMap[slug] || slug
                      const displayRepo = repoName.includes('/') ? repoName : `pokgant/${repoName}`
                      return (
                        <span key={idx}>
                          <span
                            onClick={() => handleRepoClick(repoName)}
                            className="text-[#58a6ff] hover:underline cursor-pointer font-semibold"
                          >
                            {displayRepo}
                          </span>
                          {idx < Math.min(3, contributedPlaylists.length) - 1 ? ', ' : ''}
                        </span>
                      )
                    })}
                    {contributedPlaylists.length > 3 && (
                      <span> and {contributedPlaylists.length - 3} other repositories</span>
                    )}
                  </>
                ) : (
                  <span className="text-zinc-500 italic">No repositories contributed to in this period</span>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center border-t md:border-t-0 md:border-l border-[#30363d]/50 pt-6 md:pt-0 md:pl-6">
            <div className="relative w-40 h-40 flex items-center justify-center bg-[#0d1117]/10">
              <span className="absolute -top-3 text-[9px] text-[#8b949e] font-semibold tracking-wider">Code review</span>
              <span className="absolute -bottom-3 text-[9px] text-[#8b949e] font-semibold tracking-wider">Pull requests</span>
              <span className="absolute -left-16 text-[9px] text-[#8b949e] font-semibold text-right leading-tight max-w-[60px]">
                {activityOverview.commitPct}% Commits
              </span>
              <span className="absolute -right-16 text-[9px] text-[#8b949e] font-semibold text-left leading-tight max-w-[60px]">
                {activityOverview.issuePct}% Issues
              </span>

              <svg className="w-full h-full" viewBox="0 0 160 160">
                <line x1="20" y1="80" x2="140" y2="80" stroke="#26a641" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="80" y1="20" x2="80" y2="140" stroke="#26a641" strokeWidth="2.5" strokeLinecap="round" />

                {(() => {
                  const leftX = 80 - (activityOverview.commitPct / 100) * 60
                  const rightX = 80 + (activityOverview.issuePct / 100) * 60
                  const topY = 80 - (activityOverview.crPct / 100) * 60
                  const bottomY = 80 + (activityOverview.prPct / 100) * 60

                  return (
                    <>
                      <polygon
                        points={`80,80 ${leftX},80 80,${topY} ${rightX},80 80,${bottomY}`}
                        fill="rgba(57, 211, 83, 0.2)"
                        stroke="#39d353"
                        strokeWidth="1.5"
                      />
                      {activityOverview.commits > 0 && <circle cx={leftX} cy="80" r="4" fill="#ffffff" stroke="#26a641" strokeWidth="2" />}
                      {activityOverview.issues > 0 && <circle cx={rightX} cy="80" r="4" fill="#ffffff" stroke="#26a641" strokeWidth="2" />}
                      {activityOverview.codeReviews > 0 && <circle cx="80" cy={topY} r="4" fill="#ffffff" stroke="#26a641" strokeWidth="2" />}
                      {activityOverview.prs > 0 && <circle cx="80" cy={bottomY} r="4" fill="#ffffff" stroke="#26a641" strokeWidth="2" />}
                    </>
                  )
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const repoList = [
    { name: 'three-kingdoms-pilgrimage', desc: '삼국지 매니아 폭간트의 촉나라 도읍지 및 삼국지 역사 유적지 성지순례', lang: 'CSS', color: 'bg-purple-500', stars: 12 },
    { name: 'eurasia-motorcycle-travel-s1', desc: '7년 다닌 공기업 퇴사 후 125cc 오토바이로 유라시아 대륙을 횡단한 무모한 여행기', lang: 'Shell', color: 'bg-green-600', stars: 45 },
    { name: 'india-travel-vlog', desc: '인도인보다 더 인도인 같은 한국인의 리얼하고 다이내믹한 인도 배낭 여행기', lang: 'Python', color: 'bg-blue-500', stars: 38 },
    { name: 'southeast-asia-bicycle-diet', desc: '동남아 1,650km 자전거 종주와 길거리 먹방을 병행하는 다이어트(?) 여행', lang: 'HTML', color: 'bg-red-500', stars: 24 },
    { name: 'nepal-himalaya-trekking', desc: '히말라야 안나푸르나 안개 속을 걷는 네팔 힐링 및 생존 여행기', lang: 'Jupyter Notebook', color: 'bg-orange-500', stars: 15 },
    { name: 'video-marathon-binge-watch', desc: '폭간트 채널의 인기 시리즈 및 전체 영상 몰아보기 컴파일러', lang: 'JavaScript', color: 'bg-yellow-500', stars: 50 },
    { name: 'north-sumatra-adventure', desc: '인도네시아 북수마트라 오지 및 대자연 탐험기', lang: 'Go', color: 'bg-cyan-500', stars: 9 },
    { name: 'pakistan-wilderness-travel', desc: '압도적인 훈자 벨리 대자연과 파키스탄 현지인들의 뜨거운 환대 기록', lang: 'C++', color: 'bg-pink-500', stars: 19 },
    { name: 'kyushu-minivelo-bicycle', desc: '미니벨로 자전거 한 대로 떠나는 일본 큐슈 구석구석 자전거 캠핑 여행', lang: 'TypeScript', color: 'bg-blue-600', stars: 14 },
    { name: 'kyushu-small-town-exploration', desc: '관광객이 없는 일본 큐슈의 숨겨진 소도시 감성 여행기', lang: 'Vue', color: 'bg-emerald-500', stars: 11 },
    { name: 'myanmar-civil-war-travel', desc: '내전과 경제 위기 속에서도 정이 넘치는 미얀마 사람들과의 조우', lang: 'PHP', color: 'bg-indigo-400', stars: 8 },
    { name: 'short-global-trips', desc: '전 세계 여러 나라를 짧고 굵게 다녀온 여행 기록 모음집', lang: 'Ruby', color: 'bg-red-600', stars: 7 },
    { name: 'kyushu-rentacar-roadtrip', desc: '렌트카로 보다 편안하고 깊숙하게 둘러보는 일본 큐슈 힐링 로드트립', lang: 'Rust', color: 'bg-orange-600', stars: 13 },
    { name: 'soliloquy-talk-archive', desc: '폭간트의 진솔한 생각과 유튜브 운영 비하인드를 털어놓는 소통 공간', lang: 'TeX', color: 'bg-green-500', stars: 16 },
    { name: 'guest-collaborations', desc: '타 여행 크리에이터 및 방송 프로그램 출연 영상 아카이브', lang: 'Swift', color: 'bg-orange-500', stars: 5 }
  ];

  // Repositories Tab Component
  const renderRepositoriesTab = () => (
    <div className="flex flex-col gap-4 w-full select-none">
      <div className="flex justify-between items-center pb-3 border-b border-[#21262d]">
        <h4 className="text-base font-semibold text-white">Repositories</h4>
        <span className="text-xs text-[#8b949e] font-medium">{repoList.length} results</span>
      </div>

      <div className="flex flex-col divide-y divide-[#30363d]/50">
        {repoList.map((repo) => (
          <div key={repo.name} className="py-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                onClick={() => handleRepoClick(repo.name)}
                className="text-lg font-bold text-[#58a6ff] hover:underline cursor-pointer"
              >
                {repo.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#30363d] text-[#8b949e] font-semibold bg-[#161b22]">Public</span>
            </div>
            
            <p className="text-xs text-[#8b949e] max-w-2xl">{repo.desc}</p>
            
            <div className="flex items-center gap-4 text-[10px] text-[#8b949e] mt-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${repo.color}`}></span>
                <span>{repo.lang}</span>
              </div>
              
              {repo.stars > 0 && (
                <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                  <Star size={12} />
                  <span>{repo.stars}</span>
                </div>
              )}

              <span>Updated recently</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Original Repo Explorer Component (Folder Tree & Markdown Viewer)
  const renderRepoExplorerTab = () => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
        <button
          onClick={() => setActiveTab('repositories')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#30363d] bg-[#21262d] hover:bg-[#30363c] text-xs font-semibold text-white cursor-pointer transition-colors"
        >
          ← Back to Repositories
        </button>
        <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
          <span>BRANCH:</span>
          <span className="font-semibold text-white bg-[#161b22] px-1.5 py-0.5 rounded border border-[#30363d]">main</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
        {/* Left Column: Repository File Explorer Sidebar */}
        <div className="lg:col-span-4 border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]/50 w-full">
          <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] text-xs font-bold text-[#c9d1d9] flex justify-between items-center">
            <span>FILE EXPLORER</span>
            <span className="text-[10px] text-zinc-500 font-medium">BRANCH: main</span>
          </div>

          <div className="p-3 flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2 py-1 font-bold text-white">
              <ChevronDown size={14} className="text-zinc-500" />
              <FolderOpen size={14} className="text-[#58a6ff]" />
              <span>Ganverse/</span>
            </div>

            <div className="pl-4 flex flex-col gap-1.5">
              {Object.entries(folders).map(([folderSlug, folderData]) => {
                const isOpen = openFolders[folderSlug]
                const repoName = playlistToRepoMap[folderSlug] || folderSlug
                const displayRepoName = repoName.includes('/') ? repoName.split('/')[1] : repoName
                return (
                  <div key={folderSlug} className="flex flex-col gap-1">
                    <div
                      onClick={() => toggleFolder(folderSlug)}
                      className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#21262d] rounded cursor-pointer transition-colors text-zinc-200"
                    >
                      {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {isOpen ? <FolderOpen size={13} className="text-[#58a6ff]" /> : <Folder size={13} className="text-[#58a6ff]" />}
                      <span className="font-semibold line-clamp-1">{displayRepoName}/</span>
                    </div>

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

        {/* Right Column: Code/Readme Markdown Viewer */}
        <div className="lg:col-span-8 border border-[#30363d] rounded-lg overflow-hidden bg-[#0d1117] flex flex-col w-full">
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

          {selectedVideo ? (
            <div className="p-6 md:p-8 flex flex-col gap-6 text-sm text-[#c9d1d9] leading-relaxed border-b border-[#21262d] max-h-[500px] overflow-y-auto">
              <h1 className="text-xl md:text-3xl font-bold text-white border-b border-[#21262d] pb-2 leading-snug">
                {selectedVideo.videoTitle}
              </h1>

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
    </div>
  )

  // Main Return Block
  return (
    <div className="bg-[#0d1117] text-[#c9d1d9] min-h-screen flex flex-col font-sans pb-12 select-none">
      {/* 1. Global Header Navigation Bar */}
      <header className="bg-[#010409] px-4 py-3 border-b border-[#30363d] flex items-center justify-between text-xs text-zinc-300 select-none">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" className="text-white hover:opacity-80 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.88 0 .62.01 1.11.01 1.25 0 .21-.15.47-.55.38A8.014 8.014 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
          </svg>
          <span className="font-semibold text-white hover:text-blue-500 cursor-pointer" onClick={() => setActiveTab('overview')}>Pokgant</span>
          <span className="text-zinc-700">|</span>
          <nav className="hidden md:flex items-center gap-3 text-[11px] font-medium text-zinc-400">
            <span className="hover:text-white cursor-pointer">Pull requests</span>
            <span className="hover:text-white cursor-pointer">Issues</span>
            <span className="hover:text-white cursor-pointer">Codespaces</span>
            <span className="hover:text-white cursor-pointer">Marketplace</span>
            <span className="hover:text-white cursor-pointer">Explore</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Type / to search"
              readOnly
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 w-60 text-zinc-400 text-[11px] focus:outline-none focus:border-blue-500 cursor-default"
            />
            <span className="absolute right-2.5 top-1.5 border border-[#30363d] rounded px-1 text-[8px] bg-[#161b22] text-[#8b949e]">/</span>
          </div>

          <div className="flex items-center gap-2.5 text-zinc-400">
            <button className="hover:text-white cursor-pointer relative">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.48.762.78.762a.25.25 0 0 0 .225-.25c0-.83-.137-2.597-.47-4.181-.157-.751-.373-1.536-.65-2.2a5.478 5.478 0 0 0-3.137-3.246V2a1 1 0 0 0-2 0v1.125a5.478 5.478 0 0 0-3.137 3.246c-.277.664-.493 1.449-.65 2.2-.333 1.584-.47 3.35-.47 4.18a.25.25 0 0 0 .225-.25c.3 0 .557-.315.78-.762C6.18 10.197 6 8.628 6 8a2 2 0 0 1 4 0c0 .628-.18 2.197-.419 3.742a15.42 15.42 0 0 1-.361 2.258h5z" />
              </svg>
              <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            </button>
            <span className="text-zinc-700">|</span>
            <img
              src={channelAvatar}
              alt="Avatar"
              className="w-5 h-5 rounded-full border border-zinc-700/50 hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab('overview')}
            />
          </div>
        </div>
      </header>

      {/* 2. GitHub Sub-navigation Tab Bar */}
      <div className="bg-[#0d1117] border-b border-[#21262d] px-4 md:px-8 select-none">
        <div className="flex gap-4 text-xs font-semibold overflow-x-auto scrollbar-none max-w-7xl mx-auto py-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#f78166] text-white'
                : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A4.697 4.697 0 0 1 11.003 1H15.25a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.247a3.248 3.248 0 0 0-2.253.9c-.201.202-.454.404-.75.404s-.549-.202-.75-.404a3.248 3.248 0 0 0-2.253-.9H.75a.75.75 0 0 1-.75-.75V1.75zm1.5 1.5v8.5h3.503c.837 0 1.637.272 2.253.765V3.765A3.248 3.248 0 0 0 5.003 3H1.5zm6.75 9.265a3.248 3.248 0 0 0 2.253-.765h3.503v-8.5h-3.503a3.248 3.248 0 0 0-2.253.765v8.5z" />
            </svg>
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('repositories')}
            className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'repositories' || activeTab === 'repo-explorer'
                ? 'border-[#f78166] text-white'
                : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8Z" />
            </svg>
            <span>Repositories</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#21262d] text-[#c9d1d9] font-medium ml-1">
              {Object.keys(folders).length}
            </span>
          </button>

          <button className="flex items-center gap-1.5 pb-2 border-b-2 border-transparent text-[#8b949e] hover:text-[#c9d1d9] cursor-pointer">
            <span>Projects</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#21262d] text-[#c9d1d9] font-medium ml-1">1</span>
          </button>
          <button className="flex items-center gap-1.5 pb-2 border-b-2 border-transparent text-[#8b949e] hover:text-[#c9d1d9] cursor-pointer">
            <span>Packages</span>
          </button>
          <button className="flex items-center gap-1.5 pb-2 border-b-2 border-transparent text-[#8b949e] hover:text-[#c9d1d9] cursor-pointer">
            <span>Stars</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#21262d] text-[#c9d1d9] font-medium ml-1">14</span>
          </button>
        </div>
      </div>

      {/* 3. Main Split Layout Content */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Profile Bio Sidebar */}
        {renderProfileSidebar()}

        {/* Right Column: Dynamic Tabs Content */}
        <div className="flex-grow w-full md:w-3/4">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'repositories' && renderRepositoriesTab()}
          {activeTab === 'repo-explorer' && renderRepoExplorerTab()}
        </div>
      </div>
    </div>
  )
}
