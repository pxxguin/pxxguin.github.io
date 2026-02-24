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
이번에는 FastAPI의 설명은 하지 않을겁니다. 이전 포스팅에서 이미 많이 언급했기 때문이죠. 대신, 디렉토리 구조를 남겨둘테니 보고 따라서 구성하시면 될 것 같습니다.
:::

### 1️⃣ Directory의 구성
```bash


```
