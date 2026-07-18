---
title: "[Python] 정규화 라이브러리 re 사용법"
image: /images/python.png
published: 2026-03-15T00:00:00.000Z
description: re 라이브러리를 사용하는 방법을 문제를 통해서 학습합니다.
tags:
    - Regex
    - re
category: Python
draft: false
postId: 20
---

## 🍠 파이썬 필수 라이브러리 re란?
개발을 진행하다보면, 특정 패턴을 추출해야하는 경우가 있습니다. 이런 패턴들은 반복되는 경우가 많은데, 이럴 때 바로 re 라이브러리를 사용하면 효과적으로 일을 처리할 수 있습니다. 하지만 모든 코딩이 그러하듯, 아래에 표만 외운다고 re 라이브러리를 쉽게 사용할 수는 없습니다. 다양한 예시들을 통해서 여러번 반복하고, 직접 예시에 적용시켜서 풀어봐야 제대로 사용할 수 있게 됩니다. 따라서 이번 포스팅에서는 효율적인 re 라이브러리 사용 방법에 대해서 알아보도록 하겠습니다. 단순한 이론보다는 직접 문제를 하나씩 풀어보면서 기능을 익혀나가봅시다!

## 🐲 re의 기본 문법
| 기호 | 설명 | 예시 |
| :--- | :--- | :--- |
| `.` | 모든 문자 (줄바꿈 제외 한 글자) | `a.b` → aab, a1b, a*b |
| `*` | 0번 이상 반복 | `lo*l` → ll, lol, loool |
| `+` | 1번 이상 반복 | `lo+l` → lol, loool (ll은 불가) |
| `?` | 0번 또는 1번 (있거나 없거나) | `apple?` → appl, apple |
| `^` | 문자열의 시작 | `^Hello` |
| `$` | 문자열의 끝 | `world$` |
| `\d` | 숫자 (Digit) | `\d{3}` → 010, 123 |
| `\w` | 문자 + 숫자 + _(언더바) (Word) | 아이디, 변수명 찾기 유용 |
| `[]` | 문자 집합 중 하나 | `[a-z]` (소문자), `[0-9]` (숫자) |
:::tip
이 문법은 모두 외울 수 없기에 하나의 예제를 풀때마다 하나씩 적용시키면 금방 익숙해질 수 있습니다.
:::

## 🖼️ 기본적인 문법


## 🛺 문제 1번
다음은 서버의 접속 로그 기록입니다. 이 데이터에는 사용자의 이메일 주소와 전화번호가 포함되어 있습니다. 보안을 위해 re 라이브러리를 사용하여 다음 조건에 맞게 데이터를 변경하는 함수를 작성하세요.

```bash
log_data = """
user_id: 102, email: python_master@gmail.com, phone: 010-1234-5678, access_time: 2023-10-27
user_id: 103, email: regex_hero@naver.com, phone: 010-9876-5432, access_time: 2023-10-28
user_id: 104, email: dev_user@daum.net, phone: 010-1111-2222, access_time: 2023-10-29
"""
```

:::important

[조건 1번] 이메일 비식별화: 이메일 아이디의 앞 3글자만 남기고 나머지는 *로 마스킹하세요. (단, 도메인 부분인 @gmail.com 등은 그대로 유지해야 합니다.)

예: python_master@gmail.com -> pyt***********@gmail.com

[조건 2번] 전화번호 비식별화: 전화번호의 중간 번호(4자리)를 ****로 변경하세요. 이때 반드시 전방 탐색(Lookahead) 또는 후방 탐색(Lookbehind) 원리를 활용하여 010- 바로 뒤의 숫자만 골라내어 변경해 보세요.

예: 010-1234-5678 -> 010-****-5678
:::

위의 문제를 풀이하는 방법은 다음과 같습니다. 저는 repl을 함수로 사용했는데 더 간단한 방법이 있더라구요.


### 1️⃣ 문제 풀이
```bash
# 조건 1. 이메일 비식별화
email_pattern = r'(email: \w{3})(.*)(@)' # email: 로 시작(1) / 가운데 부분(2) / @ 앞에 부분(3)
def change_email(match):
    return match.group(1) + "*"*len(match.group(2)) + match.group(3)
first = re.sub(pattern=email_pattern,
               repl=change_email,
               string=log_data)

# 조건 2. 전화번호 비식별화
phone_pattern = r'(\w{3}-)(\w{4})(-\w{4})' # 010-(1) / 가운데 부분(2) / 끝 번호(3)
def change_phone(match):
    return match.group(1) + "*"*len(match.group(2)) + match.group(3)
print(re.sub(pattern=phone_pattern,
                 repl=change_phone,
                 string=first))
```
### 2️⃣ 더 쉬운 방법
이 문제를 풀기 전에 전후방탐색(Lookaround)를 사용해서 풀면 함수를 사용하지 않고도 쉽게 풀 수 있습니다.
```bash
first = re.sub(r'(?<=email: .{3})[^@]+(?=@)', '*******', log_data)
second = re.sub(r'(?<=010-)\d{4}+', '****', first)
```
`?=`부분이 전방탐색입니다. 만약 10,000원이라는 텍스트에서 숫자만 추출하고 싶다면 `\d+(?=원)` 이렇게 사용하면 됩니다. 

`?<=`부분이 후방탐색입니다. 만약 $500에서 $가 붙은 숫자만 찾고 싶을 때 `(?<=\$)\d+` 이렇게 사용하면 되죠.

## ⏲️ 문제 2번
다음은 시스템 설정 파일의 일부입니다. 보안을 위해 특정 키의 값들을 마스킹해야 합니다.
```bash
import re

raw_config = "ID=user123; PASS=pwd1234; METADATA=[TYPE=ADMIN; LEVEL=5; DEPT=IT]; STATUS=ACTIVE;"
```

:::important
전후방 탐색 사용: PASS= 뒤에 오는 값과 METADATA 내부의 LEVEL= 뒤에 오는 값을 찾아 masked로 변경하세요.

함수 미사용: re.sub()의 repl 인자에 함수를 쓰지 않고, 단순 문자열 "masked"만 사용하여 치환하세요. (즉, 전후방 탐색으로 '값' 부분만 정확히 매칭해야 합니다.)

값의 범위: 각 값은 세미콜론(;)이나 닫는 대괄호(])가 나오기 전까지의 문자열로 간주합니다.
:::

### 1️⃣ 문제 풀이
```bash
import re

raw_config = "ID=user123; PASS=pwd1234; METADATA=[TYPE=ADMIN; LEVEL=5; DEPT=IT]; STATUS=ACTIVE;"

first = re.sub(r'(?<=PASS=)\w+', "masked", raw_config)
second = re.sub(r'(?<=LEVEL=)\d', 'masked', first)
print(second)
```

## 🌩️ 마무리
지금까지 re 활용법에 대해서 알아봤습니다. 추가적으로 설명할 부분이 있다면 또 다른 문제를 만들어서 포스팅하도록 하겠습니다. 위의 예제만 잘 사용할 수 있다면 정규식을 이용하는 과정은 어렵지 않을겁니다.