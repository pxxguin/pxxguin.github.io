---
title: Start with RLHF Algorithms
published: 2025-11-25
description: Training language models to follow instructions with human feedback에 대한 리뷰입니다.
tags: [Paper Review]
category: Paper
draft: true
---

### 🤦🏻‍♂️ 들어가기에 앞서...
요즘에는 RLVR(Reinforcement Learning with Verifiable Rewards) 등과 같은 강화학습 알고리즘을 사용하는 것도 사실이지만, 가장 많이 사용되었고 지금도 쓰이는 RLHF(Reinforcement Learning with Human Feedbacks)에 대해서 배워보도록 합시다. 총 68개의 페이지로 되어있고, 설명할 내용이 많을 것 같기는 한데, 한번 천천히 리뷰해보자구요. [논문](https://arxiv.org/pdf/2203.02155)을 통해 많은것들을 배울 수 있기를 바랍니다.


### Abstract
일반적으로 큰 모델을 만든다고 해서, 사용자가 만족하는 좋은 성능을 보이는 것은 아닙니다. 때로는 할루시네이션(Hallucination)과 같은 있지 않는 정보를 생성하기도 했죠. 따라서 OpenAI 연구진들은 파인튜닝(fine=tuning) 과정에서 사용자의 피드백을 반영하는 알고리즘을 제안한거죠. 사용한 데이터셋 부분은 건너뛸게요. 결과 모델을 InstructGPT라고 부르는데, 13억 개의 파라미터를 가진 InstructGPT 모델이 GPT-3보다 100배 더 적은 파라미터를 가짐에도 선호되어지는거죠. 그리고 InstructGPT는 더 진실되고, Benchmark에 대해서 약간의 향상도를 보여주는 특징을 가지고 있습니다.

### Introduction
OpenAI 개발진들은 모델의 할루시네이션(논문에서는 toxic으로 설명을 하는데, 그냥 할루시네이션을 생각하면 됩니다.) 문제를 줄이고자 보상 모델을 만들기 시작합니다. 보상 모델은 지도 학습으로 이루어지는데, PPO(Proximal Policy Optimization)을 이용하여 보상이 최대로 이루어지도록 학습을 진행합니다.

기존 GPT-3 모델의 경우 175B의 파라미터를 가지고 있었지만, RLHF를 이용한 InstructGPT의 경우 파라미터 개수가 100배 이상 줄어들었다는 장점과 함께 Labelers들이 선호한다는 부분도 긍정적인 취지인거죠.



:::tip
대부분 논문에서 Abstract 부분에 실험을 설계하게 된 이유, 결과 등 중요한 내용들이 포함될 확률이 높습니다. 시간이 없는 사람이라면 Abstract, 실험 결과만 봐도 대충 논문의 내용은 알 수 있죠.
:::