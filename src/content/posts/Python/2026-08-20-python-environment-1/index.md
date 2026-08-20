---
title: "[Python] uv와 Poetry로 개발 환경 관리하기"
image: /images/python.png
published: 2026-08-20T00:00:00.000Z
description: Ubuntu, Windows, macOS에서 uv와 Poetry를 설치하고 프로젝트별 Python 환경을 구성하는 방법을 알아봅니다.
tags:
  - uv
  - Poetry
  - Virtual Environment
category: Python
draft: true
postId: 32
---

## 🧰 들어가기에 앞서

Python을 처음 사용할 때는 필요한 라이브러리를 바로 설치해도 별문제가 없어 보입니다. 그런데 프로젝트가 하나둘 늘어나면 상황이 달라집니다. 한 프로젝트는 Python 3.11과 특정 버전의 라이브러리를 요구하고, 다른 프로젝트는 Python 3.13과 최신 라이브러리를 요구할 수 있습니다.

이때 모든 라이브러리를 컴퓨터 전체에 설치하면 프로젝트끼리 서로 영향을 줍니다. 내 컴퓨터에서는 실행되던 코드가 팀원의 컴퓨터나 배포 서버에서는 실행되지 않는 문제도 생깁니다. 그래서 Python 프로젝트에는 다음 두 가지가 필요합니다.

- 프로젝트마다 분리된 가상환경
- 모두가 같은 버전을 설치할 수 있는 의존성 잠금 파일(Lock File)

uv와 Poetry는 이 두 가지를 함께 관리해 주는 도구입니다. 이번 글에서는 Ubuntu, Windows, macOS에서 두 도구를 설치하고, 같은 예제 프로젝트를 각각 실행해 보겠습니다.

:::important
이 글에서는 uv와 Poetry를 비교하기 위해 두 흐름을 모두 다룹니다. ++실제 프로젝트에서는 특별한 이유가 없다면 하나만 선택해서 사용하는 편이 좋습니다.++
:::

## 🤔 uv와 Poetry는 무엇이 다를까?

두 도구 모두 pyproject.toml에 프로젝트 정보와 의존성을 기록합니다. ??잠금 파일에는 다른 컴퓨터에서도 같은 설치 결과를 재현하기 위한 정보가 담깁니다.?? 하지만 바라보는 범위에는 차이가 있습니다.

| 구분 | uv | Poetry |
| :--- | :--- | :--- |
| 중심 역할 | Python 버전, 가상환경, 의존성, 도구 실행을 폭넓게 관리 | 의존성 관리와 Python 패키징을 일관된 작업 흐름으로 관리 |
| Python 사전 설치 | 없어도 설치와 관리 가능 | Poetry 설치를 위해 Python 3.10 이상 필요 |
| 잠금 파일 | uv.lock | poetry.lock |
| 가상환경 기본 위치 | 프로젝트의 .venv | 운영체제별 캐시 디렉터리 |
| 잘 맞는 경우 | 빠른 설치와 하나의 도구로 Python 환경까지 관리하고 싶을 때 | 익숙하고 명시적인 패키징 작업 흐름을 선호할 때 |

새 프로젝트를 빠르고 단순하게 시작한다면 uv, 기존 Poetry 프로젝트를 이어 가거나 Poetry의 패키징 흐름이 필요하다면 Poetry가 자연스럽습니다. ==무엇이 무조건 더 좋다기보다, 팀이 하나의 도구와 잠금 파일을 일관되게 사용하는 것이 더 중요합니다.==

## ⚡ 운영체제별 uv 설치

uv의 독립 실행형 설치 프로그램은 Python이 설치되어 있지 않아도 사용할 수 있습니다.[^1]

### 1. Ubuntu

터미널에서 공식 설치 스크립트를 실행합니다.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

설치가 끝난 뒤 새 터미널을 열고 설치 여부를 확인합니다.

```bash
uv --version
```

uv 0.x.x처럼 버전이 출력되면 준비가 끝난 것입니다. 명령을 찾을 수 없다는 메시지가 나오면 터미널을 다시 열어 PATH 변경 사항을 반영합니다.

### 2. Windows

PowerShell을 열고 다음 명령을 실행합니다.

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

PowerShell을 다시 연 뒤 설치 여부를 확인합니다.

```powershell
uv --version
```

여기서 지정한 실행 정책은 현재 설치 명령을 실행하는 데만 사용됩니다. 시스템 전체의 PowerShell 실행 정책을 영구적으로 바꾸는 명령은 아닙니다.

### 3. macOS

Ubuntu와 마찬가지로 터미널에서 공식 설치 스크립트를 실행합니다.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

새 터미널을 연 뒤 설치 여부를 확인합니다.

```bash
uv --version
```

Homebrew를 이미 사용하고 있다면 brew install uv로 설치할 수도 있습니다. 다만 설치 방식을 섞으면 업데이트 주체가 헷갈릴 수 있으므로, 이후에는 처음 선택한 방식으로 업데이트하는 것이 좋습니다.

## 🚀 uv로 프로젝트를 실행해 보자

설치만 끝내면 가상환경이 실제로 분리되는지 알기 어렵습니다. uv-example 프로젝트를 만들고 requests를 추가해 보겠습니다.

```bash
uv init uv-example
cd uv-example
uv add requests
```

uv add를 실행하면 pyproject.toml에 requests가 기록됩니다. ??이 과정에서 정확한 설치 결과를 담은 잠금 파일과 프로젝트 전용 가상환경도 함께 만들어집니다.?? 생성된 파일과 디렉터리는 각각 uv.lock과 .venv입니다.

main.py를 다음과 같이 수정합니다.

```python title="main.py"
import requests

response = requests.get("https://example.com", timeout=5)
print(response.status_code)
```

이제 가상환경을 직접 활성화하지 않고 실행해 보겠습니다.

```bash
uv run python main.py

# 실행 결과
200
```

uv run은 ??현재 프로젝트의 환경을 준비한 뒤 그 안에서 명령을 실행합니다.?? 따라서 운영체제마다 다른 가상환경 활성화 명령을 외우지 않아도 됩니다.

## 🎨 운영체제별 Poetry 설치

Poetry 2.4는 Python 3.10 이상을 요구합니다. 따라서 먼저 python3 --version 또는 Windows의 py --version으로 Python이 준비되어 있는지 확인해야 합니다.[^2]

:::warning
Poetry를 프로젝트가 사용하는 가상환경 안에 직접 설치하지 마세요. Poetry 자체의 의존성과 프로젝트 의존성이 충돌할 수 있으므로, 공식 설치 프로그램처럼 Poetry만을 위한 격리 환경을 만드는 방식을 사용합니다.
:::

### 1. Ubuntu

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

설치 후 새 터미널을 열고 확인합니다.

```bash
poetry --version
```

### 2. Windows

PowerShell에서 다음 명령을 실행합니다.

```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -
```

Microsoft Store에서 Python을 설치했다면 py 대신 python을 사용해야 할 수 있습니다. PowerShell을 다시 연 뒤 설치 여부를 확인합니다.

```powershell
poetry --version
```

명령을 찾지 못한다면 설치 안내에 출력된 경로가 PATH에 포함되었는지 확인합니다. Windows에서 공식 설치 프로그램이 만드는 실행 파일은 일반적으로 %APPDATA%\Python\Scripts에 위치합니다.

### 3. macOS

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

새 터미널을 연 뒤 설치 여부를 확인합니다.

```bash
poetry --version
```

Ubuntu와 macOS에서는 공식 설치 프로그램이 poetry 실행 파일을 $HOME/.local/bin에 연결합니다. 명령을 찾지 못한다면 설치 결과에 표시된 안내에 따라 이 경로를 PATH에 추가합니다.

## 📦 Poetry로 프로젝트를 실행해 보자

이번에는 같은 흐름을 Poetry로 진행합니다.

```bash
poetry new poetry-example
cd poetry-example
poetry add requests
```

poetry add를 실행하면 pyproject.toml에 의존성이 기록되고 poetry.lock이 만들어집니다. ??Poetry는 전역 Python과 분리된 프로젝트 가상환경도 자동으로 생성합니다.??[^3]

프로젝트 루트에 main.py를 만들고 다음과 같이 작성합니다.

```python title="main.py"
import requests

response = requests.get("https://example.com", timeout=5)
print(response.status_code)
```

Poetry가 관리하는 환경 안에서 파일을 실행합니다.

```bash
poetry run python main.py

# 실행 결과
200
```

poetry run 역시 가상환경을 직접 활성화하지 않고 명령을 실행합니다. uv run과 모양은 비슷하지만, ??두 도구가 생성한 환경과 잠금 파일은 서로 다릅니다.??

## 🏗️ 대형 프로젝트에서는 왜 .venv를 저장소 안에 두지 않을까?

여기서 한 가지 오해하기 쉬운 부분이 있습니다. 대형 프로젝트라고 해서 가상환경을 사용하지 않는 것은 아닙니다. 규모와 상관없이 Python 의존성을 격리할 환경은 여전히 필요합니다. 다만 프로젝트 루트의 .venv 대신 Poetry의 기본 설정처럼 사용자 캐시 디렉터리나 컨테이너 내부에 환경을 만드는 경우가 많습니다.

그러면 저장소 안의 .venv가 대형 프로젝트에서 부담이 되는 이유는 무엇일까요?

- 의존성이 많아지면 .venv가 수 GB까지 커질 수 있습니다. 여러 서비스가 있는 모노레포(Monorepo)에서는 비슷한 패키지가 환경마다 중복되어 디스크를 더 많이 사용합니다.
- IDE, 파일 검색 도구, 백신 프로그램이 수만 개의 패키지 파일을 탐색하면 인덱싱과 검색 속도가 느려질 수 있습니다.
- .venv가 Docker 빌드 컨텍스트나 백업 대상에 실수로 포함되면 전송 시간과 이미지 크기가 불필요하게 커집니다.
- 가상환경 내부의 실행 파일과 경로는 운영체제, CPU 아키텍처, Python 설치 위치에 영향을 받습니다. Ubuntu에서 만든 .venv를 Windows나 macOS에 복사해 그대로 사용하는 방식은 재현 가능한 환경이 아닙니다.
- CI와 운영 환경은 깨끗한 상태에서 의존성을 다시 설치할 수 있어야 합니다. 이미 만들어진 .venv에 의존하면 잠금 파일만으로 환경이 재현되는지 확인하기 어렵습니다.

:::important
대형 프로젝트에서 피해야 하는 것은 .venv라는 이름의 폴더 자체가 아니라, ==가상환경을 저장소의 일부처럼 공유하고 오래 보관하는 방식입니다.== 개발 환경은 pyproject.toml과 잠금 파일로 다시 만듭니다. ++CI와 운영 환경에서는 컨테이너처럼 격리된 환경에 새로 구성하는 편이 안전합니다.++ 참고로 저는 .venv를 혐오하지 않습니다. ㅎㅎㅎ
:::

프로젝트 루트의 .venv는 현재 프로젝트의 환경을 눈으로 찾기 쉽고 IDE도 자동으로 인식한다는 장점이 있습니다. 따라서 하나의 애플리케이션을 개발하는 일반적인 저장소에서는 충분히 좋은 선택입니다. 반대로 여러 Python 서비스가 들어 있는 모노레포, 개발 환경의 디스크 사용량이 큰 프로젝트, 컨테이너 중심의 프로젝트라면 ++가상환경을 저장소 밖의 중앙 캐시에서 관리하는 방식을 고려할 수 있습니다.++

## 🔒 Git에는 무엇을 올려야 할까?

도구를 설치하고 실행하는 것보다 더 중요한 것은 팀과 같은 환경을 재현하는 일입니다.

- pyproject.toml은 프로젝트 정보와 직접 추가한 의존성을 담으므로 커밋합니다.
- uv.lock 또는 poetry.lock은 정확한 의존성 버전을 담으므로 애플리케이션 프로젝트에서는 함께 커밋합니다.
- .venv는 각 컴퓨터에서 다시 만들 수 있고 용량도 크므로 .gitignore에 추가합니다.
- 한 프로젝트에서 uv.lock과 poetry.lock을 동시에 관리하지 않습니다.

:::tip
새로 저장소를 내려받은 팀원은 uv sync 또는 poetry install로 잠금 파일에 맞는 환경을 다시 만들 수 있습니다. ==가상환경 폴더를 공유하는 것이 아니라, 환경을 재현할 수 있는 설정과 잠금 파일을 공유하는 것입니다.==
:::

## 😮‍💨 마무리

이번 글에서는 Ubuntu, Windows, macOS에서 uv와 Poetry를 설치하고 같은 Python 프로젝트를 실행해 봤습니다.

- uv는 Python이 없어도 설치할 수 있고 Python 버전과 프로젝트 환경을 함께 관리할 수 있습니다.
- Poetry는 Python 3.10 이상이 필요하며 의존성 관리와 패키징에 일관된 흐름을 제공합니다.
- 두 도구 모두 pyproject.toml, 프로젝트별 가상환경, 잠금 파일을 이용해 실행 환경을 재현합니다.
- 프로젝트 규모가 커져도 가상환경은 필요하지만, 환경의 위치와 수명은 저장소 구조와 배포 방식에 맞춰 결정해야 합니다.
- 실제 프로젝트에서는 한 가지 도구를 선택하고 잠금 파일까지 Git으로 관리하는 것이 중요합니다.

앞으로 Python 예제를 작성할 때는 이 글의 환경 구성을 기준으로 삼고, 각 글에는 그 프로젝트에 필요한 의존성 추가와 실행 과정만 적겠습니다.

[^1]: [uv 공식 설치 문서](https://docs.astral.sh/uv/getting-started/installation/)
[^2]: [Poetry 공식 설치 문서](https://python-poetry.org/docs/#installation)
[^3]: [Poetry 가상환경 관리 문서](https://python-poetry.org/docs/managing-environments/)
