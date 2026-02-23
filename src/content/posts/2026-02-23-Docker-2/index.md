---
title: "[Docker] run, exec, ps 옵션의 의미 완벽 파헤치기"
image: /images/2026-02-23-Docker-1.png
published: 2026-02-23T00:00:00.000Z
description: 도커 이미지 다운로드부터 컨테이너 실행, 관리까지! 복잡한 설정 없이 바로 따라 할 수 있는 Docker 기본 명령어 가이드입니다.
series: docker-basics
seriesOrder: 2
tags:
  - Docker
  - Backend
  - CI/CD
category: Backend
draft: false
postId: 12
---

## 🪪 Docker의 기본 명령어
지금부터는 제일 자주쓰는 Docker 명령어에 대해서 설명하겠습니다. Dockerfile을 먼저 작성하면, 어려울 수 있으니 간단한 명령어부터 실행해보면서 어떻게 동작하는지 파악하면 좋을 것 같습니다.

### 1️⃣ 현재 설치된 이미지 파악하기
```bash
docker images

# 실행 결과
# -------------------------------------------------------------------------------- #
# IMAGE                           ID             DISK USAGE   CONTENT SIZE   EXTRA
# mongo:latest                    6f55a078e025       1.24GB          318MB
# mysql:8                         90544b377549       1.08GB          243MB
# postgres:16                     f992505e18f1        663MB          165MB
```

### 2️⃣ 저장소에 있는 이미지 찾기
```bash
docker search ubuntu:latest

# 실행 결과
# -------------------------------------------------------------------------------- #
# NAME                             DESCRIPTION                                      STARS    OFFICIAL
# ubuntu                           Ubuntu is a Debian-based Linux operating sys…   17789     [OK]
```

### 3️⃣ 저장소에 있는 이미지 다운받기
```bash
docker pull ubuntu:latest

# 실행 결과
# -------------------------------------------------------------------------------- #
# latest: Pulling from library/ubuntu
# 66a4bbbfab88: Pull complete
# 9c2a2ec78563: Download complete
# Digest: sha256:d1e2e92c075e5ca139d51a140fff46f84315c0fdce203eab2807c7e495eff4f9
# Status: Downloaded newer image for ubuntu:latest
# docker.io/library/ubuntu:latest
```

### 4️⃣ 다운받은 이미지 삭제하기
```bash
docker rmi ubuntu:latest

# 실행 결과
# -------------------------------------------------------------------------------- #
# Untagged: ubuntu:latest
# Deleted: sha256:cd1dba651b3080c3686ecf4e3c4220f026b521fb76978881737d24f200828b2b
```
> 여기서 rm은 remove에 줄임말이고, i는 image의 줄임말입니다. 따라서 remove image로 보면 되죠!

### 5️⃣ 이미지를 컨테이너로 만들고, 접속하기
```bash
docker run -it ubuntu:latest
# docker run -it --name ubuntu ubuntu:latest
# exit

# 실행 결과
# -------------------------------------------------------------------------------- #
# root@548218f4a968:/# whoami
# root
```
> 여기서 run 명령은 컨테이너를 실행시킨다는 뜻입니다. -it는 -i와 -t를 의미하는데, ==-i는 Interactive의 줄임말로 컨테이너의 표준 입출력을 열어두겠다는 뜻==입니다. 이 옵션이 있어야 우리가 키보드로 입력하는 명령어가 컨테이너 내부로 전달됩니다. 만약 -i가 없다면, 우리는 명령어를 칠 수 없겠죠? 그렇다면 -t는 뭘까요? ==-t는 Teletypewriter(TTY)의 줄임말로 Pseudo-TTY를 할당하겠다는 뜻==입니다. 그래서 결과를 보면 ++root@컨테이너id++처럼 글자가 예쁘게 정렬되어있죠? 바로 -t의 역할이라고 보시면 됩니다.

:::warning
아래 주석처리 되어있는 부분을 보면, --name이라는 옵션이 붙었죠? --name 옵션을 주면 해당 컨테이너에게 이름을 부여할 수 있습니다. --name ubuntu의 경우 이름을 ubuntu로 준 모습을 볼 수 있는데요! 만약, --name 옵션을 주지 않으면 랜덤으로 컨테이너 이름이 생성된다는 점 주의하세요! 그리고 -it 옵션을 붙이면 ubuntu 컨테이너에 접속이 되는데, 주석에 있는 exit 명령어를 쓰면 다시 터미널로 돌아갈 수 있습니다.
:::

### 6️⃣ 현재 실행중인 컨테이너 확인하기
```bash
docker ps -a

# 실행 결과
# -------------------------------------------------------------------------------- #
# CONTAINER ID   IMAGE           COMMAND       CREATED         STATUS                     PORTS     NAMES
# 83a08622008e   ubuntu:latest   "/bin/bash"   6 seconds ago   Exited (0) 3 seconds ago             ubuntu
```

> ??ps는 Process Status의 줄임말??로 컨테이너의 실행 상태를 확인할 수 있습니다. 자세히 보시면 ==STATUS쪽이 Exited== 되어있는 것을 볼 수 있죠? 이건, 앞에서 exit 명령어를 친 결과입니다.

### 7️⃣ 컨테이너 다시 시작/종료/재시작하기
```bash
docker start ubuntu

# 실행 결과
# -------------------------------------------------------------------------------- #
# CONTAINER ID   IMAGE           COMMAND       CREATED         STATUS         PORTS     NAMES
# 83a08622008e   ubuntu:latest   "/bin/bash"   5 minutes ago   Up 6 seconds             ubuntu

docker stop ubuntu

# 실행 결과
# -------------------------------------------------------------------------------- #
# CONTAINER ID   IMAGE           COMMAND       CREATED         STATUS                       PORTS     NAMES
# 83a08622008e   ubuntu:latest   "/bin/bash"   7 minutes ago   Exited (137) 4 seconds ago             ubuntu

docker restart ubuntu

# 실행 결과
# -------------------------------------------------------------------------------- #
# CONTAINER ID   IMAGE           COMMAND       CREATED         STATUS         PORTS     NAMES
# 83a08622008e   ubuntu:latest   "/bin/bash"   7 minutes ago   Up 3 seconds             ubuntu
```

### 8️⃣ 실행중인 컨테이너에 접속하기
```bash
docker exec -it ubuntu /bin/bash
# docker exec -it ubuntu bash

# 실행 결과
# -------------------------------------------------------------------------------- #
# root@83a08622008e:/# whoami
# root
```
> exec 명령어는 Execute 명령어의 줄임말로 실행중인 컨테이너에 접속할 수 있습니다. -it의 경우 앞서 설명했던 내용과 똑같고, 다만 다른점은 마지막 부분에 /bin/bash 또는 bash를 적어주어야합니다. /bin/bash를 적어주는 이유는, ==접속할 쉘(Shell)==을 알려주기 위함이라고 생각하면 됩니다!

### 🥱 마무리
지금까지 Docker를 사용함에 있어서 기본이 되는 명령어에 대해서 살펴봤습니다. 이 정도 명령어만 알고 있어도 기본적인 Docker를 사용하는데는 아무런(?) 지장이 없을겁니다. 이후로 심화되는 내용을 배워보도록 하죠!