---
title: "[Agent] 권한이 있으면 Agent가 사용해도 될까?"
image: /images/cs.png
published: 2026-09-09T00:00:00.000Z
description: 기존 인증·인가의 가정이 AI Agent 환경에서 왜 충분하지 않을 수 있는지 코딩 Agent의 Tool Call을 따라가며 알아봅니다.
tags:
  - AI Agent
  - Authentication
  - Authorization
  - Delegation
category: Security
draft: false
postId: 54
---

## 📝 README 오타를 고치는데 SSH Key가 필요할까?

[지난 글](/53/) 에서는 기존 시스템이 “누가 어떤 리소스에 어떤 행동을 할 수 있는가?”를 어떻게 판단했는지 살펴봤습니다. Authentication으로 주체를 확인하고, ACL·Role·Permission·Scope와 같은 정책으로 그 주체의 요청을 허용하거나 거절했죠.

이번에는 코딩 Agent에게 아주 간단한 작업을 맡겨보겠습니다.

:::example[사용자가 맡긴 작업]
사용자: README의 오타를 수정해줘.
:::

Agent가 README를 읽고, 오타가 있는 문장을 찾고, 해당 파일을 수정합니다. 여기까지는 사용자가 기대한 행동입니다. 그런데 Agent가 작업 도중 아래와 같은 명령을 실행하려고 한다면 어떨까요?

```bash
cat ~/.ssh/id_ed25519
curl https://unrelated-api.example.com/account
```

README의 오타와는 아무 관련이 없어 보입니다. 당연히 거절하면 될 것 같은데, 여기에는 조금 이상한 문제가 있습니다. 이 코딩 Agent가 사용자의 계정과 실행 환경을 그대로 사용하고 있고, 사용자는 자신의 SSH Key를 읽을 권한도, 해당 API를 호출할 권한도 가지고 있습니다.

기존 Permission Check에 다음 요청을 물어보면 둘 다 허용될 수 있습니다.

:::example[SSH Key 읽기 요청]
주체: pxxguin

리소스: ~/.ssh/id_ed25519

행동: read

결과: Allow
:::

:::example[외부 API 호출 요청]
주체: pxxguin

리소스: unrelated-api.example.com

행동: request

결과: Allow
:::

인증도 성공했고 실제 사용자가 가진 권한에도 포함됩니다. 당연히 ==권한이 있다는 사실과 지금 이 작업에 필요한 행동이라는 사실은 같지 않습니다.==

이 글에서 다룰 질문은 바로 이것입니다.

> 기존 인증·인가가 “이 주체에게 이 권한이 있는가”를 잘 판단해왔다면, AI Agent 환경에서는 왜 그것만으로 충분하지 않을 수 있는가?

## 🎢 기존 애플리케이션에서는 실행할 행동의 경로가 비교적 명확했다

기존 쇼핑몰의 주문 취소 흐름을 생각해봅시다. 사용자가 주문 취소 버튼을 누르면 브라우저는 미리 정해진 Endpoint로 요청을 보냅니다. 서버는 로그인 세션으로 사용자를 확인하고, 요청한 주문이 그 사용자의 것인지 검사한 뒤 취소 로직을 실행합니다.

```text
사용자
  ↓ 주문 취소 버튼 클릭
POST /orders/1234/cancel
  ↓ 소유자와 Permission 확인
주문 취소
```

행동의 시작점은 사용자의 클릭이고, 애플리케이션이 실행할 코드 경로는 개발자가 미리 작성했습니다. 물론 공격자가 요청 값을 바꾸거나 서버에 취약점이 생길 수는 있습니다. 그래서 OWASP는 요청이 브라우저, 서버 또는 다른 경로에서 왔는지와 관계없이 모든 요청의 Permission을 검사하라고 권고합니다.[^1]

그래도 정상적인 동작만 놓고 보면 어떤 행동이 실행될지는 비교적 분명했습니다.

- 사용자는 주문 취소라는 구체적인 Action을 직접 요청합니다.
- 애플리케이션은 ==개발자가 정한 순서로 검증과 취소 로직을 실행==합니다.
- 서버는 사용자 Identity, 주문 리소스, cancel Permission을 비교합니다.

외부 사진 애플리케이션에 OAuth 권한을 줄 때도 비슷합니다. 사용자는 ==사진 읽기 Scope에 동의==하고, 애플리케이션은 그 ==Scope로 허용된 API를 호출==합니다. RFC 6749의 Scope는 클라이언트가 요청한 접근 범위를 표현하고, Authorization Server가 실제 허용 범위를 결정하는 데 사용됩니다.[^2]

그러니 기존 인증·인가가 허술했다는 뜻은 아닙니다. Identity, Role, Permission, Scope는 “이 요청을 한 주체에게 이 행동을 수행할 권한이 있는가?”를 표현하는 데 아주 잘 맞았습니다. Zero Trust Architecture도 로그인 한 번을 모든 요청에 대한 신뢰로 사용하지 않고, 개별 리소스 요청마다 주체와 자산, 환경 정보를 바탕으로 판단해야 한다고 설명합니다.[^3]

## 🧩 Agent는 목표를 Action으로 바꾼다

AI Agent가 들어오면 사용자가 말하는 단위부터 달라집니다. 사용자는 매번 파일과 명령을 하나씩 지정하지 않고 ++Intent(의도)++를 전달합니다.

:::example[사용자의 Intent]
사용자: README의 오타를 수정해줘.
:::

Agent는 목표를 바탕으로 다음 행동을 선택하고, 필요에 따라 계획을 세우거나 수정합니다. 파일 목록을 확인하고, README를 읽고, 수정할 부분을 찾고, 파일 쓰기 Tool을 호출한 뒤 결과를 다시 확인할 수 있습니다. 상황에 따라 검색이나 테스트가 필요하다고 판단할 수도 있죠.

```text
User Intent
“README의 오타를 수정해줘.”
        ↓
Agent가 다음 행동을 선택하고 계획을 조정
        ↓
파일 목록 확인 → README 읽기 → 파일 수정 → 결과 확인
```

사용자는 최종 목표(오타 수정)에는 동의했습니다. 하지만 중간의 모든 Tool Call을 직접 요청한 것은 아닙니다. README를 읽는 것은 자연스럽게 포함된다고 볼 수 있지만, 저장소 전체 검색은 어떨까요? 맞춤법 검사 패키지를 설치하는 것은요? 수정 결과를 원격 저장소에 Push하는 것까지 포함될까요?

예.. 자연어로 부탁한 한 문장과 실제 시스템에서 실행할 Action 사이에는 공백이 꽤 많습니다. Agent의 역할이 바로 그 빈칸을 채우는 것이지만, 이걸 보안의 관점에서 보면, ==어떤 권한을 사용할지 결정하는 과정도 Agent에게 일부 넘어갔다==는 뜻입니다.

## 🪜 한 번의 요청이 여러 번의 위임으로 바뀐다

코딩 Agent가 파일 Tool만 사용한다면 아직 해볼만합니다. 그런데 ==테스트 실패 원인을 찾기 위해 외부 문서를 검색하고, 저장소 API에서 Issue를 읽고, 어려운 부분을 Sub-agent에게 나누어 맡긴다면 어떻게 될까요?==

```text
User
  ↓ 목표를 맡김
Agent
  ↓ 실행을 요청
Tool
  ↓ 자격증명으로 호출
External Service

Agent
  ↓ 하위 작업을 맡김
Sub-agent
  ↓ 다시 Tool을 호출
External Service
```

처음에는 User가 Agent에게 “README의 오타 수정”을 맡겼습니다. Agent는 파일 수정 Tool에 행동을 맡기고, Tool은 운영체제에서 실제 파일을 변경합니다. 다른 Agent에게 하위 작업을 맡기면 위임 경로가 한 단계 더 늘어납니다.

이때 외부 서비스(Google drive, Github)는 무엇을 볼 수 있을까요?

- 사용자의 Identity가 담긴 Token을 그대로 볼 수 있습니다.
- Agent 전용 서비스 계정을 볼 수도 있습니다.
- Tool 서버의 공용 자격증명만 볼 수도 있습니다.
- User와 Agent의 Identity가 함께 표현된 Token을 받을 수도 있습니다.

기존에 User와 Agent를 구분하는 개념 자체가 표준에 전혀 없었던 것은 아닙니다. 다만 이러한 표준은 누가 누구를 대신해 행동하는지를 표현하는 데 도움을 줄 뿐입니다. Token에 User가 Subject이고 Agent가 Actor라는 정보가 담겨도, ==“README 오타를 수정하는데 지금 SSH Key를 읽는 것이 정당한가?”까지 자동으로 판단해주지는 않습니다.==

게다가 User → Agent → Sub-agent → Tool → External Service처럼 연결이 길어지면 “Token이 유효한가?” 외에도 질문이 계속 생깁니다.

- 사용자는 Agent에게 정확히 어느 권한을 맡겼을까요?
- Agent가 Tool에 넘긴 권한은 원래 위임받은 범위 안에 있을까요?
- Sub-agent도 같은 권한을 가져야 할까요?
- 최종 서비스는 실제 Actor와 원래 User를 구분할 수 있을까요?
- 중간 Tool이 자신의 넓은 서비스 계정으로 요청하면 원래 범위가 사라지지 않을까요?

2026년 NIST NCCoE가 공개한 초기 ++Concept Paper++에서도 Agent가 특정 행동을 수행할 권한을 어떻게 증명할지, On Behalf Of 상황의 권한 위임을 어떻게 처리할지, Agent Identity와 Human Identity를 어떻게 연결할지를 별도의 과제로 제시합니다.[^6] 아직 확정된 표준이 아니라, Software와 AI Agent의 Identity 및 Authorization에 기존 표준과 Best Practice를 어떻게 적용할지 검토하기 위한 초기 문서입니다.

## 🧨 사용자의 전체 권한은 현재 Task의 권한이 아니다

다시 README 예시로 돌아가보겠습니다. 사용자는 개발자이므로 다음 권한을 모두 가지고 있을 수 있습니다.

- 저장소의 파일 읽기와 쓰기
- Git Commit과 원격 저장소 Push
- 의존성 설치와 Shell 명령 실행
- 배포용 환경 변수 읽기
- SSH Key 사용
- 회사 Issue Tracker와 Cloud API 호출

이 권한들은 개발자가 여러 업무를 수행하기 위해 필요합니다. 하지만 ==“README의 오타 수정”이라는 현재 Task에는 전부 필요하지 않습니다.==

이 글에서는 편의상 사용자가 원래 가진 전체 권한을 ++User Authority++라고 하고, 특정 Task를 위해 Agent에게 실제로 맡긴 범위를 ++Task-scoped Authority++라고 구분해서 생각해보겠습니다. 표준에서 정한 용어라기보다 두 범위를 헷갈리지 않기 위한 표현입니다.

```text
User Authority
      ↓ 현재 Task에 필요한 범위만 위임
Task-scoped Authority
      ↓
Agent Action
```

```text
사용자가 가진 전체 권한
├── README 읽기와 쓰기       ← 현재 Task에 필요
├── 테스트 실행              ← 경우에 따라 필요
├── 원격 저장소 Push         ← 사용자가 요청하지 않음
├── SSH Key 읽기             ← 현재 Task와 무관
└── Cloud 배포               ← 현재 Task와 무관
```

Agent가 사용자의 전체 권한으로 실행되면 기존 인가 시스템은 SSH Key 읽기 요청을 허용할 수 있습니다. 정책의 관점에서는 거짓말이 아닙니다. 실제로 그 사용자는 자신의 Key를 읽을 수 있으니까요.

문제는 인가 질문에 ++현재 Task++가 빠져 있다는 것입니다.

```text
기존 질문
“pxxguin에게 SSH Key를 읽을 Permission이 있는가?”

Agent 환경에서 추가되는 질문
“SSH Key를 읽는 행동이 현재 Task의 위임 범위 안에 있고,
이 시점에 정당한 행동인가?”
```

OWASP는 LLM 기반 시스템의 ==Excessive Agency 원인을 과도한 기능, 과도한 Permission, 과도한 자율성==으로 구분합니다. 읽기만 필요한 확장 기능이 수정과 삭제 권한까지 가지는 상황을 위험 예시로 들고, 파일 하나를 쓰면 되는 작업에 모든 Shell 명령을 실행할 수 있는 Tool을 붙이지 말라는 완화 방안도 함께 제시합니다.[^7]

==사용자가 할 수 있는 모든 일을 Agent가 이번 작업에서 해도 되는 것은 아닙니다.== 이것이 사용자 권한을 그대로 Agent에게 전달했을 때 생기는 가장 큰 간격입니다.

## 🎫 Role과 Scope를 더 작게 나누면 해결될까?

그렇다면 Permission이나 Scope를 아주 세밀하게 만들면 되지 않을까요?

예를 들어 저장소 읽기, 저장소 쓰기, Secret 읽기, Issue 조회, Push를 모두 별도 Permission으로 나눌 수 있습니다. README를 수정할 때는 저장소 읽기와 쓰기만 허용하면 SSH Key와 외부 API 접근을 막을 수 있겠죠. 이는 반드시 필요한 조치이고, 기존 최소 권한 원칙은 Agent 환경에서도 그대로 중요합니다.

하지만 정적인 Role과 Scope만으로 모든 상황을 표현하기는 어렵습니다.

++repository:write++ Scope가 있다고 가정해봅시다. 이 Scope는 저장소를 수정할 수 있다는 사실은 표현하지만 다음 차이까지 반드시 담지는 않습니다.

- README의 오타 한 글자를 수정하는 행동
- CI Workflow에 외부 전송 명령을 추가하는 행동
- 모든 소스 파일을 삭제하는 행동

세 행동은 같은 파일 쓰기 Permission을 통과할 수 있지만, ==현재 Task와의 관계와 결과의 위험은 전혀 다릅니다.== 파일 경로별로 Scope를 더 나누더라도 “이 수정이 현재 Task의 위임 범위 안에 있고, 지금 실행해도 되는가?”는 자연어 목표와 실제 변경 내용, 행동의 결과를 함께 봐야 알 수 있습니다.

Role도 마찬가지입니다. Developer Role은 사용자가 평소 어떤 업무를 할 수 있는지 표현하기에는 좋습니다. 하지만 그 Role만으로 Agent의 이번 Tool Call이 현재 사용자의 Intent에서 나온 것인지, 외부 문서에 숨겨진 지시에서 나온 것인지 구분하기는 어렵습니다.

여기서 오해하면 안 되는 부분이 있습니다. ABAC처럼 시간, 위치, 기기 상태 등 Context를 정책에 넣는 기존 방식도 있고, NIST Zero Trust 역시 동적인 위험 기반 정책을 설명합니다.[^3] 그러니 “기존 인가는 Context를 전혀 보지 않는다”라고 말할 수는 없습니다.

다만 Agent 환경에서 새로 중요해진 Context는 단순한 시간이나 네트워크 위치만이 아닙니다.

- 사용자가 처음 전달한 Intent
- Agent가 세운 현재 계획
- 앞서 실행한 Tool Call과 그 결과
- 지금 선택한 행동이 Task에 필요한 이유
- 다른 Agent나 외부 데이터가 행동 선택에 미친 영향

이 정보는 일반적인 Identity, Role, Permission, Scope만으로 바로 표현하기 어렵습니다. ==Permission은 행동할 수 있는 능력을 나타내지만, 그 행동이 현재 목표에 필요한 이유까지 자동으로 증명하지는 않습니다.==

그렇다고 판단 기준을 “Task에 필요한가?” 하나로 줄일 수도 없습니다. README 수정 뒤에 Git Status와 Diff를 확인하는 것은 대체로 자연스럽고, 테스트 실행은 변경 내용에 따라 필요할 수 있습니다. Push는 Task와 관련이 있어도 사용자의 별도 승인이 필요할 수 있고, 저장소 전체를 삭제하는 행동은 관련성을 주장할 수 있더라도 결과가 너무 큽니다.

결국 Task와의 관련성뿐 아니라 실제로 위임받은 권한인지, 행동의 위험과 결과가 어느 정도인지, 어떤 이전 실행과 외부 입력을 거쳐 이 행동이 선택되었는지도 함께 확인해야 합니다.

## 🛡️ 기존 인증·인가를 버려야 한다는 뜻은 아니다

여기까지 읽으면 OAuth, RBAC 같은 기존 기술을 Agent 환경에서는 사용할 수 없다는 결론처럼 보일 수 있습니다. 하지만 그렇지 않습니다.

Agent가 GitHub API를 호출하더라도 Token 검증은 필요합니다. 파일을 수정할 때도 운영체제의 Permission을 통과해야 하고, Tool 서버와 외부 서비스는 서로의 Identity를 확인해야 합니다. 사용자가 애초에 접근할 수 없는 비공개 저장소라면 Agent도 접근할 수 없어야 합니다. 기존 인증·인가가 담당하던 경계는 그대로 남아있습니다.

오히려 이 검사가 빠지면 Agent는 Intent와 상관없이 시스템 전체를 건드릴 수 있습니다. OWASP도 LLM이 대신 판단하게 두는 것이 아니라, Downstream System에서 모든 Tool 요청을 보안 정책으로 검증하는 Complete Mediation(사용자가 저장소나 자원에 접근할 때 매번 권한/인증을 거쳐야되는 것)을 권고합니다.[^7]

그러니 Agent가 “이 Tool Call은 안전하다”고 판단했다는 이유만으로 바로 실행하면 안 됩니다. Agent는 Tool Call을 제안할 수 있지만, 실제 실행 전에는 별도의 보안 강제 지점이 Allow, Deny, Require Approval 중 하나를 결정하고 그 결과를 Tool에 적용해야 합니다.

```text
LLM이 Tool Call을 제안
          ↓
보안 정책 평가
Allow / Deny / Require Approval
          ↓
Tool 실행
```

다만 기존 검사를 통과했다는 사실만으로 “그러니 이 행동은 사용자가 원한 것이다”라고 결론 내리기 어렵습니다.

```text
기존 인증·인가가 확인하는 것
“이 Actor는 이 Action을 수행할 권한이 있는가?”

Agent 환경에서 함께 확인해야 하는 것
“이 Action은 위임받은 현재 Task의 범위 안에 있는가?”
“이 Action을 실제로 수행하려는 Actor는 누구인가?”
“이 권한은 User → Agent → Tool로 올바르게 위임되었는가?”
“이 시점에 이 Tool을 사용할 이유가 있는가?”
“결과가 큰 행동이라면 사용자의 추가 확인이 필요한가?”
```

첫 번째 질문은 기존 인증·인가가 계속 맡아야 합니다. 나머지 질문은 Agent의 실행 Context와 위임 범위, 행동의 위험도를 함께 보아야 합니다. 어떤 구성요소가 이 판단을 하고, 어떤 방식으로 강제할지는 다음 글부터 하나씩 살펴볼 문제입니다.

## 🔭 다음에는 무엇을 봐야 할까?

기존 애플리케이션에서는 사용자가 구체적인 Action을 요청하거나 개발자가 실행 흐름을 미리 작성했습니다. 그래서 Identity, Role, Permission, Scope를 요청과 비교하는 방식으로 많은 문제를 해결할 수 있었습니다.

AI Agent에서는 사용자가 목표를 주고 Agent가 Action과 Tool을 선택합니다. 하나의 요청은 여러 Tool Call로 나뉘고, Sub-agent와 외부 서비스로 이어지며 위임 경로도 길어집니다. 이때 사용자의 전체 권한을 Agent가 그대로 사용할 수 있다면, 기존 Permission Check를 정상적으로 통과하면서도 현재 Task와 무관한 행동이 실행될 수 있습니다.

그러니 기존 인증·인가는 사라지는 것이 아니라 출발점으로 남습니다. 그 위에 “이 행동이 현재 Task의 위임 범위 안에 있고, 이 시점에 정당한가?”를 판단할 정보와 통제가 더 필요할 수 있습니다.

그렇다면 다음 질문은 자연스럽게 시스템 안쪽으로 향합니다.

==그렇다면 실제 AI Agent 시스템은 어떤 구성요소로 이루어져 있고, 각 구성요소는 서로 어떤 인증·인가 방식을 사용하고 있을까?==

[^1]: [OWASP, Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
[^2]: [IETF RFC 6749, The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
[^3]: [NIST SP 800-207, Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)
[^4]: [Anthropic, Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents)
[^5]: [IETF RFC 8693, OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693)
[^6]: [NIST NCCoE, Accelerating the Adoption of Software and AI Agent Identity and Authorization](https://csrc.nist.gov/pubs/other/2026/02/05/accelerating-the-adoption-of-software-and-ai-agent/ipd)
[^7]: [OWASP GenAI Security Project, LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
