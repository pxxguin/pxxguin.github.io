---
title: "[Docker] Docker 한 번에 이해하기"
image: /images/docker.jpg
published: 2026-02-22T00:00:00.000Z
description: 내 컴퓨터에선 잘 되는데 왜 서버에선 안 될까?" 개발자라면 한 번쯤 겪어본 이 문제를 해결해 주는 Docker의 핵심 개념을 정리합니다.
series: docker-basics
seriesOrder: 1
tags:
  - Docker
  - Backend
  - CI/CD
category: MLOps
draft: false
postId: 11
---

## 🌟 Docker를 시작하기 앞서..
적어도 프로젝트를 한 번 이상 진행해본 사람이라면, Docker에 대해서 한번쯤은 들어봤을겁니다. Docker는 왜 사용하는걸까요? 세계에는 엄청나게 많은 개발자들이 있고, 서로 다른 개발자들이 다양한 운영체제(Operating System, OS)를 사용합니다. 누군가는 MacOS를 사용할꺼고, 다른 누군가는 Windows, Linux 등을 사용하겠죠. 서로 다른 OS를 가진 개발자들이 하나의 프로젝트를 만들기 위해서 모였습니다. ==분명 MacOS에서 실행할때는 정상적으로 동작하던 프로젝트가, Windows에서는 오류를 뱉는(?) 상황이 발생합니다.== 어떻게 해결해야할까요?

> 정답은 바로 Docker에 있습니다.
>
> 그래서 Docker가 뭐냐고요? ??Docker란 애플리케이션과 그 애플리케이션을 실행하는 데 필요한 모든 것, 코드, 런타임, 시스템 도구, 라이브러리 등, 을 하나로 묶어주는 기술??을 말합니다. 이렇게 묶인 꾸러미를 Docker에서는 컨테이너(Container)라고 부릅니다.

:::tip
영어로 되어있는 문장에서, 혹시 이런 문장 보신적 있나요? "Steve Jobs==, the co-founder of Apple,== was a true visionary." 형광색으로 칠해진 부분을, 삽입구(Parenthetical Expression)라고 하는데, 제가 위에서 형광색으로 칠한 부분이 한국어인데, 영어의 삽입구처럼 칠한 부분입니다. 그냥 "모든 것"이라는 단어에 대해서 예를 들어 설명해주는 부분이라고 보시면 됩니다!
:::


## 🎐 Docker와 가상 머신과의 차이
![Image](src/content/posts/Docker/2026-02-23-Docker-1/picture1.png)
두 구조를 잘 보면, 가장 아래에 똑같은 Basic을 두고 있습니다. ??Infrastructure는 실제 컴퓨터의 하드웨어??를 나타내고, ??Host Operating System은 그 하드웨어에 설치된 OS??를 의미합니다. 현재 우리 컴퓨터에 설치된 MacOS, Windows, Linux 등이 여기에 해당되겠죠?

그 다음부터 차이가 시작되는데, ??Hypervisor는 하드웨어를 쪼개서 가짜 컴퓨터를 만드는 역할??을 합니다. 이 과정에서 리소스 소모가 많이 발생합니다. 반면, ??Docker Engine의 경우 하드웨어를 쪼개는 것이 아니라 운영체제의 자원을 프로세스별로 격리??만 해둡니다. 따라서 Hypervisor보다 훨씬 가벼운거죠. 

이 그림에서 가장 중요한 부분은 Guest OS의 유무입니다. ??Virtual Machine의 경우 앱 하나를 띄우기 위해 그 위에 Guest OS를 통째로 올립니다.?? 리눅스 위에 윈도우를 설치하거나, 리눅스 위에 또 다른 리눅스를 설치해야해서 GB단위로 무거워집니다. 반면, ??Docker Container의 경우 Guest OS 대신 Bin/Libs와 App만 들어있죠.?? 운영체제는 Host OS의 것을 빌려쓰기 때문이죠. 덕분에 MB단위로 가벼워집니다.

:::important
왼쪽의 Virtual Machine의 경우 앱을 실행하기 위해 집(OS)를 통째로 짓는 방식이라면, Docker의 경우 이미 지어진 아파트(OS)에 짐(App)만 챙겨서 입주하는 것과 같습니다. 당연히 Docker가 훨씬 빠르고 공간도 덜 차지하겠죠?
:::


## 📖 Docker의 구성
Docker를 공부하는데 알아야하는 개념들에 대해서 미리 정의하고 갑시다.
- **🌐 Concept**
  - 이미지(Image): 이미지는 저장소에 저장되어있는 컨테이너의 설계 도안
  - 컨테이너(Container): 컨테이너는 이미지를 통해서 생성
  - 저장소(Repository): 이미지들이 모여있는 장소
  - Dockerfile: 이미지를 만들때, 어떤 OS나 프로그램을 설치할지 코드로 적어둔 파일
  - docker-compose.yml: 서로 다른 컨테이너를 연결하는 역할

## 🥱 마무리
위의 내용만 잘 숙지한다면, Docker를 이해하는데 큰 어려움은 없을겁니다. 다음부터 Docker에서 사용되는 기본적인 명령어에 대해서 설명을 하도록 하겠습니다.