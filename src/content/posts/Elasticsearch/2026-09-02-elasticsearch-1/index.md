---
title: '[Elasticsearch] 데이터가 많은데도 검색은 왜 빠를까?'
image: /images/elastic.png
published: 2026-09-02T00:00:00.000Z
description: '관계형 데이터베이스의 검색과 Elasticsearch가 무엇이 다른지, 역색인과 Analyzer의 원리를 직접 실습하며 알아봅니다.'
tags:
  - Elasticsearch
  - Search Engine
  - Inverted Index
category: Elasticsearch
series: devops
seriesOrder: 11
draft: false
postId: 38
---

## 🔎 들어가기에 앞서

쇼핑몰에서 상품 이름을 검색한다고 생각해보겠습니다. 데이터가 몇백 개뿐이라면 데이터베이스에서 문자열을 비교해도 금방 결과가 나옵니다. 그런데 상품이 수천만 개로 늘어나고, 사용자가 “가벼운 러닝화”라고 검색했을 때 제목뿐 아니라 설명과 태그까지 찾아야 한다면 어떨까요?

단순히 같은 문자가 들어 있는 행을 찾는 것만으로는 부족합니다. “러닝화”가 들어간 상품 중 어떤 것을 먼저 보여줄지 정해야 하고, 대소문자나 단어 형태가 달라도 같은 의미로 취급해야 할 수 있습니다. 검색어 자동 완성, 오타 허용, 인기 브랜드 필터, 가격대별 집계까지 붙으면 검색은 어느새 데이터베이스의 부가 기능이 아니라 하나의 시스템이 됩니다.

저도 처음에는 Elasticsearch를 “검색이 빠른 데이터베이스” 정도로 생각했습니다. 그런데 공부해보니 출발점부터 조금 다른 친구였습니다. ==Elasticsearch는 데이터를 저장하는 것보다, 저장할 때부터 어떻게 찾을지를 준비하는 데 중심을 둔 분산 검색·분석 엔진==입니다.

이번 글에서는 Elasticsearch가 왜 필요한지, 빠른 전문 검색(Full-text Search)을 만드는 역색인(Inverted Index)이 무엇인지 알아보겠습니다. 마지막에는 로컬에 직접 실행해서 상품을 저장하고 검색 결과의 점수까지 확인해보겠습니다.

## 🤔 그냥 데이터베이스에서 찾으면 안 될까?

물론 찾을 수 있습니다. 상품 테이블의 이름에서 “러닝화”가 포함된 행을 찾는 정도라면 다음과 같은 SQL부터 떠올릴 수 있습니다.

```sql
SELECT *
FROM products
WHERE name LIKE '%러닝화%';
```

작은 서비스에서는 이 방식이 오히려 단순하고 충분합니다. 문제는 앞에 붙은 와일드카드 때문에 일반적인 B-Tree 인덱스를 효율적으로 사용하기 어렵고, 검색다운 요구사항이 계속 늘어난다는 점입니다.

“그냥 SQL을 잘 짜면 되는 것 아닐까요?” 예.. 저도 이 부분이 가장 궁금했습니다. 정확히 일치하는 ID 조회나 범위 검색은 관계형 데이터베이스가 아주 잘합니다. 하지만 문장을 단어로 나누고, 관련도를 계산하고, 여러 필드의 검색 결과를 합치는 일은 별도의 검색 자료구조가 더 잘 맞습니다.

| 비교 기준 | 관계형 데이터베이스 | Elasticsearch |
| --- | --- | --- |
| 기본 저장 단위 | 행(Row) | JSON 문서(Document) |
| 강한 영역 | 트랜잭션, 조인, 정확한 조건 조회 | 전문 검색, 관련도 정렬, 집계 |
| 대표 자료구조 | B-Tree 계열 인덱스 | 역색인 |
| 스키마 표현 | 테이블과 컬럼 타입 | 인덱스와 매핑 |
| 일관성 관점 | 원본 데이터와 트랜잭션에 적합 | 검색 가능한 시점에 짧은 지연이 있는 Near Real-time |

:::important
Elasticsearch가 관계형 데이터베이스를 대체한다는 뜻은 아닙니다. 주문과 결제의 원본은 트랜잭션을 보장하는 데이터베이스에 두고, 검색에 필요한 데이터를 Elasticsearch로 동기화하는 구성이 흔합니다.
:::

검색 요구사항이 단순하고 데이터도 적다면 별도의 Elasticsearch Cluster는 운영 비용만 늘릴 수 있습니다. 반대로 검색 결과의 관련도, 필터와 집계, 대량의 로그 분석이 핵심 기능이라면 도입할 이유가 생깁니다.

## 📚 Elasticsearch의 저장 단위 이해하기

처음 접하면 Index라는 단어부터 헷갈립니다. 관계형 데이터베이스의 보조 인덱스를 떠올리기 쉬운데, Elasticsearch의 Index는 ==서로 관련된 JSON 문서를 모아둔 논리적인 저장 공간==입니다.

상품 검색을 예로 들면 다음처럼 대응할 수 있습니다.

| Elasticsearch 용어 | 상품 검색에서의 예 | 역할 |
| --- | --- | --- |
| Index | products | 상품 문서가 모이는 공간 |
| Document | 상품 한 개 | JSON 형태로 저장되는 데이터 한 건 |
| Field | name, category, price | 문서를 구성하는 속성 |
| Mapping | name은 text, price는 integer | Field의 타입과 색인 방법을 정의 |
| Shard | products의 일부 | Index를 나누어 저장하고 처리하는 단위 |
| Replica | Shard의 복사본 | 장애 대응과 읽기 처리량을 보완 |

Document는 다음과 같은 JSON 객체입니다.

```json title="product.json"
{
  "name": "가벼운 러닝화",
  "description": "매일 달리기 좋은 쿠션 러닝화",
  "category": "shoes",
  "price": 89000
}
```

Mapping은 각 Field를 어떻게 다룰지 정합니다. ++name++과 ++description++은 문장을 단어 단위로 검색해야 하므로 text, ++category++는 정확히 일치하는 값으로 필터링하므로 keyword, ++price++는 범위 비교를 위해 integer가 어울립니다.

여기서 text와 keyword의 차이는 꼭 기억해야 합니다.

- text는 Analyzer가 값을 여러 Token으로 나누어 전문 검색에 사용합니다.
- keyword는 값을 하나의 완전한 값으로 다루어 정확한 일치, 정렬, 집계에 사용합니다.

사람 이름이나 상품 이름처럼 “검색도 하고 정렬도 하고 싶은 값”은 하나의 Field를 text와 keyword 두 방식으로 색인하는 Multi-field를 사용할 수 있습니다. 같은 값을 목적에 맞는 두 서랍에 넣어두는 셈입니다.

## 🔄 책 뒤의 색인처럼 거꾸로 저장한다

Elasticsearch의 빠른 전문 검색을 이해하려면 역색인부터 봐야 합니다. 일반적인 문서는 “문서 A에 어떤 단어가 있는가?”라는 방향으로 읽습니다.

```text
문서 1 → 가벼운, 러닝화
문서 2 → 편안한, 운동화
문서 3 → 가벼운, 등산화
```

역색인은 이 관계를 뒤집습니다.

```text
가벼운 → 문서 1, 문서 3
러닝화 → 문서 1
편안한 → 문서 2
운동화 → 문서 2
등산화 → 문서 3
```

사용자가 “러닝화”를 검색하면 모든 문서를 처음부터 훑을 필요가 없습니다. 러닝화라는 단어의 목록을 찾아 연결된 문서로 바로 이동하면 됩니다. 책 맨 뒤에서 “역색인”이라는 단어가 등장하는 페이지를 찾는 모습과 비슷합니다.

다만 실제 내부 구조는 위 표보다 훨씬 복잡합니다. 각 단어가 등장한 문서뿐 아니라 빈도와 위치 같은 정보도 저장할 수 있고, Apache Lucene이 이를 Segment 단위의 자료구조로 관리합니다. Elasticsearch의 각 Shard는 그 자체로 하나의 Lucene Index입니다.

### Analyzer는 문장을 어떻게 단어로 바꿀까?

문장을 덜렁 역색인에 넣을 수는 없습니다. “Running-Shoes”와 “running shoes”를 전혀 다른 값으로 저장하면 사용자가 기대한 결과를 놓칠 수 있기 때문입니다. 이때 문장을 검색 가능한 Token으로 바꾸는 규칙 묶음이 Analyzer입니다.

Analyzer는 대체로 다음 순서로 동작합니다.

```text
Character Filter → Tokenizer → Token Filter
```

1. Character Filter가 HTML 제거처럼 원문을 먼저 정리합니다.
2. Tokenizer가 문장을 작은 Token으로 나눕니다.
3. Token Filter가 소문자 변환, 불용어 제거 같은 후처리를 합니다.

Elasticsearch는 text Field를 저장할 때와 검색할 때 모두 분석합니다. 보통 두 시점에 같은 Analyzer를 사용해야 저장된 Token과 검색어의 Token이 같은 형태로 만납니다.

:::warning
기본 Standard Analyzer만으로 모든 언어가 기대한 형태로 분석되지는 않습니다. 특히 한국어의 조사, 복합어, 활용형까지 제대로 다루려면 Nori 같은 한국어 형태소 분석기를 검토해야 합니다. 첫 글에서는 Analyzer의 원리와 기본 검색 흐름에 집중하겠습니다.
:::

## 🐳 로컬에서 직접 실행해보자

Docker Compose가 설치된 환경에서 Elastic이 제공하는 [로컬 설치 스크립트](https://www.elastic.co/docs/deploy-manage/deploy/self-managed/local-development-installation-quickstart) 를 사용하겠습니다. 이 구성은 Elasticsearch와 Kibana를 함께 실행하며, Elasticsearch는 ??9200??, Kibana는 ??5601?? Port를 사용합니다.

```bash
curl -fsSL https://elastic.co/start-local | sh
```

설치가 끝나면 생성된 디렉터리로 이동합니다. 디렉터리 이름은 스크립트가 출력한 안내를 따릅니다. 환경 파일에 저장된 비밀번호와 API Key는 외부에 공개하면 안 됩니다.

```bash
cd elastic-start-local
source .env
curl "$ES_LOCAL_URL" \
  -H "Authorization: ApiKey $ES_LOCAL_API_KEY"
```

Cluster 이름과 Elasticsearch 버전이 담긴 JSON이 돌아오면 준비가 끝났습니다.

:::warning
이 설치 방식은 로컬 학습과 개발을 위한 구성입니다. 공식 문서도 !!운영 환경에서 사용하지 말라고 명시!!하고 있습니다. 운영에서는 TLS, 인증 정보, 영속 Volume, 메모리, 다중 Node와 장애 복구 전략을 별도로 설계해야 합니다.
:::

### 1. Mapping과 함께 Index를 만든다

이제 products Index를 만듭니다. 상품 이름은 검색과 정렬을 모두 할 수 있도록 text 아래에 keyword Multi-field를 추가하겠습니다.

```bash
curl -X PUT "$ES_LOCAL_URL/products" \
  -H "Authorization: ApiKey $ES_LOCAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": {
      "properties": {
        "name": {
          "type": "text",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "description": { "type": "text" },
        "category": { "type": "keyword" },
        "price": { "type": "integer" }
      }
    }
  }'
```

다음 응답의 ??acknowledged??가 true라면 Index가 생성된 것입니다.

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "products"
}
```

Mapping 없이 Document부터 넣으면 Dynamic Mapping이 타입을 추론해줍니다. 편해 보이지만 날짜가 text로 잡히거나 ID가 숫자로 잡히는 등 의도와 다른 타입이 굳어질 수 있습니다. 저는 실습이 아닌 서비스라면 검색과 집계 방식을 먼저 정하고 주요 Field의 Mapping을 명시하는 편이 안전하다고 생각합니다.

### 2. 상품 Document를 저장한다

같은 Index에 세 상품을 넣어보겠습니다. ??_doc/1??의 1은 Document ID입니다.

```bash
curl -X PUT "$ES_LOCAL_URL/products/_doc/1?refresh=wait_for" \
  -H "Authorization: ApiKey $ES_LOCAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "가벼운 러닝화",
    "description": "매일 달리기 좋은 쿠션 러닝화",
    "category": "shoes",
    "price": 89000
  }'

curl -X PUT "$ES_LOCAL_URL/products/_doc/2?refresh=wait_for" \
  -H "Authorization: ApiKey $ES_LOCAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "편안한 운동화",
    "description": "출퇴근과 산책에 어울리는 데일리 운동화",
    "category": "shoes",
    "price": 69000
  }'

curl -X PUT "$ES_LOCAL_URL/products/_doc/3?refresh=wait_for" \
  -H "Authorization: ApiKey $ES_LOCAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "가벼운 등산 가방",
    "description": "당일 산행에 적합한 소형 가방",
    "category": "bags",
    "price": 79000
  }'
```

Elasticsearch는 Near Real-time 검색 엔진이라 Document를 저장한 직후 검색에 보이기까지 Refresh 주기의 영향을 받습니다. 실습에서는 결과를 바로 확인하기 위해 ??refresh=wait_for??를 붙여 다음 Refresh까지 요청이 기다리게 했습니다. 운영의 모든 색인 요청에 무작정 붙이면 처리량과 응답 시간이 나빠질 수 있습니다.

### 3. match Query로 검색한다

이제 name에서 “가벼운 러닝화”를 검색합니다. match Query는 입력 문자열을 분석한 뒤 text Field의 Token과 비교하는 대표적인 전문 검색 Query입니다.

```bash
curl -X GET "$ES_LOCAL_URL/products/_search?pretty" \
  -H "Authorization: ApiKey $ES_LOCAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "match": {
        "name": "가벼운 러닝화"
      }
    }
  }'
```

응답의 핵심만 줄이면 다음과 비슷합니다. 실제 ??_score?? 값은 Elasticsearch 버전과 데이터 상태에 따라 달라질 수 있습니다.

```json
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "hits": [
      {
        "_id": "1",
        "_score": 1.0,
        "_source": { "name": "가벼운 러닝화" }
      },
      {
        "_id": "3",
        "_score": 0.4,
        "_source": { "name": "가벼운 등산 가방" }
      }
    ]
  }
}
```

왜 문서 3도 나왔을까요? match Query의 기본 Operator가 OR이므로 분석된 Token 중 “가벼운”만 일치해도 후보가 될 수 있기 때문입니다. 대신 “가벼운”과 “러닝화”가 모두 일치한 문서 1의 관련도 점수가 더 높습니다.

두 단어가 모두 들어간 상품만 원한다면 Operator를 AND로 바꿀 수 있습니다.

```bash
curl -X GET "$ES_LOCAL_URL/products/_search?pretty" \
  -H "Authorization: ApiKey $ES_LOCAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "match": {
        "name": {
          "query": "가벼운 러닝화",
          "operator": "and"
        }
      }
    }
  }'
```

### 4. 정확한 값은 term Query로 찾는다

이번에는 category가 정확히 shoes인 상품만 찾겠습니다.

```bash
curl -X GET "$ES_LOCAL_URL/products/_search?pretty" \
  -H "Authorization: ApiKey $ES_LOCAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "term": {
        "category": "shoes"
      }
    }
  }'
```

term Query는 검색어를 분석하지 않고 정확한 Term을 찾습니다. 그래서 category처럼 keyword로 Mapping한 Field에 잘 맞습니다. 반대로 분석되는 text Field에 term Query를 사용하면 눈으로 보기에는 같은 단어인데도 결과가 나오지 않는 실수를 하기 쉽습니다.

==문장을 의미 있게 찾을 때는 text와 match, 코드·상태·카테고리처럼 정확한 값을 찾을 때는 keyword와 term==이라고 먼저 구분하면 편합니다.

## ⚖️ Elasticsearch를 언제 써야 할까?

Elasticsearch는 검색창이 있다고 무조건 필요한 도구가 아닙니다. 저는 다음 질문으로 먼저 나누는 편이 좋다고 생각합니다.

- 사용자가 문장을 입력하고 관련도순 결과를 기대하는가?
- 여러 Field를 동시에 검색하고 필터와 집계를 함께 수행하는가?
- 로그나 이벤트처럼 많은 JSON 데이터를 빠르게 탐색해야 하는가?
- 오타 허용, 동의어, 자동 완성 같은 검색 품질 기능이 중요한가?
- 검색 부하를 원본 데이터베이스와 분리해야 하는가?

여러 항목이 해당된다면 Elasticsearch가 강점을 보일 가능성이 큽니다. 하지만 정확한 ID 조회가 대부분이고 데이터가 작다면 데이터베이스의 전문 검색 기능이나 더 단순한 검색 라이브러리부터 검토해도 됩니다.

그리고 Elasticsearch를 보조 검색 저장소로 두는 순간 새로운 문제가 생깁니다. 원본 데이터베이스의 변경을 어떻게 전달할지, 동기화가 실패하면 어떻게 복구할지, Mapping을 바꿀 때 기존 Document를 어떻게 다시 색인할지 정해야 합니다. 빠른 검색을 얻는 대신 ==동기화와 Cluster 운영이라는 비용==을 함께 받는 셈입니다.

## 😮‍💨 마무리

처음에는 Elasticsearch가 데이터를 메모리에 전부 올려서 빠른 줄 알았습니다. 핵심은 무작정 빨리 읽는 것이 아니라, Document를 저장할 때 Analyzer로 Token을 만들고 역색인을 준비해 검색 방향을 바꾸는 데 있었습니다.

- Elasticsearch는 JSON Document를 저장하고 검색하는 분산 검색·분석 엔진입니다.
- Index는 Document의 논리적인 모음이고, Mapping은 각 Field의 타입과 색인 방식을 정합니다.
- 역색인은 “문서에 어떤 단어가 있는가”를 “이 단어가 어떤 문서에 있는가”로 뒤집습니다.
- text와 match는 전문 검색에, keyword와 term은 정확한 값의 검색에 어울립니다.
- 관계형 데이터베이스를 무조건 대체하지 않으며, 검색용 사본을 운영하는 비용도 고려해야 합니다.

결국 Elasticsearch의 도입 기준은 ==데이터가 많다는 사실 자체보다, 사용자가 기대하는 검색 경험을 기존 저장소만으로 감당할 수 있는가==입니다.

다음 글에서는 Analyzer API로 문장이 실제로 어떤 Token으로 쪼개지는지 확인하고, Nori 형태소 분석기로 한국어 검색이 왜 달라지는지 알아보겠습니다.
