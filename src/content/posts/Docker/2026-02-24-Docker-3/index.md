---
title: "[Docker] run, exec, ps 옵션의 의미 완벽 파헤치기"
image: /images/docker.png
published: 2026-02-24T00:00:00.000Z
description: 도커 이미지 다운로드부터 컨테이너 실행, 관리까지! 복잡한 설정 없이 바로 따라 할 수 있는 Docker 기본 명령어 가이드입니다.
series: docker-basics
seriesOrder: 3
tags:
  - Docker
  - Backend
  - CI/CD
category: Backend
draft: false
postId: 13
---

### 🌟 Dockerfile을 사용하는 이유
Dockerfile은 왜 사용하는걸까요? 우리가 앞에서 배웠던 것처럼, Docker engine으로 ubuntu 컨테이너를 생성해서 SSH(Secure Shell)로 접속을 해서 개발을 진행하면 될 수 있지 않을까요? 

이 질문에 대한 답은 약 3가지로 추려볼 수 있겠네요.
- 직접 SSH로 접속해서, 명령어를 입력해야하므로 불편합니다. 반면 Dockerfile은 docker build 딸.깍 하면 되버리죠.
- Docker는 Layer라는 개념을 사용하는데 SSH로 접속해서 이것저것 설치하게 되면, 엄청 커지게 됩니다. 반면에 Dockerfile은 각 명령어(RUN, COPY)가 하나의 층으로 쌓입니다. 만약 소스코드 한줄만 수정했다면, Docker는 OS나 라이브러리 설치는 건너뛰고 수정된 Layer만 다시 빌드합니다.
- 현대 개발체계에서는 컨테이너를 수정해서 사용하는게 아니라, 버리고 새로 만드는것을 원칙으로 합니다. 만약 컨테이너 내부 설정을 내 마음대로 설정하거나, 위에서처럼 이것저것 설치하다보면 이 구조는, 나만 아는 복잡한 구조가 됩니다. 이를 Snowflake Server라고 하는데, Dockefile은 그냥 딸.깍 하면 됩니다.

### 🤔 Dockerfile 작성 방법
```bash filename='Dockerfile'
FROM 
```