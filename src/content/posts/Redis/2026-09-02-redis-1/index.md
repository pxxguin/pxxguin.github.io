---
title: '[Redis] 레디스는 그냥 빠른 캐시 아닌가요?'
image: /images/redis.png
published: 2026-09-02T00:00:00.000Z
description: '레디스가 정확히 무엇이고 왜 빠른지, RDBMS·멤케시디와는 어떻게 다른지 실전 레디스 1장을 기준으로 정리하고 직접 설치까지 해봅니다.'
tags:
  - Redis
  - NoSQL
  - In-Memory Database
category: Redis
series: devops
seriesOrder: 12
draft: false
postId: 40
---

## 🟥 들어가기에 앞서

서비스 트래픽이 늘면 어느 순간 데이터베이스가 병목이 됩니다. 같은 조회 쿼리가 초당 수천 번씩 날아오고, 랭킹이나 세션처럼 자주 바뀌는 값을 매번 관계형 데이터베이스(RDBMS)에서 꺼내오다 보면 응답 속도가 눈에 띄게 느려집니다. 이럴 때 흔히 나오는 답이 “레디스(Redis) 앞단에 캐시로 두면 되지 않나요?”입니다.

저도 처음에는 딱 이 정도로만 알고 있었습니다. ==“빠른 Key-Value 캐시”== 정도로요. 그런데 ++실전 레디스++를 읽어보니 레디스는 캐시 하나로만 설명하기 어려운 도구였습니다. ==그 자체로 데이터를 저장하고 처리할 수 있는 인메모리 데이터 구조 저장소==였고, 다양한 자료형과 영속성, 복제, 트랜잭션 기능까지 가지고 있습니다.

이번 글부터 이 책을 기준으로 레디스 시리즈를 시작합니다. 1편에서는 레디스가 정확히 무엇이고 RDBMS·멤케시디(Memcached)와는 뭐가 다른지, 왜 이렇게 빠르다고 하는지 개념을 먼저 잡고, 마지막에는 우분투 환경에 직접 설치해서 ??SET??/??GET?? 명령까지 실행해보겠습니다. 5가지 기본 자료형은 분량이 많아 다음 글에서 따로 다룹니다.

## 🤔 레디스는 정확히 뭘까?

레디스는 ==인메모리 데이터 구조 저장소(In-Memory Data Structure Store)==입니다. 주로 메모리(RAM)에 있는 데이터를 처리하므로 디스크 중심 데이터베이스와 다른 지연 특성을 보입니다. 다만 네트워크 왕복, 느린 명령, 큰 Key, 영속성 작업까지 사라지는 것은 아니므로 “메모리니까 언제나 빠르다”고 단정해서는 안 됩니다.

“그럼 그냥 메모리에 다 올려두는 캐시 아닌가요?” 저도 처음엔 그렇게 생각했는데, 레디스는 흔히 ==NoSQL 데이터베이스==로 분류됩니다. NoSQL은 하나의 엄격한 규격이라기보다 관계형 모델과 SQL 중심이 아닌 여러 저장 방식을 묶어 부르는 넓은 표현입니다. Key-Value, 문서, 열 지향, 그래프 저장소 등이 여기에 포함되고, 레디스는 Key에 다양한 자료형의 Value를 연결하는 데이터 구조 서버에 가깝습니다.

여기서 중요한 건 NoSQL과 RDBMS가 ==우열 관계가 아니라 트레이드오프 관계==라는 점입니다. RDBMS도 인덱스 설계나 비정규화로 웬만한 속도 문제는 해결할 수 있지만, 그래도 특정 데이터 모델이나 극단적인 쓰기 처리량 앞에서는 한계가 뚜렷합니다. 반대로 레디스는 SQL 같은 강력한 질의 언어도 없고 트랜잭션 기능도 제한적입니다. 다음 표로 성격 차이를 정리해보겠습니다.

| 비교 기준 | RDBMS(MySQL 등) | 레디스 |
| --- | --- | --- |
| 데이터 위치 | 디스크 중심(+버퍼) | 메모리(RAM) 중심 |
| 질의 방식 | SQL | 자료형별 전용 명령어 |
| 강한 영역 | 트랜잭션, 조인, 정합성 | 응답 속도, 유연한 자료구조 |
| 스키마 | 사전 정의 필요 | 사실상 스키마리스 |
| 트랜잭션 | DBMS가 제공하는 ACID 트랜잭션 | 명령 묶음의 순차 실행과 낙관적 잠금, 롤백 없음 |

그래서 실제 서비스에서는 ==MySQL 같은 RDBMS를 원본 데이터로 두고, 자주 조회되는 결과만 레디스에 캐시로 올려두는 조합==을 사용할 수 있습니다. 클라이언트가 페이지를 열람하면 먼저 레디스를 조회하고, 캐시 히트면 저장된 값을 응답하고, 캐시 미스면 MySQL에서 가져와 레디스에 채운 뒤 응답하는 흐름입니다. 반복 쿼리는 줄어들지만, 실제 응답 시간은 네트워크와 데이터 크기, 명령 복잡도까지 측정해서 판단해야 합니다.

:::tip
레디스 앞에 반드시 MySQL이 있어야 하는 건 아닙니다. 아파치 HBase 같은 다른 영속성 계층과 조합하거나, 아파치 스파크와 묶어 빅데이터 실시간 스트림 처리에 쓰는 사례도 있습니다.
:::

## 🧱 레디스를 특별하게 만드는 것들

레디스가 단순 캐시와 구분되는 지점은 ==자료형의 다양성==입니다. 이 책에서 먼저 다루는 String, List, Hash, Set, Sorted Set 외에도 비트맵(Bitmap), 지리 공간 인덱스, HyperLogLog, Stream 등이 있습니다. 최신 Redis Open Source에는 JSON, 시계열, Vector Set 같은 자료형도 포함됩니다. 전체 목록은 [Redis 공식 자료형 문서](https://redis.io/docs/latest/develop/data-types/) 에서 확인할 수 있습니다. 예를 들어 소셜 게임의 실시간 랭킹은 Sorted Set으로 점수 순 정렬과 특정 사용자의 순위 조회를 처리할 수 있습니다. 각 자료형의 구체적인 사용법은 다음 글에서 직접 실습하며 다룹니다.

그 외에 레디스가 가진 특징을 정리하면 이렇습니다.

- ==데이터 영속성==: RDB Snapshot과 AOF(Append Only File)를 각각 사용하거나 조합할 수 있습니다. 반대로 캐시처럼 복구가 필요 없는 용도라면 영속성을 끌 수도 있습니다. 방식별 차이는 [Redis 영속성 문서](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) 에 정리되어 있습니다.
- ==레플리케이션과 클러스터==: 여러 노드로 데이터를 복제하고 분산시켜 확장성과 가용성을 확보합니다(7장, 8장에서 다룰 예정).
- ==클라이언트/서버 모델==: Client는 RESP(Redis Serialization Protocol)를 통해 명령을 보내고 응답을 받습니다. 여러 언어의 Client Library가 같은 명령과 Protocol을 각 언어에 맞게 감싸줍니다.
- ==서버 측 프로그래밍==: Lua Script나 Redis Function으로 여러 명령과 조건을 서버 안에서 실행할 수 있습니다. 실행 중 다른 Client의 명령이 끼어들지 않지만, 오래 실행되는 Script는 다른 요청까지 막을 수 있습니다.

## ⚙️ 싱글 스레드인데 왜 이렇게 빠를까?

여기서 궁금한 점이 하나 생깁니다. 레디스는 기본적으로 ==싱글 스레드==로 명령을 처리합니다. 그런데 왜 느리지 않고 오히려 빠르다고 할까요?

핵심은 ==이벤트 루프와 I/O Multiplexing==입니다. 여러 Client의 Socket을 기다리기 위해 Thread를 하나씩 붙잡아 두지 않고, 준비된 요청을 Event Loop에서 차례로 처리합니다. 대부분의 명령은 메모리에서 짧게 끝나므로 Thread 전환과 Lock 경합을 줄이는 구조가 잘 맞습니다. 다만 한 명령이 오래 걸리면 뒤의 요청도 함께 기다립니다. 큰 Key를 한꺼번에 다루거나 느린 명령을 실행할 때 주의해야 하는 이유입니다. [Redis 지연 시간 문서](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/) 에서도 이런 싱글 스레드 실행 특성과 느린 명령의 영향을 설명합니다.

“그럼 완전히 Thread 하나로만 다 처리하나요?” 정확히는 아닙니다. Redis는 일부 느린 I/O 작업을 Background Thread로 처리하고, Redis 4.0의 ??UNLINK??처럼 삭제를 비동기로 넘기는 명령도 제공합니다. Redis 6부터는 설정에 따라 Network I/O의 읽기와 쓰기를 Thread로 분산할 수 있지만, 일반적인 명령 실행은 여전히 Main Thread가 담당합니다. 그래서 ==Redis가 주로 싱글 스레드로 명령을 실행한다는 말과 프로세스에 Thread가 하나뿐이라는 말은 다릅니다.==

Lua Script도 비슷한 맥락입니다. Script가 실행되는 동안 다른 Client의 명령은 끼어들지 않습니다. Redis가 Script 실행을 원자적이라고 설명하는 이유도 이 ==중간 상태가 다른 Client에 노출되지 않는 실행 격리==에 있습니다. 하지만 RDBMS처럼 이전 상태로 되돌리는 Rollback은 없습니다. 실행 도중 오류가 나면 이미 반영된 쓰기가 남을 수 있으므로, “원자적”이라는 단어를 곧바로 “모두 성공하거나 모두 취소”로 해석하면 안 됩니다. [Redis Lua Script 문서](https://redis.io/docs/latest/develop/programmability/eval-intro/) 에서도 실행 중 다른 Server 활동이 차단되는 의미를 중심으로 설명합니다.

## 🆚 RDBMS·멤케시디와는 어떻게 다른가요

### RDBMS와의 관계

관계형 데이터베이스는 1969년 ==에드가 코드(Edgar F. Codd)==가 제안한 개념에서 출발했고, 그 영향으로 1974년 SQL이 등장했습니다. 반세기 가까이 다듬어진 만큼 RDBMS는 SQL이라는 강력한 표현 수단과 ACID(원자성·일관성·격리성·영속성) 특성을 갖추고 있습니다.

Redis의 기능을 ACID 표에 일대일로 대응시키면 오해하기 쉽습니다. 아래 표는 Redis가 RDBMS와 같은 보장을 제공한다는 뜻이 아니라, 비슷한 문제를 어떤 방식으로 다루는지 비교한 것입니다.

| ACID 요소 | RDBMS의 방법 | 레디스의 방법 |
| --- | --- | --- |
| 원자성 | Commit과 Rollback을 포함한 Transaction | 단일 명령, Lua Script, ??MULTI??/??EXEC??의 순차 실행(롤백 없음) |
| 일관성 | 제약조건과 Transaction으로 규칙 보호 | 자료형 명령과 Application Logic이 규칙을 책임짐 |
| 격리성 | 격리 수준으로 동시 실행을 제어 | 단일 명령은 순차 실행, 여러 명령은 Transaction이나 Script 필요 |
| 영속성 | WAL과 Commit Log | RDB와 AOF 설정에 따라 보장 수준이 달라짐 |

마지막 줄이 특히 실무에서 자주 부딪히는 지점입니다. AOF의 ??appendfsync?? 값을 ??always??로 두면 쓰기마다 디스크에 즉시 반영해 영속성이 강해지지만 성능이 크게 떨어지고, ??everysec??(매초 플러시)이나 ??no??(운영체제가 알아서 플러시)로 완화하면 성능은 좋아지는 대신 장애 시 짧은 구간의 데이터를 잃을 수 있습니다. RDB 스냅숏 방식도 마지막 스냅숏 이후의 변경분은 장애 시 사라질 수 있고요. ==“얼마만큼의 데이터 유실을 감수할 수 있는가”가 레디스 영속성 설정의 핵심 질문==인 셈입니다.

레디스는 RDBMS처럼 사전에 스키마를 정의하지 않아도 됩니다. 매일 요구사항이 바뀌는 서비스에는 장점이지만, 반대로 정합성을 스키마가 아니라 애플리케이션 코드가 책임져야 한다는 뜻이기도 합니다. 그래서 실전 레디스에서도 ==레디스가 RDBMS를 대체하는 게 아니라 서로 보완하는 관계==라고 못 박습니다. RDBMS의 조인 결과를 자주 재사용한다면 그 결과만 레디스에 캐싱하고, 랭킹처럼 정렬이 핵심인 데이터는 Sorted Set으로 옮기는 식으로 역할을 나누는 편이 현실적입니다.

### 멤케시디와의 관계

레디스와 가장 자주 비교되는 건 멤케시디입니다. 둘 다 인메모리 Key-Value 저장소라 얼핏 비슷해 보이지만, 멤케시디는 이름 그대로 캐시(Memory Cache)에 특화되어 기능이 단순하고, 레디스는 자료형과 영속성, 클러스터까지 갖춰 단독으로 주요 데이터베이스 역할까지 할 수 있습니다.

그렇다고 레디스가 멤케시디의 완전한 상위호환은 아닙니다. 멤케시디가 레디스보다 먼저 등장해 검증된 기간이 더 길고, 단순 캐시만 필요한 경우엔 오히려 멤케시디 쪽이 다루기 쉬울 수 있습니다. ==“복잡한 데이터 모델이 필요하면 레디스, 단순한 캐시만 필요하면 상황에 맞게 고른다”== 정도로 기준을 잡으면 됩니다.

## 🧑‍💻 레디스는 어쩌다 태어났을까

레디스의 시작은 ==살바토레 산필리포(Salvatore Sanfilippo)==가 만든 실시간 웹사이트 분석 서비스 ==LLOOGG==로 거슬러 올라갑니다. LLOOGG는 원래 MySQL 기반이었는데, 사용자가 늘면서 처리 부하를 감당하지 못하는 상황이 반복됐습니다. 산필리포는 이 문제를 풀기 위해 2009년부터 개선 작업을 시작했고, 그 과정에서 만든 저장소가 독립된 프로젝트로 떨어져 나온 게 레디스입니다. 2009년 5월 레디스가 정식 출시됐고, 그다음 달 LLOOGG도 레디스 기반으로 완전히 갈아탔습니다.

책에서 개인적으로 흥미로웠던 부분은 2020년 6월, 산필리포가 Maintainer 역할에서 물러나고 소수의 Core Team이 결정을 나누는 ==Light Governance Model==이 발표된 과정이었습니다. 다만 이 내용을 지금도 그대로인 운영 체계로 받아들이면 안 됩니다. Redis는 2024년 License를 변경했고, 산필리포는 같은 해 11월 Redis에 다시 합류했습니다. 2025년에는 Redis 8부터 AGPLv3를 추가했습니다. [Redis의 AGPLv3 발표](https://redis.io/blog/agplv3/) 를 보면 책 출간 이후의 변화를 확인할 수 있습니다. 하나의 개인 프로젝트가 성장한 뒤에도 Governance와 License가 계속 바뀐다는 점이 오히려 Open Source 의존성을 선택할 때 함께 봐야 할 운영 비용이라고 생각합니다.

## 🛠️ 직접 설치하고 실행해보기

이제 개념은 충분히 잡았으니 Ubuntu에서 직접 설치해보겠습니다. 여기서는 개인 PPA나 특정 구버전 Tarball 대신 [Redis 공식 APT 저장소](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/) 를 사용합니다.

```bash
sudo apt-get update
sudo apt-get install lsb-release curl gpg -y
curl -fsSL https://packages.redis.io/gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis -y
redis-server --version
```

```text
Redis server v=8.x.x ...
```

버전의 세부 값은 설치 시점의 공식 Package에 따라 달라질 수 있습니다. 중요한 것은 출력에 Version이 나타나 설치가 완료됐는지 확인하는 것입니다.

설치가 끝났으면 Service를 시작하고 상태를 확인합니다.

```bash
sudo systemctl enable --now redis-server
sudo systemctl status redis-server --no-pager
```

```text
Active: active (running)
```

??active (running)??이 보이면 Server가 실행 중입니다. 기본 Port는 ??6379??입니다. 이제 ??redis-cli??로 접속합니다.

```bash
redis-cli
```

```text
127.0.0.1:6379>
```

접속이 잘 됐다면 ??PING?? 명령으로 서버가 살아있는지 확인해볼 수 있습니다.

```text
127.0.0.1:6379> PING
PONG
```

정상이면 ??PONG??이 돌아옵니다. 이제 값을 하나 저장하고 꺼내보겠습니다.

```text
127.0.0.1:6379> SET foo bar
OK
127.0.0.1:6379> GET foo
"bar"
```

??SET??과 ??GET?? 두 명령만으로 벌써 Key-Value 저장소의 가장 기본적인 동작을 확인한 셈입니다. 인터랙티브 모드 말고 명령어를 바로 실행하는 방식도 있습니다.

```bash
redis-cli set mykey "foo"
redis-cli get mykey
```

실습을 마치고 Package로 실행한 Service를 중지하려면 다음 명령을 사용합니다.

```bash
sudo systemctl stop redis-server
```

:::warning
??redis-cli??가 접속되지 않는다면 Service 상태 → Port 연결 → Redis 응답 순서로 확인합니다. ??systemctl status redis-server??로 Process를 보고, ??nc -vz <host> 6379??로 TCP 연결을 확인한 다음, 연결되면 ??redis-cli PING??을 실행합니다. 원격 환경에서는 Firewall과 Security Group도 함께 확인해야 합니다.
:::

## 🔒 원격에서 접속하려면 조심할 점

다른 Server의 Redis에 접속할 때는 ??redis-cli -h <endpoint>??처럼 Host를 지정합니다. 그런데 기본 설정의 Redis를 그대로 외부에 노출하면 안 됩니다. Redis 3.2부터 도입된 ==보호모드(Protected Mode)==는 모든 Interface에 Bind되어 있고 인증도 없는 기본 구성에서 Loopback 이외의 요청을 거부하는 안전장치입니다.

제가 실제로 원격 접속을 구성한다면 다음 경계를 함께 확인하겠습니다.

1. ??bind??로 필요한 Private Interface만 수신합니다.
2. Firewall이나 Security Group으로 허용된 Application만 ??6379?? Port에 접근하게 합니다.
3. Redis 6 이상에서는 단일 Password인 ??requirepass??보다 사용자별 명령과 Key 권한을 나눌 수 있는 ACL을 우선 검토합니다.
4. 신뢰할 수 없는 Network를 통과한다면 TLS나 별도의 Private Network를 사용합니다.

??bind??와 인증은 무조건 함께 써야만 Server가 동작하는 필수 Pair는 아닙니다. 하지만 !!원인을 이해하지 않은 채 bind 범위를 모든 Interface로 넓히고 protected-mode만 끄는 것은 위험합니다.!! 인증이 있더라도 Redis Port를 Public Internet에 직접 노출하는 설계는 피해야 합니다. 자세한 동작은 [Redis 보안 문서](https://redis.io/docs/latest/operate/oss_and_stack/management/security/) 에서 확인할 수 있습니다.

## 😮‍💨 마무리

1장을 정리하면 이렇습니다.

- 레디스는 캐시 전용 도구가 아니라 다양한 자료형과 영속성 기능을 갖춘 인메모리 데이터 구조 저장소입니다.
- RDBMS를 대체하기보다 보완하는 관계이며, 실무에서는 원본 데이터는 RDBMS에, 자주 조회되는 결과나 랭킹 같은 데이터는 레디스에 두는 조합이 흔합니다.
- 명령은 주로 Main Thread에서 순차 실행되지만, Background 작업과 Network I/O에는 다른 Thread가 사용될 수 있습니다.
- 단일 명령과 Script, Transaction의 실행 중에는 다른 명령이 끼어들지 않지만 RDBMS 같은 Rollback은 지원하지 않습니다.
- 보호모드는 기본 안전장치일 뿐이며, 원격 환경에서는 Network 경계와 ACL, 암호화까지 함께 설계해야 합니다.

결국 1장에서 얻어야 할 판단 기준은 ==Redis를 “빠른 캐시” 하나로만 보지 않고, 자료형과 접근 패턴에 맞춰 역할을 정하는 것==입니다. 다음 글에서는 이 책의 2장을 기준으로 String, List, Hash, Set, Sorted Set 다섯 가지 자료형을 하나씩 직접 실습하며 살펴보겠습니다.

:::book[이 글의 출발점]
하야시 쇼고, [『실전 레디스』](https://product.kyobobook.co.kr/detail/S000213285446)

서대원 옮김 · 정경석 감수 · 한빛미디어 · 2024

이 글은 책을 읽으며 제가 이해한 내용을 바탕으로, 예시와 설명을 새롭게 구성해 정리했습니다.
:::
