---
title: "[Nginx] Nginx의 기본"
image: /images/nginx.png
published: 2026-03-17T00:00:00.000Z
description: Nginx의 기본적인 이론에 대해서 설명합니다.
tags:
  - FastAPI
  - Orbstack
category: Nginx
draft: true
postId: 22
---

:::vocabulary[📖 핵심 단어 사전]
- <span id="v-c10k">**C10K Problem**</span>: 단일 서버가 동시에 10,000개 이상의 클라이언트 연결을 효율적으로 처리해야 하는 기술적 한계를 의미합니다.
- <span id="v-proxy">**Reverse Proxy**</span>: 클라이언트가 해당 포트로 요청을 보내올 때, 사전에 선언된 곳으로 다이렉팅 시키는 것을 의미합니다.
:::

## 🏤 Nginx를 왜 사용해야하는가?
과거에는 늘어나는 트래픽을 감당하기 위해 서버 성능을 높이는 방식에만 의존했고 ==Apache를 주로 사용했으나==, ++C10K Problem++<sup class="vocab-link"><a href="#v-c10k">1)</a></sup>과 같은 한계가 대두되면서 더 효율적인 처리 방식이 필요해졌습니다. Nginx는 이러한 문제를 해결하기 위해 등장했습니다.

아마 Nginx에 대해서 공부를 하기 위해 이 포스팅을 읽는 사람이라면, DevOps나, MLOps 개발자겠죠? Nginx에 대해서 많이 들어봤을텐데 대체 왜 쓰는걸까요? 우리가 아는 FastAPI와 같은 프로젝트를 그냥 포트포워딩을 시켜서 외부에서 접속하면 될텐데 말이죠.

==FastAPI나 Flask 같은 웹 프레임워크는 비즈니스 로직(데이터 처리, DB 연동)을 위해서 설계==되었지, !!이미지나 CSS 같은 정적 파일을 보내주는 데 최적화되어 있지 않습니다.!! 따라서 FastAPI의 경우 Python 코드를 거쳐 파일을 읽고 전송하느라 CPU를 소모합니다. 반면 ==Nginx의 경우 운영체제 레벨(sendfile)에서 파일을 바로 보내버리죠.== 이해하기 쉽게 설명을 해보자면, 서류 결재를 받으러 사장님(FastAPI)을 직접 찾아가는 게 아니라, 입구 안내데스크(Nginx)에서 바로 서류를 받아가는 것과 같습니다.

그리고 FastAPI 서버를 외부에 직접 노출하는 것은 방문을 활짝 열어두는 것과 같습니다. Nginx는 앞에서 보안 요원 역할을 수행합니다. ==HTTPS 암호화/복호화 처리를 Nginx가 전담==하게 하여, 내부 FastAPI 서버의 부하를 줄여주기도 하며, 실제 앱 서버의 IP 주소와 포트를 숨겨 공격자의 직접적인 타격을 막습니다. 또한 느린 네트워크를 사용하는 클라이언트가 데이터를 찔끔찔끔 보낼 때, Nginx가 이를 다 받아준 뒤 한꺼번에 FastAPI에 전달해 줍니다. 덕분에 우리 앱 서버는 기다리는 시간 없이 일만 할 수 있죠.

만약, 서비스가 대박이 나서 서버를 1대에서 3대로 늘려야 한다고 가정해 봅시다. 클라이언트가 3개의 IP를 다 알고 접속해야 할까요? ==Nginx는 클라이언트의 요청을 받아 뒤에 있는 여러 대의 서버로 골고루 나눠줍니다.== 특정 서버가 죽으면 알아서 제외하고 살아있는 서버로만 요청을 보내는 Health Check 기능도 수행합니다. MLOps 관점에서 모델 서빙 서버를 수평 확장할 때 필수적인 요소로 많은 사람들이 강조하는 부분이기 때문에, Nginx에 대한 무.조.건 능력을 요구합니다.


## 📘 Ubuntu에서의 Nginx 설치
```bash
wget http://nginx.org/keys/nginx_signing.key
apt-key add nginx_signing.key
apt-get update
apt-get install -y nginx
/etc/init.d/nginx start
```

## Nginx의 주요 설정 파일과 디렉터리
### 1️⃣ `/etc/nginx/`
- Nginx 서버가 사용하는 기본 설정이 저장된 루트 디렉터리입니다.
- Nginx는 이곳에 저장된 설정 파일의 내용에 따라 동작합니다.

### 2️⃣ `etc/nginx/nginx.conf`
- Nginx의 기본 설정 파일로, 모든 설정에 대한 진입점입니다.
- 워커 프로세스 개수, 튜닝, 동적 모듈 적재와 같은 글로벌 설정 항목을 포함하며, 다른 엔진엑스 세부 설정 파일에 대한 참조를 지정합니다.
- 디렉터리에 위치한 모든 설정 파일을 포함하는 최상위 http 블록을 갖고 있습니다.

### 3️⃣ `/etc/nginx/conf.d/`
- 기본 HTTP 서버 설정 파일을 포함합니다
- 디렉터리 내 파일 중 이름이 .conf로 끝나는 파일은 앞서 언급한 /etc/nginx/nginx.conf 파일이 가진 최상위 http 블록에 포함됩니다.
- 이처럼 Nginx 설정은 include 구문을 활용해 구조화함으로써 각 설정 파일을 간결하게 유지하면 좋습니다.
- 몇몇 패키지 저장소에서 배포되는 Nginx는 설치 시 conf.d 디렉터리 대신 site-enabled 디렉터리가 있고, symlink를 통해 site-available 디렉터리에 저장된 설정 파일들이 연결돼 있을 수 있습니다.
- 하지만 이 방식은 더는 사용되지 않습니다.

### 4️⃣ `/var/log/nginx/`
- Nginx의 로그가 저장되는 디렉터리로, access.log와 error.log 파일이 있습니다.
- 접근 로그 파일은 엔진엑스 서버가 수신한 개별 요청에 대한 로그를 저장하며, 오류 로그 파일은 오류 발생 시 이벤트 내용을 저장합니다.
- Nginx 설정을 통해 debug 모듈을 활성화했다면 디버그 정보도 오류 로그 파일에 기록됩니다.


## 🎠 Nginx 서비스
```bash title="/etc/nginx/conf.d/deafult.conf"
server {
    listen 80 default_server;
    server_name www.example.com;

    location / {
        root /usr/share/nginx/html;
        # alias /usr/share/nginx/html;
        index index.html index.htm;
    }
}
```

### 🕑 각각의 코드 설명
- `server 블록`
  - 엔진엑스가 처리할 새로운 컨텍스트를 선언하는 부분입니다.
- `listen 80 default_server`
  - 80번 포트로 들어오는 요청을 수신하도록 설정합니다.
  - 여기서 default_server 매개변수는 이 포트로 들어오는 요청 중 다른 서버 설정과 매칭되지 않는 요청을 이 블록이 기본으로 처리하게 만듭니다.
  - 필요에 따라 포트뿐만 아니라 IP 주소 범위를 지정할 수도 있습니다.
- `server_name`
  - 처리할 호스트명이나 도메인명( www.example.com )을 지정합니다.
  - 만약 서버가 사용할 특정 도메인이 아직 정해지지 않았다면, 앞서 설명한 default_server 매개변수를 사용하고 이 지시자는 생략할 수 있습니다.
- `location /`
  - 사용자가 요청한 URL의 경로(URI)를 기반으로 동작을 정의합니다.
  - 엔진엑스는 여러 location 블록 중 요청된 URI에 가장 적합한 곳을 찾아 연결해 줍니다.
- `root 지시자`
  - 서버의 어느 경로에서 파일을 찾을지 알려줍니다.
  - 엔진엑스는 이 지시자에 정의된 경로(/usr/share/nginx/html) 뒤에 수신된 URI 값을 그대로 합쳐서 최종 파일 위치를 찾습니다.
- `alias 지시자`
  - root와 유사하지만 location 지시자에 URI 접두어를 사용했을 때 경로가 결합되는 방식이 다릅니다.
  - 예제에서는 설정이 오작동하지 않도록 주석 처리되어 있습니다.
- `index 지시자`
  - 사용자가 정확한 파일명 없이 경로(예: /)만 요청했을 때, 기본적으로 찾아볼 파일의 목록(index.html, index.htm)을 지정합니다.

:::important
여기서 중요한 부분이 default_server 부분입니다. 사용자가 https://www.naver.com 과 같이 도메인을 입력해서 들어오는 경우가 아닌, 구글의 주소처럼 8.8.8.8로 접속을 하려 한다면 어떤 문제가 생길까요? 만약 8.8.8.8이 Nginx로 운영중이고, 클라이언트가 8.8.8.8:80으로 요청한것과 같죠? 여기서 8.8.8.8:80번을 입력하면 백엔드 로직이 작동할 수 있겠죠? 이럴때, ==default_server의 값을 두면서 8.8.8.8:80을 입력하더라도 무조건적으로 프론트엔드 페이지로 다이렉팅 될 수 있도록 만드는 겁니다. ==

그렇다면 default_server가 없는 경우에는 어떻게 될까요? 생각하기는 싫지만, /etc/nginx/conf.d/ 폴더 아래에 있는 80번을 listen하고 있는 .conf 파일 중에서 알파벳 순서가 가장 빠른 곳으로 다이렉팅 시킬겁니다!
:::


## 📩 마무리
다음 포스팅에서는 Nginx와 Fastapi의 연동을 알아보도록 합시다!