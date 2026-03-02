---
title: "[Docker] 초보자를 위한 Dockerfile 완벽 가이드"
image: /images/docker.jpg
published: 2026-02-25T00:00:00.000Z
description: 왜 SSH 접속 대신 Dockerfile을 써야 하는지에 대해서 설명합니다.
series: docker-basics
seriesOrder: 4
tags:
  - Docker
  - Backend
  - CI/CD
category: Backend
draft: false
postId: 14
---

## docker-compose.yml은 어떤 역할을 하는가?
docker-compose는 여러개의 컨테이너를 하나의 서비스 단위로 묶어서 관리할 때 사용합니다. 앞으로 예제에서 사용하겠지만, 일반적으로 FastAPI 서버를 바로 호스팅하지는 않습니다. FastAPI뿐만 아니라 다른 호스팅을 해야하는 프로젝트에서도 마찬가지입니다. 반드시 Nginx 뒤에 FastAPI를 두는데요, 보안적인 이유가 강합니다. 만약 Fastapi로 구동된 서버 주소나, 포트를 공개하면 해킹의 위협이 있기 때문에 Nginx를 거치도록 한다고 일단 알아두시면 됩니다. 자세한 내용은 Nginx부분에서 더 자세히 다룰 예정입니다.

## FastAPI & Nginx 구성
> Nginx는 클라이언트의 요청을 받아서 FastAPI로 전달하는 역할을 합니다. 이걸 Reverse Proxy 역할이라고하는데, 간단히 비유하자면 Nginx는 호텔 카운터입니다. 손님이 카운터로 오면 손님이 사전에 예약한 방으로 안내하잖아요? 정확히 이 역할을 하는게 Nginx라고 보면 됩니다. 쉽죠?

:::warning
이번에는 FastAPI의 설명은 하지 않을겁니다. 이전 포스팅에서 설명했기 때문이죠. 대신, 디렉토리 구조를 남겨둘테니 보고 따라서 구성하시면 될 것 같습니다.
:::

### 1️⃣ Directory의 구성
```bash
MYFIRSTAPP/
├── backend/
│   ├── .venv/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── nginx/
│   └── default.conf
└── docker-compose.yaml
```

### 2️⃣ docker-compose.yaml 작성하기
docker-compose를 작성하는건, 정말 어렵지 않습니다. Dockerfile이랑, docker-compose의 차이가 뭔지 궁금해하는 사람을 위해서 아래 부분에 따로 설명해두겠습니다. 
```bash title="docker-compose.yaml"
services: # docker-compose의 시작 부분
  backend: # FastAPI 부분으로 임의 수정 가능
    build: # fastapi 프로젝트를 build할껀데, 위치가 어디인가?
      context: ./backend # Dockerfile 위치
      dockerfile: Dockerfile # dockerfile 이름
    expose: # 내부 컨테이너에서 접근할 수 있는 포트
    - "8000"
    networks: # 컨테이너들이 서로를 인식하고, 안전하게 대화할 수 있는 가상 통신망 역할
    - app_network
  nginx: # Nginx 부분으로 임의 수정 가능
    image: nginx:latest # 앞에서와 달리 Docker 저장소의 이미지를 사용
    ports: # 외부 사용자의 접근 포트 구성
      - "80:80"
    volumes: # 호스트 PC의 파일이나 폴더를 컨테이너 내부의 특정 경로와 실시간으로 연결하는 역할
      - ${PWD}/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: # Nginx가 실행되기 전에 backend가 먼저 실행되어야함
      - backend
    networks:
      - app_network
networks:
  app_network:
    driver: bridge
```

:::important
🤔 왜 Dockerfile도 작성하고 docker-compose도 적어야하는걸까요?

Dockerfile과 docker-compose는 서로 하는 역할이 다릅니다. 제가 실습하고 있는 프로젝트에서 Dockerfile은 어떤 역할을 하고 있나요? FastAPI 프로젝트를 이미지화 해서, 컨테이너화를 시킬 수 있도록 도움을 줍니다. 하지만 FastAPI를 주로 MLOps에서 자주 사용하는데 이럴 경우, Grafana, Prometheus라고 하는 모니터링 도구들과 함께 사용되게 됩니다. Grafana, Promethus의 경우 이미 Docker 저장소에 이미지가 저장되어있기 때문에 docker-compose를 사용하여 3가지를 연결해서 사용할 수 있는거죠!
:::

### 3️⃣ docker-compose에서 expose와 port의 차이
![nginx-fastapi](./nginx-fastapi-pipeline.png)
주석처리를 하기는 했지만, 이 부분을 명확히 짚고 넘어가야할 것 같습니다. 위의 그림이 거의 docker-compose의 모든 내용을 설명하고 있습니다. 그 전에 가장 기본적인 내용부터 짚고 넘어갈게요.
> http는 80번 포트를, https는 443번 포트를 사용합니다. 우리가 일반적으로 웹사이트, 예를 들어 "https://www.naver.com"과 같은 특정 사이트에 접근할 때 https://www.naver.com:80이라고 붙이지는 않죠? 