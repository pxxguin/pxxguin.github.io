---
title: Review with StepWiser, Stepwise Generative Judges for Wiser Reasoning
published: 2025-11-29
description: StepWiser, Stepwise Generative Judges for Wiser Reasoning에 대한 논문 리뷰입니다.
tags: [Paper, NLP, LLM]
category: Paper
draft: true
---

### 🤦🏻‍♂️ 들어가기에 앞서...

<video controls width="100%">
  <source src="/videos/2025-11-29/stepwiser_video.mp4" type="video/mp4">
</video>

### 1\. 논문 Abstract 요약

이 논문은 복잡한 문제를 해결하기 위한 모델의 다단계 추론(Multi-step reasoning) 과정을 감독하는 새로운 방법론인 **STEPWISER**를 제안합니다. [cite\_start]++기존의 과정 보상 모델++(Process Reward Models, PRMs)은 단순히 분류기(classifier)로서 작동하며 설명이 부족하고 정적인 데이터셋에 의존하여 일반화에 한계가 있었습니다[cite: 9, 10]. [cite\_start]저자들은 단계별 보상 모델링을 분류 작업이 아닌 \*\*추론 작업(meta-reasoning)\*\*으로 재정의하여, 판단을 내리기 전에 '생각하는 토큰(thinking tokens)'을 생성하는 ??생성형 심판??(Generative Judge) 모델을 제안합니다[cite: 10, 11]. [cite\_start]이 모델은 강화학습(RL)을 통해 훈련되며, 기존 방법보다 높은 판단 정확도를 보이고 정책 모델(Policy model)의 성능을 훈련 및 추론 단계에서 모두 향상시킬 수 있음을 입증했습니다[cite: 13, 14].

-----

### 2\. 논문이 제기한 문제상황

기존의 LLM 추론 과정을 평가하고 감독하는 방식에는 다음과 같은 핵심적인 한계가 존재했습니다:

  * [cite\_start]**블랙박스 분류기:** 기존 PRM은 추론 단계가 올바른지 그른지에 대한 점수나 라벨만 제공할 뿐, "왜" 그런지에 대한 설명은 제공하지 못했습니다[cite: 19].
  * [cite\_start]**정적 데이터의 한계:** 지도 미세 조정(SFT)에 의존하는 기존 방식은 고정된 데이터셋을 사용하므로 새로운 추론 패턴에 대한 일반화 능력이 떨어집니다[cite: 20].
  * [cite\_start]**희소한 보상 신호:** 결과 중심의 보상 모델(Outcome Reward Models)은 최종 정답에만 의존하므로 중간 단계에 대한 피드백이 희소(sparse)합니다[cite: 18].

-----

### 3\. 논문이 제안하는 해결책과 핵심 아이디어

[cite\_start]논문은 **STEPWISER**라는 단계별 생성형 심판 모델을 구축하기 위해 세 가지 핵심 구성 요소를 제안합니다[cite: 23, 108]:

1.  **CoT 자체 분할 (Self-Segmentation):**

      * [cite\_start]기존의 줄바꿈(\\n\\n) 기반 분할 대신, 모델이 논리적으로 완결된 단위인 \*\*'생각의 청크(Chunks-of-Thought)'\*\*로 자신의 추론 과정을 스스로 분할하도록 훈련합니다[cite: 23, 140]. 이를 통해 심판 모델이 평가하기 적절한 문맥을 제공합니다.

2.  **롤아웃의 상대적 결과를 이용한 라벨링 (Stepwise Data Annotation):**

      * 각 청크(단계)의 품질을 평가하기 위해 몬테카를로(Monte-Carlo) 롤아웃을 수행합니다. [cite\_start]특정 단계 이전과 이후의 성공률(Q-value) 변화를 비교하여 해당 단계가 성공 확률을 높였는지 낮췄는지를 기준으로 \*\*상대적인 보상 라벨(Positive/Negative)\*\*을 생성합니다[cite: 24, 161, 172].

3.  **RL을 통한 온라인 학습 (Training via RL):**

      * [cite\_start]생성된 라벨을 바탕으로 심판 모델을 **강화학습(RL)**, 구체적으로 GRPO 알고리즘을 사용하여 훈련합니다[cite: 214].
      * [cite\_start]심판 모델은 단순히 O/X를 맞추는 것이 아니라, 먼저 해당 단계에 대해 \*\*분석(CoT)\*\*을 수행한 후 최종 판결을 내리도록 학습됩니다[cite: 25, 199].

-----

### 4\. 논문이 제안한 것을 구현하기 위한 실험 설계 과정 및 방식

[cite\_start]저자들은 제안된 방법론을 검증하기 위해 다음 세 가지 차원에서 포괄적인 평가를 수행했습니다[cite: 27]:

  * **심판 정확도 평가 (ProcessBench):**

      * [cite\_start]GSM8K, MATH, Olympiad 등 다양한 데이터셋이 포함된 ProcessBench를 사용하여, 심판 모델이 추론의 첫 번째 오류 단계를 얼마나 정확하게 식별하는지 측정했습니다[cite: 294, 296].
      * ```
        * [cite_start]RL 훈련 여부, CoT 사용 여부, 데이터 밸런싱 여부 등에 대한 제거(Ablation) 연구를 통해 각 구성 요소의 기여도를 분석했습니다[cite: 323].
        ```

  * **추론 시 검색(Inference-Time Search) 성능 평가:**

      * [cite\_start]**Chunk-Reset Reasoning:** 추론 시 심판 모델이 현재 청크를 평가하고, 오류라고 판단되면 해당 청크를 버리고 다시 생성하는 방식을 적용했습니다[cite: 356, 359]. 이를 통해 전체 생성 길이를 유지하면서도 정답률을 높일 수 있는지 확인했습니다.

  * **데이터 선별(Data Selection) 및 모델 훈련:**

      * [cite\_start]STEPWISER 심판을 사용하여 정책 모델이 생성한 데이터 중 고품질 데이터를 선별하고, 이를 다시 정책 모델 훈련에 사용하여 성능이 향상되는지 검증했습니다[cite: 402, 406].

-----

### 5\. 논문에 사용된 데이터나 모델 아키텍처

  * [cite\_start]**기반 모델 (Base Models):** Qwen2.5-1.5B-it 및 Qwen2.5-7B-it 모델을 사용하여 정책 모델과 심판 모델을 모두 초기화했습니다[cite: 237].
  * [cite\_start]**훈련 데이터:** NuminaMath-CoT 데이터셋의 수학 문제들을 사용했습니다[cite: 238].
  * [cite\_start]**검증 도구:** 정답 확인을 위해 Math-Verify를 사용했습니다[cite: 237].
  * [cite\_start]**알고리즘:** 심판 모델의 최적화를 위해 **GRPO (Group Relative Policy Optimization)** 알고리즘을 사용했습니다[cite: 214].
  * [cite\_start]**자체 분할 훈련 데이터 생성:** Llama-3.1-70B-it 모델을 프롬프팅하여 기존 CoT를 논리적 청크로 분할하는 데이터를 생성하고 이를 기반 모델에 학습시켰습니다[cite: 247].

-----

### 6\. 논문의 Novelty (독창성)

  * [cite\_start]**메타 추론(Meta-Reasoning)의 도입:** 심판 모델이 단순히 분류만 하는 것이 아니라, "추론 과정에 대해 추론(reasoning about reasoning)"하도록 설계하여 평가의 정확도와 투명성을 높였습니다[cite: 11, 22].
  * [cite\_start]**온라인 RL 기반 심판 학습:** 정적인 SFT 데이터에 의존하는 기존 방식과 달리, 몬테카를로 롤아웃을 통해 얻은 고밀도의 단계별 신호를 사용하여 심판 모델을 온라인 강화학습으로 훈련시켰습니다[cite: 106, 302].
  * [cite\_start]**상대적 효율성 보상 (Relative Effective Reward):** 단계의 절대적인 품질뿐만 아니라, 해당 단계가 성공 확률을 얼마나 변화시켰는지(상대적 진척도)를 반영하는 라벨링 방식을 도입하여 더 효과적인 학습 신호를 제공했습니다[cite: 172, 424].
  * [cite\_start]**자체 분할(Self-Segmentation) 기술:** 추론 단계를 임의의 토큰(줄바꿈 등)이 아닌 논리적 완결성을 가진 청크 단위로 나누도록 모델을 훈련시켜 평가의 단위를 명확히 했습니다[cite: 140, 147].

-----

### 7\. 향후 연구 방향

  * [cite\_start]**긴 추론 모델(Thinking Models)에의 적용:** 현재 실험은 상대적으로 짧은 추론 과정에 집중되어 있으나, 연구진은 이 방법론이 수천 토큰 이상의 긴 추론 과정을 거치는 모델(예: DeepSeek-R1 등)에 더욱 유용할 것으로 예상하며 이를 향후 과제로 남겼습니다[cite: 260, 262].
  * [cite\_start]**RL 훈련 안정성 개선:** 이진 분류(정답/오답) 문제에서 RL 훈련 시 엔트로피가 급격히 낮아지는 문제를 해결하기 위해 현재는 'clip higher' 기술을 사용했으나, 더 발전된 기법(예: Diverse Preference Optimization 등)을 적용하여 훈련 안정성을 높일 수 있을 것으로 기대합니다[cite: 280, 281].

-----

### 8\. 논문의 결론

[cite\_start]이 논문은 추론 모델의 성능을 극대화하기 위해 모델이 자신의 내부 사고 과정을 다시 한번 추론하도록 만드는 것이 효과적임을 증명했습니다[cite: 430]. 논문의 결론은 다음과 같이 요약됩니다:

1.  [cite\_start]**STEPWISER 레시피의 효과:** (1) 사고의 청크 분할(Chunks-of-Thought), (2) 롤아웃의 상대적 결과에 기반한 보상 할당, (3) RL을 이용한 생성형 심판 훈련으로 이어지는 일련의 과정이 매우 효과적임이 입증되었습니다[cite: 431, 432].
2.  [cite\_start]**성능 우위:** STEPWISER는 기존의 SFT 기반 분류기나 결과 중심의 RL 모델보다 ProcessBench 평가에서 월등히 높은 정확도를 보였습니다[cite: 302, 313].
3.  [cite\_start]**실질적 유용성:** 이 심판 모델은 추론 시 탐색(Inference-time search)을 통해 더 나은 답변을 생성하게 하거나, 더 나은 훈련 데이터를 선별하여 정책 모델 자체를 개선하는 데에도 유용하게 사용될 수 있습니다[cite: 433].

**Would you like me to identify the specific hyperparameters used for the GRPO algorithm or explain the 'Chunks-of-Thought' segmentation rules in more detail?**



