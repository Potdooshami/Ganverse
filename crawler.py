import yt_dlp
import csv
import sys
from datetime import datetime, timedelta

# Reconfigure console output to utf-8 for Windows compatibility
sys.stdout.reconfigure(encoding='utf-8')

def generate_tags(title, playlist_name):
    tags = ["#폭간트", "#세계일주"]
    
    # Auto-generate tags based on keywords in title or playlist
    title_lower = title.lower()
    playlist_lower = playlist_name.lower()
    
    # Countries & Cities
    if "중국" in title_lower or "중국" in playlist_lower:
        tags.append("#중국")
    if "태국" in title_lower or "태국" in playlist_lower:
        tags.append("#태국")
    if "인도" in title_lower or "인도" in playlist_lower:
        tags.append("#인도")
    if "삼국지" in title_lower or "삼국지" in playlist_lower:
        tags.append("#삼국지")
    if "캠핑" in title_lower or "캠핑카" in title_lower:
        tags.append("#캠핑")
    if "트럭" in title_lower:
        tags.append("#트럭")
    if "먹방" in title_lower or "맛집" in title_lower or "식사" in title_lower or "마라" in title_lower or "음식" in title_lower:
        tags.append("#먹방")
    if "기차" in title_lower or "열차" in title_lower:
        tags.append("#기차")
    if "퇴사" in title_lower:
        tags.append("#퇴사")
    if "생존" in title_lower or "물갈이" in title_lower or "고생" in title_lower:
        tags.append("#생존기")
        
    return "".join(tags)

def crawl():
    print("폭간트 유튜브 채널에서 재생목록 정보를 가져오는 중...")
    
    ydl_opts = {
        'extract_flat': True,
        'skip_download': True,
    }
    
    playlists_url = 'https://www.youtube.com/@pokgant/playlists'
    
    all_videos = []
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        # Extract channel's playlists
        channel_info = ydl.extract_info(playlists_url, download=False)
        playlists = channel_info.get('entries', [])
        
        print(f"총 {len(playlists)}개의 재생목록을 찾았습니다.")
        
        # We will loop through the playlists and extract videos
        for p_idx, playlist in enumerate(playlists):
            playlist_title = playlist.get('title')
            playlist_url = playlist.get('url')
            
            # Skip invalid or empty playlists
            if not playlist_title or not playlist_url:
                continue
                
            print(f"[{p_idx + 1}/{len(playlists)}] '{playlist_title}' 재생목록 분석 중...")
            
            try:
                playlist_info = ydl.extract_info(playlist_url, download=False)
                videos = playlist_info.get('entries', [])
                
                # Only keep video files, exclude deleted or unavailable ones
                valid_videos = [v for v in videos if v and v.get('id') and v.get('title')]
                print(f"  -> 유효한 영상 수: {len(valid_videos)}개")
                
                for video in valid_videos:
                    all_videos.append({
                        'playlist': playlist_title,
                        'title': video.get('title'),
                        'videoId': video.get('id')
                    })
            except Exception as e:
                print(f"  -> 경고: 재생목록 추출 중 오류 발생 ({e})")
                
    if not all_videos:
        print("에러: 수집된 비디오 데이터가 없습니다.")
        return
        
    print(f"총 {len(all_videos)}개의 비디오 데이터를 성공적으로 크롤링했습니다.")
    
    # Sort or format and write to CSV
    # Generate sequential upload dates (starting from 1 year ago, uploading every 3 days)
    start_date = datetime.now() - timedelta(days=len(all_videos) * 3)
    
    csv_rows = []
    for i, video in enumerate(all_videos):
        video_id = video['videoId']
        title = video['title']
        playlist = video['playlist']
        
        # sequential date
        upload_date = (start_date + timedelta(days=i * 3)).strftime('%Y-%m-%d')
        
        # isHero (First video is True, rest are False)
        is_hero = "TRUE" if i == 0 else "FALSE"
        
        # Generate tags based on title keywords
        tags = generate_tags(title, playlist)
        
        csv_rows.append({
            'id': i + 1,
            'playlist': playlist,
            'videoTitle': title,
            'youtubeVideoId': video_id,
            'aniThumbnailUrl': f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
            'category': "미분류",
            'tags': tags,
            'uploadDate': upload_date,
            'isHero': is_hero,
            'rating': 0,
            'review': "미작성"
        })
        
    # Write to local CSVs
    fieldnames = ['id', 'playlist', 'videoTitle', 'youtubeVideoId', 'aniThumbnailUrl', 'category', 'tags', 'uploadDate', 'isHero', 'rating', 'review']
    
    targets = ['mock_data.csv', 'public/mock_data.csv']
    for target in targets:
        with open(target, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(csv_rows)
            
    print("CSV 파일 쓰기 완료!")
    print(f"대상 경로: {', '.join(targets)}")

if __name__ == '__main__':
    crawl()
