---
title: "[Docker] This is fucking Docker!"
image: /images/test4.png
published: 2026-02-23T00:00:00.000Z
description: Hello, World!
series: docker-basics
seriesOrder: 1
tags:
  - Docker
  - Backend
  - CI/CD
category: Backend
draft: false
postId: 11
---

### 🌟 Docker를 시작하기 앞서..
적어도 프로젝트를 한 번 이상 진행해본 사람이라면, Docker에 대해서 한번쯤은 들어봤을겁니다. Docker는 왜 사용하는걸까요? 세계에는 엄청나게 많은 개발자들이 있고, 서로 다른 개발자들이 다양한 운영체제(Operating System, OS)를 사용합니다. 누군가는 MacOS를 사용할꺼고, 다른 누군가는 Windows, Linux 등을 사용하겠죠. 서로 다른 OS를 가진 개발자들이 하나의 프로젝트를 만들기 위해서 모였습니다. ==분명 MacOS에서 실행할때는 정상적으로 동작하던 프로젝트가, Windows에서는 오류를 뱉는(?) 상황이 발생합니다.== 어떻게 해결해야할까요?

> 정답은 바로 Docker에 있습니다.
>
> 그래서 Docker가 뭐냐고요? ??Docker란 애플리케이션과 그 애플리케이션을 실행하는 데 필요한 모든 것, 코드, 런타임, 시스템 도구, 라이브러리 등, 을 하나로 묶어주는 기술??을 말합니다. 이렇게 묶인 꾸러미를 Docker에서는 컨테이너(Container)라고 부릅니다.

:::tip
영어로 되어있는 문장에서, 혹시 이런 문장 보신적 있나요? "Steve Jobs==, the co-founder of Apple,== was a true visionary." 형광색으로 칠해진 부분을, 삽입구(Parenthetical Expression)라고 하는데, 제가 위에서 형광색으로 칠한 부분이 한국어인데, 영어의 삽입구처럼 칠한 부분입니다. 그냥 "모든 것"이라는 단어에 대해서 예를 들어 설명해주는 부분이라고 보시면 됩니다!
:::

### 🎐 Docker와 가상 머신과의 차이
![Image](./picture1.png)
우린, Docker와 가상 머신의 차이를 알기 전에 먼저 하이퍼바이저(Hypervisor)라는 친구에 대해서 먼저 알아야합니다.


### 📖 Docker의 구성
Docker를 공부하는데 알아야하는 개념들에 대해서 미리 정의하고 갑시다.
- **🌐 Concept**
  - 이미지(Image): 이미지는 저장소에 저장되어있는 컨테이너의 설계 도안
  - 컨테이너(Container): 컨테이너는 이미지를 통해서 생성
  - 저장소(Repository): 이미지들이 모여있는 장소
  - Dockerfile: 이미지를 만들때, 어떤 OS나 프로그램을 설치할지 코드로 적어둔 파일
  - docker-compose.yml: 서로 다른 컨테이너를 연결하는 역할


### 