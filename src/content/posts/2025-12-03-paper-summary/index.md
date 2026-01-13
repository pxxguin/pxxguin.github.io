---
title: '기본적인 FastAPI 서버 구축'
image: /images/test5.png
published: 2025-12-03T00:00:00.000Z
description: 정말 기본적인 FastAPI 서버 개발 환경부터 차근차근 설명할 예정입니다. 이것만 알아도, 다른 파이썬 프로젝트를 진행할 때 더 편하게 이용할 수 있을겁니다.
series: Start of the FastAPI
seriesOrder: 1
tags:
  - Backend
  - Server
category: Backend
draft: true
postId: 11
---

### 🐰 시작하기 앞서 TMI
한 달만에 포스팅을 올리는 것 같네요. 그동안 저한테는 좀 많은 일들이 있어서 포스팅이 쉽지 않았네요. 이번 포스팅부터는 연재로 FastAPI에 대해서 설명할 예정입니다. 개발 환경은 MacOS이고, Window 환경이라면.. 죄송합니다. 제가 Window 컴퓨터가 없어서요.. 그럼 천천히 따라오세요!

### 👀 uv 설치
uv는 파이썬에서 사용하는 버전 관리 도구입니다. 비슷한 도구로는 poetry, pyenv..등이 있는데 저희는 uv를 사용할겁니다. 요즘 uv가 대세(?)라고 하더라고요. uv를 설치하는 방법은 정말 쉽습니다. MacOS에 homebrew가 설치되어있다는 가정하에, 아래 명령어 하나만 입력하면 설치가 됩니다.

```bash
brew install uv
```

### 📚 uv 사용법
터미널에서 uv를 쳐보시면, 다양한 기능들이 나올텐데 막상 저희가 자주 사용하는 것은 두 가지 정도 됩니다.

#### 1. 프로젝트 초기화
```bash
uv init <프로젝트명>
# uv init myproject
```

#### 2. 특정 파이썬 버전으로 초기화
```bash
uv init --python <버전> <프로젝트명>
# uv init --python 3.11 myproject
```

이렇게 되면, 아마 <프로젝트명> 폴더가 생성이 되고 그 안에 아래와 같은 파일들이 생성될껍니다.
```
├── .git/                # Git 저장소 관련 디렉토리
├── .gitignore           # Git 제외 파일 설정
├── .python-version      # Python 버전 관리 파일
├── README.md            # 프로젝트 설명 문서
├── main.py              # 메인 실행 스크립트
└── pyproject.toml       # 프로젝트 설정 및 의존성 관리 파일
```

이 상태에서 src(source) 폴더를 만들고, 그 안에 main.py를 넣습니다.

```
├── .git/
├── .gitignore
├── .python-version
├── README.md
├── pyproject.toml
└── src/      
    └── main.py
```

자 이제, 필요한 라이브러리들을 설치해볼게요.

### 📚 필요한 라이브러리 설치
일반적으로 FastAPI를 개발하는데 필요한 라이브러리는 아래와 같습니다.
- 거의 필수적인 라이브러리
  - fastapi
  - uvicorn
  - httpie
  - httpx
  - requests
원래 파이썬에서 라이브러리를 설치하는 방법이 ==pip install <라이브러리>잖아요?== 하지만 uv는 조금 다릅니다. ==uv는 add 명령어를 사용하여 라이브러리를 추가하고, sync(동기화)를 사용해야 최종적으로 설치한 라이브러리를 사용할 수 있습니다.==

```bash
uv add fastapi uvicorn httpie httpx requests
uv sync
```
를 실행하게 되면, pyproject.toml 파일에 의존성이 추가되고 .venv/ 라는 폴더가 생성되게 되는데 이 폴더 안에 파이썬 가상환경이 생성됩니다. 직접 라이브러리를 설치해보면 알겠지만, ==속도가 기존 의존성 도구들을 사용할 때보다 훨씬 빠르다는 것을 알 수 있습니다.==

### 📚 main.py 수정
이제 main.py의 기존 내용을 지우고, 아래 코드를 복사해서 입력해서 기본적인 FastAPI 서버를 구축해보겠습니다.
```python title="src/main.py"
from fastapi import FastAPI

app = FastAPI()

@app.get('/')
def hello():
    return {"Message":"Hello, World"}
```

이제 터미널에서 실행시켜볼까요?
```bash
uv run src.main:app --reload
"""
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [98005] using StatReload
INFO:     Started server process [98012]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:54877 - "GET / HTTP/1.1" 200 OK
"""
```

### 📚 httpie로 테스트
이제 아까 설치한 라이브러리인 httpie를 사용해서 정상적으로 동작하는지 확인해볼게요.
```bash
http GET localhost:8000
"""
HTTP/1.1 200 OK
content-length: 26
content-type: application/json
date: Tue, 13 Jan 2026 05:04:52 GMT
server: uvicorn

{
    "Message": "Hello, World"
}
"""
```
다음과 같이 정상적인 결과가 나오는 것을 알 수 있습니다.

### 📚 마무리
이게 FastAPI 프로젝트를 시작하는 기본입니다. 별로 어렵지 않았을 것이라고 생각하고 다음 포스팅으로 넘어가겠습니다.