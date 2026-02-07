# Family App 배포 가이드 (GitHub & Vercel)

이 문서는 Family App을 **GitHub**에 올리고 **Vercel**을 통해 무료로 배포하는 방법을 안내합니다.

## 1단계: GitHub 저장소 만들기
1. [GitHub](https://github.com/)에 로그인합니다.
2. 우측 상단의 **+** 아이콘을 클릭하고 **New repository**를 선택합니다.
3. **Repository name**에 `family-app`이라고 입력합니다.
4. **Public** (공개) 또는 **Private** (비공개) 중 원하는 것을 선택합니다.
5. **Create repository** 버튼을 클릭합니다.

## 2단계: 프로젝트 업로드 (터미널 명령어)
VS Code의 터미널을 열고 (`Ctrl` + `` ` ``) 아래 명령어들을 순서대로 입력하세요.

> **참고**: `git`이 설치되어 있어야 합니다. 설치되어 있지 않다면 [Git 설치하기](https://git-scm.com/downloads)에서 다운로드하세요.

```bash
# 1. 프로젝트 폴더로 이동 (이미 해당 폴더면 생략 가능)
cd family-app

# 2. Git 초기화
git init

# 3. 모든 파일을 스테이징 (준비)
git add .

# 4. 첫 번째 커밋 (저장)
git commit -m "Initial commit: Family App v1.0"

# 5. GitHub 저장소 연결 (아래 주소는 본인의 저장소 주소로 바꿔야 함!)
# 예: git remote add origin https://github.com/사용자이름/family-app.git
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/family-app.git

# 6. GitHub에 푸시 (업로드)
git push -u origin main
```

## 3단계: Vercel 배포
1. [Vercel](https://vercel.com/)에 가입하거나 로그인합니다.
2. **Add New...** > **Project**를 클릭합니다.
3. **Import Git Repository**에서 방금 만든 GitHub 저장소(`family-app`) 옆의 **Import** 버튼을 클릭합니다.
4. **Configure Project** 화면에서:
   - Framework Preset: **Next.js** (자동 감지됨)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `npm install` (기본값)
5. **Deploy** 버튼을 클릭합니다.

잠시 기다리면 배포가 완료되고, 전 세계 어디서나 접속할 수 있는 URL이 생성됩니다! 🎉
