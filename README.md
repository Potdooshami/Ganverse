# Ganverse
Fan project of pkgant https://www.youtube.com/@pokgant
# 1. 프로젝트 개요
프로젝트명: 간버스 (Ganverse)

목적: 여행 유튜버 '폭간트(Poggant)'의 세계 일주 영상 데이터를 기반으로 한 팬 메이드 패러디 및 대시보드 웹 앱 (PWA) 개발

핵심 콘셉트: 하나의 소스 데이터(유튜브 영상)를 활용하여, 사용자가 상단 내비게이션 바에서 모드를 전환할 때마다 4대 플랫폼(넷플릭스, 유튜브, 깃허브, 라프텔)의 UI/UX 테마로 실시간 스위칭되는 통합 애플리케이션 구축

# 2. 4대 플랫폼별 UI 콘셉트
간플릭스 (Ganflix): 넷플릭스 클론. 딥블랙 배경, 카테고리별 가로 스크롤 카드 행, 최상단 레전드 하이라이트 대형 히어로 배너 배치를 특징으로 함.

간튜브 (Gantube): 유튜브 클론. 좌측 고정 사이드바(홈, Shorts 등)와 3~4열 종대 그리드 배치, 상단 제목/국가 실시간 검색 필터링 구현.

간허브 (Ganhub): 깃허브 클론. 텍스트 및 파일 탐색기 위주의 UI로 국가별 폴더 구조(India/, Egypt/ 등)를 시각화하고, 오픈소스 기여도 양식의 업로드 잔디 심기 대시보드 연동. (초기 기획 단계에 있던 3D 지구본은 모바일 UX 효율성을 위해 과감히 제거함)

간프텔 (Gantele): 라프텔 클론. 서브컬처 애니메이션 스트리밍 사이트 UI 복제. 별점 시스템 및 드립성 한줄평 레이아웃 제공.

# 3. 핵심 기능 및 연출 치트키
애니메이션풍 썸네일 스위칭: '간프텔' 모드 진입 시 모든 영상의 기본 썸네일이 애니메이션(웹툰) 스타일로 변경되어 렌더링됨. 마우스 호버(또는 모바일 터치 유지) 시 원래 유튜브 썸네일로 부드럽게 복귀하는 트랜지션 연출.

가챠형 랜덤 애니메이션 인트로: 사용자가 리스트에서 영상을 클릭하면 실제 유튜브 본 영상이 재생되기 전, AI 비디오 변환 기술(Runway/DomoAI 등)로 미리 가공해 둔 20초 분량의 레전드 장면 애니메이션 비디오 10개 중 1개가 랜덤으로 20초간 재생된 후 본 영상으로 부드럽게 전환됨. (비용 및 레이턴시 제어를 위한 선-빌드 아키텍처)

# 4. 기술 스택 및 데이터 아키텍처
프론트엔드: React + Vite + Tailwind CSS (단일 프로젝트 폴더 구조로 4개 뷰 관리)

데이터베이스(DB): 구글 시트 (Google Sheets)

시트 상에서 id, country, city, videoTitle, videoUrl, youtubeThumbnail, aniThumbnailUrl, category, tags, uploadDate 관리.

파일 > 웹에 게시 (CSV) 기능을 이용해 백엔드 서버 없이 프론트엔드 런타임에서 papaparse 라이브러리로 실시간 동기화 호출.

배포 환경: Vercel 또는 GitHub Pages 활용 (무료 정적 호스팅). vite-plugin-pwa를 적용하여 안드로이드/iOS 스마트폰 홈 화면에 다운로드 가능한 PWA 형태로 최종 배포.

AI 리소스 빌드 환경: 로컬 GTX 1080 Ti (VRAM 11GB) 환경 활용. VRAM 이점을 살려 Stable Diffusion WebUI의 img2img Batch 기능을 이용해 썸네일 일괄 변환(무료) 후 assets 폴더에 사전 저장.

5. 프로젝트 폴더 구조 가이드
Plaintext
poggant-dashboard/
├── public/
│   └── videos/            # AI로 사전 변환한 20초 랜덤 인트로 영상 10개
├── src/
│   ├── assets/            # img2img로 일괄 변환 완료된 애니메이션 썸네일들
│   ├── components/        # 공통 UI 컴포넌트 (VideoPlayer, Modal 등)
│   ├── views/             # 4대 플랫폼 뷰 컴포넌트 분리
│   │   ├── Ganflix.jsx    
│   │   ├── Gantube.jsx    
│   │   ├── Ganhub.jsx     
│   │   └── Gantele.jsx    
│   ├── App.jsx            # 구글 시트 fetch 및 currentMode 상태 기반 조건부 렌더링 제어
│   └── main.jsx